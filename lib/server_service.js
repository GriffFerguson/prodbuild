const fs = require('fs')
const open = require('open')
const http = require('http')
const path = require('path')
const pb = require("./config.js");

const root = process.argv[2] // Full file path to entry point
const port = process.argv[3] // Port to run server at
// const config = require(path.join(pb.prc, "config.json"));

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
    if (req.url.startsWith('/_prodbuild')) {
        isDebug = true;
        req.url = path.join(pb.prc, "log.txt");
    }

    // Processing
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
            try {
                //ts = !ts ? require("typescript") : ts;
                pb.log(`Converting TypeScript file ${requestURL} to JavaScript`, "info");
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
            } catch (err) {
                pb.log("Could not serve TypeScript content. Ensure the TypeScript npm package is installed correctly. More info:\n" + process.cwd() + "\n" + err, "error")
            }
        }
    }

    // Serve content
    res.writeHead(200);
    res.write(Buffer.from(fetchFile, "hex"));
    res.end();
}).listen(port)
server.addListener('close', () => {
    pb.log('Server connection closed', "status")
})
server.addListener('error', (err) => {
    pb.log(err, "error")
})


open(`http://localhost:${port}/`)
pb.log('Server successfully spawned', "status")