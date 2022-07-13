const fs = require('fs')
const open = require('open')
const http = require('http')
const path = require('path')
const ts = require('typescript');

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
    log(`LOG: Received request, "${req.url}"`);
    var requestURL = req.url;
    var isDebug = false;
    // Redirects
    if (req.url.endsWith('/')) {
        req.url += 'index.html';
    }
    if (req.url.startsWith('/prodbuild')) {
        isDebug = true;
        req.url = path.join(config.home, '.prodbuildrc/log.txt');
    }

    // Caching
    if (!isDebug) {
        var fetchFile;
        try {
            fetchFile = fs.readFileSync(path.join(root, req.url), {encoding:'hex'});
        } catch(error) {
            log(`ERROR: File "${req.url}" does not exist`);
            fetchFile = errorPage;
            res.writeHead(404);
            res.write(errorPage);
            res.end();
            return;
        }
        var ext = path.extname(req.url)
        if (path.extname(req.url) == '.ts') {
            log(`LOG: Converting TypeScript file ${req.url} to JavaScript`);
            fetchFile = Buffer.from(fetchFile, 'hex').toString('utf8')
            fetchFile = (ts.transpileModule(fetchFile, {
                compilerOptions: {
                    module: ts.ModuleKind.CommonJS,
                    target: ts.ScriptTarget.ES2017,
                    sourceMap: false
                }
            })).outputText;
            fetchFile = Buffer.from(fetchFile, 'utf8').toString('hex')
            ext = '.js';
        }
        buildFile(path.join(cacheDir, req.url), fetchFile, ext);
        req.url = path.join(cacheDir, req.url);
    }

    // Serve content
    var stream = fs.createReadStream(req.url)
    stream.on('error', (err) => {
        log(`ERROR: ${err}`)
        res.write(errorPage)
        res.end()
    })
    stream.on('open', (data) => {
        res.writeHead(200)
        stream.pipe(res)
        log(`LOG: Request resolved for file "${requestURL}"`)
    })
}).listen(port)
server.addListener('close', () => {
    log('--- Server connection closed ---')
})
server.addListener('error', (err) => {
    log('ERROR: ', err)
})


open(`http://localhost:${port}/`)
log('STATUS: Server successfully spawned')

function buildFile(file, data, ext) {
    var dir = (file.split('.prodbuildrc/cache/')[1]).split('/')
    fileName = dir.at(-1)
    fileName = fileName.replace(path.extname(fileName), ext)
    dir.pop()
    var folderPath = cacheDir
    for (folder of dir) {
        folderPath = path.join(folderPath, folder)
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath)
        }
    }
    fs.writeFileSync(file, Buffer.from(data, 'hex'))
}