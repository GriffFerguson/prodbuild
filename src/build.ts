import * as fs from "fs";
import * as path from "path";
import {minify as terser} from "terser";
import * as minify from "./minify";
import * as pb from "./config";
import {exec} from "child_process";

const config = new pb.Config();

class File {
    name: string // File name and extension
    path: string; // Path to file relative to input directory
    fullPath: string; // name + path
    isDirectory: boolean;
    ext: string; // File extension
    data: string; // Contents of the file

    constructor(name: string, filePath: string) {
        this.name = name; 
        this.path = filePath; 
        this.fullPath = path.join(filePath, name); 
        this.isDirectory = fs.statSync(this.fullPath).isDirectory();
        this.ext = path.extname(this.fullPath);
        this.data = "";
    }

    addData(content: string): void {
        this.data = content;
    }
}

// Attempt to compile TypeScript files
var runTS = exec("tsc", {cwd: pb.root}, (err, stdout, stderr) => {
    if (err)
        pb.log("Could not build TypeScript files. Either none are present or a tsconfig file is missing in the project root folder (" + pb.root + ").", "error")
});

runTS.on("spawn", () => {
    pb.log("Running TypeScript compiler", "info");
})

// Searches input directory for all files
function findFiles(origin: string): Array<File> {
    var i = 0; // Counter for the `searcher` function
    var discoveredFiles: Array<File> = []; // Array of files collected
    var dir = fs.readdirSync(origin, {withFileTypes: false, encoding: "utf-8"}); // List of files/directories in the current directory

    // Recursive finder to process each file located in the `dir` array
    function searcher() {
        var file = new File(dir[i], origin )
        // console.log(file.fullPath, checkExclude(file.fullPath))

        if (!checkExclude(file.fullPath)) {
            if (file.isDirectory) {     // Enter sub directory and search for more files if the path is a directory
                discoveredFiles = discoveredFiles.concat(findFiles(file.fullPath))
            } else {                    // Encode the file
                var reqdFile = fs.readFileSync(file.fullPath, {
                    encoding: file.ext == '.html' || file.ext == '.htm' || file.ext == '.css' || file.ext == '.js' || file.ext == '.ts' ? 'utf8' : 'hex' // Encode certain files as utf8 for text processing. Otherwise it can be stored as hex
                });
                file.addData(reqdFile);
                discoveredFiles.push(file)
            }
        } else pb.log(`Ignoring '${file.name}'`, "info")
        if (i < dir.length - 1) {
            i++;
            searcher();
        } else return;
    }
    searcher()
    // console.table(files)
    return discoveredFiles;
}

runTS.on("exit", () => {
    var files = findFiles(config.entry);

    if (!fs.existsSync(config.output)) fs.mkdirSync(config.output)
    else {
        fs.rmSync(config.output, {recursive: true})
        fs.mkdirSync(config.output)
    }
    pb.log(`Building website from ${config.entry} to ${config.output}`, "status");
    
    for (var file of files) {
        pb.log(`Processing '${file.name}'`, "info")
        if (file.ext == '.js') {
            // JavaScript
            jsMinify(file)
        } else if (file.ext == '.css') {
            // CSS
            cssMinify(file)
        } else if (file.ext == '.html' || file.ext == '.htm') {
            // HTML
            htmlMinify(file)
        } else {
            createFile({dir: path.normalize(file.path.split('src')[1]), name: file.name}, Buffer.from(file.data, 'hex'))
        }
    }
})

async function jsMinify(file: File) {
    var minified = await terser(file.data, {mangle: true, compress: true})
    createFile({dir: path.normalize(file.path.split('src')[1]), name: file.name}, Buffer.from(minified.code!, 'utf8'))
}

async function htmlMinify(file: File) {
    var minified = minify.html(file.data)
    createFile({dir: path.normalize(file.path.split('src')[1]), name: file.name}, Buffer.from(minified, 'utf8'))
}

async function cssMinify(file: File) {
    var minified = minify.css(file.data)
    createFile({dir: path.normalize(file.path.split('src')[1]), name: file.name}, Buffer.from(minified, 'utf8'))
}


function buildDirectory(dirPath: string) {
    var dir = (dirPath.replace(pb.root, "")).split('/');
    var folderPath = pb.root;
    for (var folder of dir) {
        // console.log(`Making directory ${folderPath}`)
        folderPath = path.join(folderPath, folder)
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath)
        }
    }
}

function checkExclude(fileName: string) {
    for (var file of config.exclude) {
        if (fileName.indexOf(path.normalize(file)) != -1) return true
    }
    return false
}

// Output compiled file
function createFile(file: { dir: string, name: string }, code: Buffer) {
    // Ensure directory exists
    buildDirectory(path.join(config.output, file.dir))
    
    // Create file
    fs.writeFile(
        path.join(config.output, file.dir, file.name), code, 
        (err) => {
            if (err) pb.log(`Could not create file "${file.name}" at ${file.dir}.\nDetails: ${(err.toString().split('Error: ')[1])}`, "error")
        }
    )
    pb.log(`Built file '${file.name}'`, "info")
}