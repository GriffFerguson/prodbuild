const fs = require('fs')
const open = require('open')
const http = require('http')
const path = require('path')
const pb = require("./config.js");
const {exec} = require("child_process");

const root = process.argv[2] // Full file path to entry point
const port = process.argv[3] // Port to run server at
// const config = require(path.join(pb.prc, "config.json"));

const errorPage = fs.readFileSync(path.join(__dirname, './assets/error.html'), {encoding: 'utf8'})
// const injection = fs.readFileSync(path.join(__dirname, './assets/ws.js'), {encoding: 'hex'})

pb.log(`New server instance started (pid: ${process.pid}, port: ${port})`, "status");

// Attempt to compile TypeScript files
exec("tsc", {cwd: pb.root}, (err, stdout, stderr) => {
    if (err)
        pb.log("Could not build TypeScript files. Either none are present or a tsconfig file is missing in the project root folder (" + pb.root + ").")
})

const server = http.createServer((req, res) => {
    pb.log(`Received request, "${req.url}"`, "info");
    //var requestURL = req.url;
    var isDebug = false;
    // Redirects
    if (req.url.endsWith('/')) {
        req.url += 'index.html';
    }

    var fetchFile;

    if (req.url.startsWith('/_prodbuild')) {
        isDebug = true;
        
        if(req.url.endsWith("/log")) {
            fetchFile = fs.readFileSync(path.join(pb.prc, "log.txt"), {encoding:'hex'});
        } else {
            fetchFile = Buffer.from(errorPage, "utf8").toString("hex");
        }
        // else if(req.url.endsWith("/wsi")) {
        //     req.url = injection;
        // } else if(req.url.endsWith("/socket")) {
        //     res.writeHead(426, {
        //         "Content-Type": "text/plain",
        //         "Upgrade": "websocket"
        //     })
        // }
        
    }

    // Processing
    if (!isDebug) {
        try {
            fetchFile = fs.readFileSync(path.join(root, req.url), {encoding:'hex'});
            // if (path.extname(req.url) == ".html" || path.extname(req.url) == ".htm") {
            //     fetchFile = Buffer.from(fetchFile, "hex").toString("utf8").split("</body>");
            //     fetchFile = (fetchFile[0] + "\n<!-- Injected by Prodbuild -->\n<script src=\"/_prodbuild/wsi\"></script>\n" + fetchFile[1]).toString("hex");
            // }
        } catch(error) {
            pb.log(`File "${req.url}" does not exist`, "error");
            fetchFile = errorPage;
            res.writeHead(404);
            res.write(errorPage);
            res.end();
            return;
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


// // Listen for WebSocket via HTTP Upgrade
// server.addListener("upgrade", (req, socket) => {
//     if (req.headers.upgrade != "websocket") {
//         socket.writeHead(400);
//         socket.end();
//     }
// 
//     socket.write()
// })


// Open homepage in browser
pb.log(`Started server at http://localhost:${port}/`, "status")