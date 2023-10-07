import * as fs from "fs";
import {join} from "path";

// The project root directory
var root: string = "";

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
const log = (message: string, level: string) => {
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
    var mill: string;
    if (dt.getMilliseconds() < 100) {
        mill = '0' + dt.getMilliseconds();
        if (dt.getMilliseconds() < 10) {
            mill = '0' + mill
        }
    } else mill = dt.getMilliseconds().toString();
    var stamp = {
        date: `${dt.getMonth() < 9 ? ('0' + (dt.getMonth() + 1)) : (dt.getMonth() + 1)}-${dt.getDate() < 10 ? ('0' + dt.getDate()) : dt.getDate()}-${dt.getFullYear()}`,
        time: `${dt.getHours() < 10 ? '0' + dt.getHours().toString() : dt.getHours()}:${dt.getMinutes() < 10 ? '0' + dt.getMinutes().toString() : dt.getMinutes()}:${dt.getSeconds() < 10 ? ('0' + dt.getSeconds().toString()) : dt.getSeconds()}.${mill}`
    };
    var prefix: string = "";
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
class Config {
    output: string;
    entry: string;
    port: number;
    exclude: Array<string>;

    constructor() {
        var path = join(root, "build.config.json")
        var file;
        if (fs.existsSync(path)) file = JSON.parse( fs.readFileSync(path, {encoding: "utf-8"}) );
        else log(`No "build.config.json" was found; default values will be used for now. Create a config file using 'npx prodbuild init'`, "error");

        this.output = join(root, file.output) || join(root, "./src/");
        this.entry = join(root, file.entry) || join(root, "./dist/");
        this.port = file.port || 5000;
        this.exclude = file.exclude || [];
        this.exclude.push(".ts");
    }
}
module.exports.Config = Config;