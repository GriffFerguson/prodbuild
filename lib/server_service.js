const fs = require('fs')
const open = require('open')
const http = require('http')
const path = require('path')
const ts = require('typescript');
const pb = require("./config.js");

const root = process.argv[2] // Full file path to entry point
const port = process.argv[3] // Port to run server at
const config = require(path.join(pb.prc, "config.json"));

const errorPage = fs.readFileSync(path.join(__dirname, './assets/error.html'), {encoding: 'utf8'})

pb.log(`New server instance started (pid: ${process.pid}, port: ${port})`, "status");
const server = http.createServer((req, res) => {
    pb.log(`Received request, "${req.url}"`, "info");
    var requestURL = req.url;
    var isDebug = false;
    // Redirects
    if (req.url.endsWith('/')) {
        req.url += 'index.html';
    }
    if (req.url.startsWith('/prodbuild')) {
        isDebug = true;
        req.url = path.join(pb.prc, "log.txt");
    }

    // Caching
    if (!isDebug) {
        var fetchFile;
        try {
            fetchFile = fs.readFileSync(path.join(root, req.url), {encoding:'hex'});
        } catch(error) {
            pb.log(`File "${req.url}" does not exist`, "error");
            fetchFile = errorPage;
            res.writeHead(404);
            res.write(errorPage);
            res.end();
            return;
        }
        // var ext = path.extname(req.url)
        if (path.extname(req.url) == '.ts') {
            log(`LOG: Converting TypeScript file ${requestURL} to JavaScript`);
            fetchFile = Buffer.from(fetchFile, 'hex').toString('utf8')
            fetchFile = (ts.transpileModule(fetchFile, {
                compilerOptions: {
                    module: ts.ModuleKind.CommonJS,
                    target: ts.ScriptTarget.ES2017,
                    sourceMap: false
                }
            })).outputText;
            fetchFile = Buffer.from(fetchFile, 'utf8').toString('hex')
            res.setHeader("Content-Type","application/javascript")
        }
        // buildFile(path.join(cacheDir, requestURL), fetchFile, ext);
        // req.url = path.join(root, requestURL);
    }

    // Serve content
    /* var stream = fs.createReadStream(req.url)
    stream.on('error', (err) => {
        log(`ERROR: ${err}`)
        res.write(errorPage)
        res.end()
    })
    stream.on('open', (data) => {
        res.writeHead(200)
        stream.pipe(res)
        log(`LOG: Request resolved for file "${requestURL}"`)
    }) */
    res.writeHead(200);
    res.write(fetchFile)
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