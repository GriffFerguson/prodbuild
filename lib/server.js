const fs = require('fs')
const path = require('path')
const {spawn} = require('child_process')

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
    root = process.argv[2] == '--prod' ? config.output : config.entry
    spawnServer();
}



function spawnServer() {
    console.log('Spawning server')
    var server = spawn('node', ['node_modules/prodbuild/lib/server_service.js', config.entry, config.port], {detached: true})
    server.on('error', console.error)
    fs.mkdirSync('./prodbuildrc')
    server.on('spawn', () => {
        fs.writeFileSync('./prodbuildrc/config.json', `{"pid": "${server.pid}", "port": ${config.port}, "entry": "${root}, "home": "${path.join('../../../',__dirname)}"}`)
        console.log(server.pid)
        console.log(`Started server with root of './${root}' at port ${port}`)
    })
}