const fs = require('fs');
const {join} = require('path');

// The project root directory
var root = "";

// Find the location of the project root directory
// The project root directory is where ever the build.config.json file is located
var isRootDir = false;
var searchDir = process.cwd();
var prevDir = ""
do {
    if (fs.existsSync(join(searchDir,"/build.config.json"))) {
        isRootDir = true;
        root = searchDir;
    } else {
        if (searchDir == prevDir) {
            isRootDir = true;
            root = process.cwd();
        } else {
            searchDir = join(searchDir, "../")
        }
    }
    prevDir = searchDir;
} while (!isRootDir)

module.exports.root = root;

// The directory for the .prodbuildrc folder
const prc = join(root, ".prodbuildrc/");
module.exports.prc = prc;

// Checks for the existence of the .prodbuildrc in the root project directory
const check_rc = () => {
    if (!fs.existsSync(prc)) {
        fs.mkdirSync(prc);
    }
}
module.exports.check_rc = check_rc;

/* LOGGING LEVELS:
 * INFO: normal information of program functionality
 * STATUS: information about start/stop of program functions (ex: server start, server stop)
 * ERROR: something went wrong, here's the reason
 */
const log = (message, level) => {
    check_rc();
    var logDir = join(prc, "log.txt");
    console.log(logDir)
    if (!fs.existsSync(logDir)) {
        fs.writeFileSync(
            logDir, 
            "Prodbuild Log File\n------------------------", 
            {encoding: "utf-8"}
        );
    }
    var dt = new Date();
    var mill = dt.getMilliseconds();
    if (mill < 100) {
        mill = '0' + mill.toString()
        if (mill < 10) {
            mill = '0' + mill
        }
    }
    var stamp = {
        date: `${dt.getMonth() < 9 ? ('0' + (dt.getMonth() + 1)) : (dt.getMonth() + 1)}-${dt.getDate() < 10 ? ('0' + dt.getDate()) : dt.getDate()}-${dt.getFullYear()}`,
        time: `${dt.getHours()}:${dt.getMinutes() < 10 ? '0' + dt.getMinutes().toString() : dt.getMinutes()}:${dt.getSeconds() < 10 ? ('0' + dt.getSeconds().toString()) : dt.getSeconds()}.${mill}`
    };
    if (level == "info") prefix = "INFO:"
    else if (level == "error") prefix = "ERROR:"
    else if (level == "status") prefix = "STATUS:";
    fs.appendFileSync(
        logDir,
        `\n[${stamp.date} ${stamp.time}]  ${prefix} ${message}`,
        {encoding: "utf-8"}
    );
    console.log(`${prefix} ${message}`)
}
module.exports.log = log;

// Retrieve the config from the build.config.json file in the project root
// If there is no build.config.json, the default values will be substituted
const config = () => {
    var configPath = join(root, "build.config.json");
    var configFile;

    if (fs.existsSync(configPath)) {
        configFile = fs.readFileSync(configPath, {encoding: "utf-8"});
        configFile = JSON.parse(configFile);
    } else {
        log(`No "build.config.json" was found; default values will be used for now`, "error");
        configFile = {
            "output": "./dist/",
            "entry": "./src/",
            "port": 5000,
            "exclude": []
        }
    }
    return configFile;
}
module.exports.config = config;