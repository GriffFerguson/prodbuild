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
    if (req.url.endsWith('.log')) {
        req.url = '../.prodbuildrc/log.txt'
    }
    log(`LOG: Received request, "${req.url}"`)
    req.url = path.resolve(path.join(root, req.url))
    var stream = fs.createReadStream(req.url)
    stream.on('error', (err) => {
        log(`ERROR: ${err}`)
        res.writeHead(404)
        res.write(errorPage)
        res.end()
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

open(`http://localhost:${port}/`)
log('STATUS: Server successfully spawned')