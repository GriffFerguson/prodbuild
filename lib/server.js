const http = require('http')
const fs = require('fs')
const path = require('path')

var config;
var config;
fs.readFile('./build.config.json', {encoding: 'utf8'}, (err, data) => {
    if (err) {console.log(err)}
    console.log('Loaded build config')
    config = JSON.parse(data)
    config.entryRoot = path.normalize(config.entryRoot)
    config.output = path.normalize(config.output)
})

console.log('Started server at port 3000')
http.createServer((req, res) => {
    fs.createReadStream(path.join(config.output, req.url), (err, data) => {
        if (err) {
            console.log(err)
            res.writeHead(404)
            res.write(`<h1>Error</h1><p><strong>Unable to access file at ${req.url}</strong></p>`)
        } else {
            res.write(data)
            console.log(`Request completed, "${req.url}"`)
        }
    })
}).listen(3000)