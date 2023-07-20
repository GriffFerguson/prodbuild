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
        time: `${dt.getHours() < 10 ? '0' + dt.getHours().toString() : dt.getHours()}:${dt.getMinutes() < 10 ? '0' + dt.getMinutes().toString() : dt.getMinutes()}:${dt.getSeconds() < 10 ? ('0' + dt.getSeconds().toString()) : dt.getSeconds()}.${mill}`
    };
    // message = message.replace(/\\n/gm)
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
        // No config file exists
        log(`No "build.config.json" was found; default values will be used for now. Create a config file using 'npx prodbuild init'`, "error");
        configFile = {
            "output": join(root, "./dist/"),
            "entry": join(root, "./src/"),
            "port": 5000,
            "exclude": [".ts"]
        }
        // Exit with default values
        return configFile;
    }

    configFile.output = join(root, configFile.output);
    configFile.entry = join(root, configFile.entry);
    configFile.port = parseInt(configFile.port);

    // Individual error checking if config file does exist
    if (!configFile.output || !fs.existsSync(configFile.output)) {
        log(`Invalid 'output' in build.config.json. Either no value exists or the path ${configFile.output} does not exist. Using default value for now.`, "error");
        configFile.output = join(root, "./dist/")
    }
    if (!configFile.entry || !fs.existsSync(configFile.entry)) {
        log(`Invalid 'entry' in build.config.json. Either no value exists or the path ${configFile.entry} does not exist. Using default value for now.`, "error");
        configFile.entry = join(root, "./src/")
    }
    if (!configFile.port || !Number.isInteger(configFile.port)) {
        log(`Invalid 'port' in build.config.json. Either no value exists or the provided value is not a valid integer. Using default for now.`, "error");
        configFile.port = 5000;
    }
    if (!configFile.exclude) {
        configFile.exclude = [];
    }
    configFile.exclude.push(".ts")


    return configFile;
}
module.exports.config = config;