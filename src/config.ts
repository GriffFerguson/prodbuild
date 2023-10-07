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

/* LOGGING LEVELS:
 * INFO: normal information of program functionality
 * STATUS: information about start/stop of program functions (ex: server start, server stop)
 * ERROR: something went wrong, here's the reason
 */
const log = (message: string, level: string) => {
    var prefix: string = "";
    if (level == "info") prefix = "INFO:"
    else if (level == "error") prefix = "ERROR:"
    else if (level == "status") prefix = "STATUS:";
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