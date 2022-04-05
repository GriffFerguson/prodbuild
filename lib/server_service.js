const fs = require('fs')
const open = require('open')
const http = require('http')
const path = require('path')
const ts = require('typescript')

const root = process.argv[2]
const port = process.argv[3]
const config = require(path.resolve(path.join(root, '../'), './.prodbuildrc/config.json'))

const errorPage = fs.readFileSync(path.join(__dirname, './assets/error.html'), {encoding: 'utf8'})

const logDir = path.join(config.home, './.prodbuildrc/log.txt')
const cacheDir = path.join(config.home, './.prodbuildrc/cache')
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
    log(`LOG: Received request, "${req.url}"`)
    // Redirects
    if (req.url.endsWith('/')) {
        req.url += 'index.html'
    }
    if (req.url.endsWith('.log')) {
        req.url = '../.prodbuildrc/log.txt'
    }

    // Caching
    var fetchFile = fs.readFileSync(path.join(root, req.url), {encoding:'utf8'})
    if (path.extname(req.url) == '.ts') {
        fetchFile = (ts.transpileModule(fetchFile, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS, 
                target: ts.ScriptTarget.ES2017, 
                sourceMap: false
            }
        })).outputText
        req.url = req.url.replace('.ts', '.js')
    }
    buildFile(path.join(cacheDir, req.url), fetchFile)

    // Serve content
    req.url = path.join(root, req.url)
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

function buildFile(file, data) {
    var dir = (file.split('.prodbuildrc/cache/')[1]).split('/')
    fileName = dir.at(-1)
    dir.pop()
    var folderPath = ''
    for (folder of dir) {
        // console.log(`Making directory ${folderPath}`)
        folderPath = path.join(cacheDir, folderPath, folder)
        console.log(folderPath)
        if (!fs.existsSync(folderPath)) {
            console.log(folder)
            fs.mkdirSync(folderPath)
        }
    }
    console.log(file, fileName, data)
    fs.writeFileSync(file, data)
}