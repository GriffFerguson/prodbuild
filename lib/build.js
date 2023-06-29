const fs = require('fs')
const path = require('path')
const jsTerser = require('terser')
const minify = require('./minify.js')
const pb = require('./config.js');

const config = pb.config();

class File {
    constructor(name, path, fullPath, isDirectory, ext, data) {
        this.name = name; // File name and extension
        this.path = path; // Path to file relative to input directory
        this.fullPath = fullPath; // name + path
        this.isDirectory = isDirectory;
        this.ext = ext; // File extension
        this.data = data; // Encoded file contents
    }
}

// Output compiled files
function createFile(file, code) {
    // console.log(path.join(config.output, file.dir, file.name))
    buildDirectory(path.join(config.output, file.dir))
    fs.writeFile(
        path.join(config.output, file.dir, file.name), code, 
        (err) => {
            if (err) 
                pb.log(`Could not create file "${file.name}" at ${file.dir}.\nDetails: ${(err.toString().split('Error: ')[1])}`, "error")
        }
    )
    pb.log(`Built file '${file.name}'`, "info")
}

// Searches input directory for all files
function findFiles(origin) {
    var i = 0; // Counter for the `searcher` function
    var discoveredFiles = []; // Array of file paths to be processed
    var dir = fs.readdirSync(origin, {withFileTypes: false}); 

    // Recursive finder to process each file located in the `dir` array
    function searcher() {
        var file = new File(
            dir[i],
            origin,
            path.join(origin, dir[i]),
            fs.statSync(path.join(origin, dir[i])).isDirectory(),
            path.extname(dir[i])
        )
        // console.log(file.fullPath, checkExclude(file.fullPath))
        if (!checkExclude(file.fullPath)) {
            if (file.isDirectory) {     // Enter sub directory and search for more files if the path is a directory
                discoveredFiles = files.concat(findFiles(file.fullPath))
            } else {                    // Encode the file
                var reqdFile = fs.readFileSync(file.fullPath, {encoding: 
                    file.ext == '.html' || file.ext == '.htm' || file.ext == '.css' || file.ext == '.js' || file.ext == '.ts' ? 'utf8' : 'hex'})  // Encode certain files as utf8 for text processing. Otherwise it can be stored as hex
                files.push({meta: file, data: reqdFile})
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

var files = findFiles(config.entry);
if (!fs.existsSync(config.output)) fs.mkdirSync(config.output)
fs.rmSync(config.output, {recursive: true})
fs.mkdirSync(config.output)
pb.log(`Building website from ${config.entry} to ${config.output}`, "status");

for (file of files) {
    pb.log(`Processing '${file.meta.name}'`, "info")
    if (file.meta.ext == '.js') {
        // JavaScript
        jsMinify(file)
    } else if (file.meta.ext == '.ts') {
        //TypeScript
        tsMinify(file)

    } else if (file.meta.ext == '.css') {
        // CSS
        cssMinify(file)
    } else if (file.meta.ext == '.html' || file.meta.ext == '.htm') {
        // HTML
        htmlMinify(file)
    } else {
        createFile({dir: path.normalize(file.meta.path.split('src')[1]), name: file.meta.name}, Buffer.from(file.data, 'hex'))
    }
}

async function jsMinify(file) {
    var minified = await jsTerser.minify(file.data, {mangle: true, compress: true})
    createFile({dir: path.normalize(file.meta.path.split('src')[1]), name: file.meta.name}, Buffer.from(minified.code, 'utf8'))
}

async function tsMinify(file) {
    file.data = (ts.transpileModule(file.data, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS, 
            target: ts.ScriptTarget.ES2017, 
            sourceMap: false
        }
    })).outputText
    file.meta.ext = '.js'
    file.meta.name = file.meta.name.split('.ts')[0] + '.js'
    file.meta.fullPath = path.join(file.meta.path, file.meta.name)

    jsMinify(file)
}

async function htmlMinify(file) {
    var minified = minify.html(file.data)
    createFile({dir: path.normalize(file.meta.path.split('src')[1]), name: file.meta.name}, Buffer.from(minified, 'utf8'))
}

async function cssMinify(file) {
    var minified = minify.css(file.data)
    createFile({dir: path.normalize(file.meta.path.split('src')[1]), name: file.meta.name}, Buffer.from(minified, 'utf8'))
}


function buildDirectory(dir) {
    dir = (dir.replace(pb.root, "")).split('/');
    var folderPath = pb.root;
    for (folder of dir) {
        // console.log(`Making directory ${folderPath}`)
        folderPath = path.join(folderPath, folder)
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath)
        }
    }
}

function checkExclude(fileName) {
    if (config.exclude != undefined) {
        for (file of config.exclude) {
            if (fileName.indexOf(path.normalize(file)) != -1) return true
        }
    }
    return false
}