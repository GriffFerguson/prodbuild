const fs = require('fs')
const path = require('path')
const jsTerser = require('terser')
const ts = require('typescript')
const minify = require('./minify.js')
const pb = require('./config.js');

const config = pb.config();

class File {
    constructor(name, path, fullPath, isDirectory, ext, data) {
        this.name = name;
        this.path = path;
        this.fullPath = fullPath;
        this.isDirectory = isDirectory;
        this.ext = ext;
        this.data = data;
    }
}

function createFile(file, code) {
    // console.log(path.join(config.output, file.dir, file.name))
    buildDirectory(path.join(config.output, file.dir))
    fs.writeFile(path.join(config.output, file.dir, file.name), code, (err) => {if (err) pb.log(`Could not create file "${file.name}" at ${file.dir}.\nDetails: ${(err.toString().split('Error: ')[1])}`, "error")})
    pb.log(`Built file '${file.name}'`, "info")
}

function findFiles(origin) {
    var i = 0;
    var files = [];
    var dir = fs.readdirSync(origin, {withFileTypes: false});

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
            if (file.isDirectory) {
                files = files.concat(findFiles(file.fullPath))
            } else {
                var reqdFile = fs.readFileSync(file.fullPath, {encoding: 
                    file.ext == '.html' || file.ext == '.htm' || file.ext == '.css' || file.ext == '.js' || file.ext == '.ts' ? 'utf8' : 'hex'})
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
    return files;
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