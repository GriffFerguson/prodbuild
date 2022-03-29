const fs = require('fs')
const path = require('path')
const {spawn} = require('child_process');
const { time } = require('console');

const rc = fs.existsSync('.prodbuildrc') ? require(path.join(process.cwd(), './.prodbuildrc/config.json')) : {active:false, pid:undefined}

var root, config;

var stream = fs.createReadStream('./build.config.json', { encoding: 'utf8' })
stream.on('error', (err) => {
    console.warn('Could not read "build.config.json". Will resort to default values of:\nOutput: ./dist/\nEntry: ./src/\nPort: 5000\n');
    parseConfig(require('../build.config.json'), { encoding: 'utf-8' });
})
stream.on('data', parseConfig)

function parseConfig(data) {
    config = JSON.parse(data);
    console.log('Loaded build config');
    config.entry = path.normalize(config.entry);
    config.output = path.normalize(config.output);
    root = process.argv[3] == 'true' ? config.output : config.entry


    if (process.argv[4] == 'true') purgeLog()

    if (rc.active && process.argv[2] == 'start') {
        console.error(`Error: Cannot start server as there is already an active dev server`)
    } else if (process.argv[2] == 'start') {
        spawnServer();
    } else if (process.argv[2] == 'kill') {
        if (rc.pid != undefined && rc.active === true) {
            process.kill(rc.pid)
            console.log('Successfully shutdown server')

            // Log server shutdown
            var stamp = timestamp()
            fs.appendFileSync(
                '.prodbuildrc/log.txt',
                `\n[${stamp.date} ${stamp.time}]  --- Ended server instance ---`
            )

            // Change server status to inactive
            var newrc = fs.readFileSync('.prodbuildrc/config.json', {encoding:'utf-8'}).replace('"active": true', '"active": false')
            fs.writeFileSync('.prodbuildrc/config.json', newrc)
        } else {
            console.log('Error: Cannot stop server. There is either no server to be stopped or the \'.prodbuildrc/config.json\' file has been modified')
        }
    } else console.log(`Error: '${process.argv[2]}' is not a valid argument for command 'serve'`)
}

function spawnServer() {
    console.log('Spawning server')

    // Config files
    if (!fs.existsSync('./.prodbuildrc')) {
        fs.mkdirSync('./.prodbuildrc')
    }
    if (!fs.existsSync('./.gitignore') || (fs.readFileSync('./.gitignore', {encoding: 'utf-8'})).indexOf('.prodbuildrc') == -1) {
        fs.writeFileSync('./.gitignore', '\n# Automatically added by prodbuild\n/.prodbuildrc/')
    }
    if (!fs.existsSync('./.prodbuildrc/log.txt')) {
        fs.writeFileSync('./.prodbuildrc/log.txt', 'Prodbuild Dev Server Log\n------------------------')
    }
    var log = fs.openSync('./.prodbuildrc/log.txt')

    // Start background process
    const server = spawn(
        'node', 
        ['node_modules/prodbuild/lib/server_service.js', root, config.port], 
        {detached: true, stdio: ['ignore',log,log]}
    )
    server.on('spawn', () => {
        fs.writeFileSync('./.prodbuildrc/config.json', `{"pid": ${server.pid}, "port": ${config.port}, "entry": "${root}", "home": "${process.cwd()}", "active": true}`)
        console.log(`Started server with root of './${root}' at port ${config.port}`)
        server.unref()
    })
    server.on('error', console.log)
}

function purgeLog() {
    var stamp = timestamp()
    fs.writeFileSync('.prodbuildrc/log.txt',
        `Prodbuild Dev Server Log\n------------------------\n` +
        `[${stamp.date} ${stamp.time}]  --- Purged all logs ---`
    )
}

function timestamp() {
    var dt = new Date()
    var mill = dt.getMilliseconds()
    if (mill < 100) {
        mill = '0' + mill.toString()
        if (mill < 10) {
            mill = '0' + mill
        }
    }
    var stamp = {
        date: `${dt.getMonth() < 9 ? ('0' + (dt.getMonth() + 1)) : (dt.getMonth() + 1)}-${dt.getDate() < 10 ? ('0' + dt.getDate()) : dt.getDate()}-${dt.getFullYear()}`,
        time: `${dt.getHours()}:${dt.getMinutes() < 10 ? '0' + dt.getMinutes().toString() : dt.getMinutes()}:${dt.getSeconds() < 10 ? ('0' + dt.getSeconds().toString()) : dt.getSeconds()}.${mill}`
    }
    return stamp
}