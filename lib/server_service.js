const fs = require('fs')
const open = require('open')
const http = require('http')
const path = require('path')

const root = process.argv[2]
const port = process.argv[3]

const errorPage = fs.readFileSync(path.join(__dirname, './assets/error.html'), {encoding: 'utf8'})


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
}).listen(port)
setTimeout(async () => { await open(`http://localhost:${port}/`) }, 3000)