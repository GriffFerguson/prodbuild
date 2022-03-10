const http = require('http')
const fs = require('fs')
const path = require('path')
const open = require('open')

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
    server();
}

const errorPage = fs.readFileSync(path.join(__dirname, './assets/error.html'), {encoding: 'utf8'})

function server() {
    http.createServer((req, res) => {
        if (req.url.endsWith('/')) {
            req.url += 'index.html'
        }
        console.log(`Received request, "${req.url}"`)
        req.url = path.resolve(path.join(root, req.url))
        console.log(req.url)
        var stream = fs.createReadStream(req.url)
        stream.on('error', (err) => {
            console.log(`Request errored:\n${err}`)
            res.writeHead(404)
            res.write(errorPage)
        })
        stream.on('open', (data) => {
            res.writeHead(200)
            stream.pipe(res)
            console.log(`Request resolved`)
        })
    }).listen(config.port)
    console.log(`Started server with root of './${root}' at port ${config.port}`)
}

setTimeout(async () => { await open(`http://localhost:${config.port}/`) }, 3000)