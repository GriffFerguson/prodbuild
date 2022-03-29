const fs = require('fs')
const path = require('path')
const {spawn} = require('child_process')
const rc = require(path.join(process.cwd(), './.prodbuildrc/config.json'))

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
    console.log(process.argv)
    root = process.argv[3] == 'true' ? config.output : config.entry


    if (rc.active && process.argv[2] == 'start') {
        console.error(`Cannot start server as there is already an active dev server`)
    } else if (process.argv[2] == 'start') {
        spawnServer();
    } else if (process.argv[2] == 'kill') {
        process.kill(rc.pid)
    }
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