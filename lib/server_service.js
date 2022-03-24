const fs = require('fs')
const open = require('open')
const http = require('http')
const path = require('path')

const root = process.argv[2]
const port = process.argv[3]
const config = require(path.resolve(path.join(root, '../'), './.prodbuildrc/config.json'))

const errorPage = fs.readFileSync(path.join(__dirname, './assets/error.html'), {encoding: 'utf8'})

const logDir = path.join(config.home, './.prodbuildrc/log.txt')
function log(message) {
    var dt = new Date()
    var stamp = {
        date: `${dt.getMonth() + 1}-${dt.getDate()}-${dt.getFullYear()}`,
        time: `${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}.${dt.getMilliseconds()}`
    }
    fs.appendFileSync(
        logDir,
        `\n[${stamp.date} ${stamp.time}]  ${message}`,
    )
}

log(`--- New server instance started (pid: ${process.pid}, port: ${port}) ---`)
const server = http.createServer((req, res) => {
    if (req.url.endsWith('/')) {
        req.url += 'index.html'
    }
    log(`LOG: Received request, "${req.url}"`)
    req.url = path.resolve(path.join(root, req.url))
    var stream = fs.createReadStream(req.url)
    stream.on('error', (err) => {
        log(`ERROR: ${err}`)
        res.writeHead(404)
        res.write(errorPage)
    })
    stream.on('open', (data) => {
        res.writeHead(200)
        stream.pipe(res)
        log(`LOG: Request resolved`)
    })
}).listen(port)
server.addListener('close', () => {
    log('--- Server connection closed ---')
})
setTimeout(async () => { await open(`http://localhost:${port}/`) }, 3000)