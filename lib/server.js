const fs = require('fs')
const path = require('path')
const {spawn} = require('child_process');
const pb = require("./config.js")

const config = pb.config();
pb.check_rc();
const rcConfigPath = path.join(pb.prc, "config.json");
const rc = fs.existsSync(rcConfigPath) ? require(rcConfigPath) : {active:false, pid:null}

root = process.argv[3] == 'true' ? config.output : config.entry;


if (process.argv[4] == 'true') purgeLog()

if (rc.active && process.argv[2] == 'start') {
    console.error(`ERROR: Cannot start server as there is already an active dev server`)
} else if (process.argv[2] == 'start') {
    spawnServer();
} else if (process.argv[2] == 'kill') {
    if (rc.pid != null && rc.active === true) {
        try {
            process.kill(rc.pid)

            // Log server shutdown
            pb.log("Server successfully shutdown", "status");
        } catch(error) {
            console.error("ERROR: There is no server to shutdown, please try restarting the server.")
            rc.active = false;
            fs.writeFileSync(rcConfigPath, JSON.stringify(rc), {encoding: 'utf-8'});
        }
    } else {
        console.error('ERROR: Cannot stop server. There is either no server to be stopped or the \".prodbuildrc/config.json\" file has been manually modified/deleted.')
    }
} else console.error(`ERROR: "${process.argv[2]}" is not a valid argument for command "serve"`)


function spawnServer() {
    console.log('Spawning server')

    // Config files
    if (!fs.existsSync('./.gitignore')) {
        fs.writeFileSync('./.gitignore', '\n# Automatically added by Prodbuild\n/.prodbuildrc/')
    } else if (fs.readFileSync('./.gitignore', {encoding: 'utf-8'}).indexOf('.prodbuildrc') == -1) {
        fs.appendFileSync('./.gitignore', '\n# Automatically added by Prodbuild\n/.prodbuildrc/')
    }

    // Start background process
    const server = spawn(
        'node', 
        [path.join(pb.root, 'node_modules/prodbuild/lib/server_service.js'), root, config.port], 
        {detached: true, stdio: "ignore"}
    )
    server.on('spawn', () => {
        server.unref();
        console.log(`Started server with root of '${root}' at port ${config.port}`);
        fs.writeFileSync('./.prodbuildrc/config.json', `{"pid": ${server.pid}, "active": true}`);
    })
}

function purgeLog() {
    fs.rmSync(path.join(pb.prc, "log.txt"));
    pb.log("Purged logs", "status");
}