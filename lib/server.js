const http = require('http')
const fs = require('fs')
const path = require('path')
const open = require('open')

var config = fs.readFileSync('./build.config.json', {encoding: 'utf8'})
config = JSON.parse(config)
config.entryRoot = path.normalize(config.entryRoot)
config.output = path.normalize(config.output)
console.log(config)

const errorPage = fs.readFileSync(path.join(__dirname, './assets/error.html'), {encoding: 'utf8'})

http.createServer((req, res) => {
    if (req.url.endsWith('/')) {
        req.url += 'index.html'
    }
    console.log(`Received request, "${req.url}"`)
    req.url = path.resolve(path.join(config.output, req.url))
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
console.log('Started server at port ' + config.port)

setTimeout(async () => { await open(`http://localhost:${config.port}/`) }, 3000)