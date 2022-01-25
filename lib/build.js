const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const jsTerser = require('terser')
const htmlTerser = require('html-minifier-terser')
const csso = require('csso')

var config;
fs.readFile('./build.config.json', {encoding: 'utf8'}, (err, data) => {
    if (err) {console.error(err)}
    console.log('Loaded build config')
    config = JSON.parse(data)
    config.entryRoot = path.normalize(config.entryRoot)
    config.output = path.normalize(config.output)
    build()
})

function createFile(file, code) {
    // console.log('Creating file ' + file.name)
    buildDirectory(path.join(config.output, file.dir))
    fs.writeFile(`${path.join(config.output, file.dir)}${file.name}`, Buffer.from(code, 'utf8'), (err) => {if (err) console.error(`Error while creating file ${file.name} at ${file.dir}:\n${err}`)})
}

function findFiles (origin) {
    var i = 0;
    var files = [];
    var dir = fs.readdirSync(origin, {encoding: 'utf8', withFileTypes: false});

    function searcher() {
        var file = {
            // name: path.join(origin, dir[i]).split(path.normalize(config.entryRoot) + '/')[1],
            name: dir[i],
            path: origin,
            fullPath: path.join(origin, dir[i]),
            isDirectory: fs.statSync(path.join(origin, dir[i])).isDirectory(),
            ext: path.extname(dir[i])
        }
        if (file.isDirectory) {
            files = files.concat(findFiles(file.fullPath))
        } else {
            var reqdFile = fs.readFileSync(file.fullPath, {encoding: 'utf8'})
            files.push({meta: file, data: reqdFile})
        }
        if (i < dir.length - 1) {
            i++;
            searcher();
        } else return
    }
    searcher()
    // console.table(files)
    return files;
}

function build() {
    var files = findFiles(path.normalize(config.entryRoot));
    
    for (file of files) {
        console.log(`Minifying '${file.meta.name}'`)
        if (file.meta.ext == '.js') {
            // JavaScript
            jsMinify(file)
        } else if (file.meta.ext == '.css') {
            // CSS
            cssMinify(file)
        } else if (file.meta.ext == '.html') {
            // HTML
            htmlMinify(file)
        }
    }

    async function jsMinify(file) {
        var minified = await jsTerser.minify(file.data, {mangle: true, compress: true})
        createFile({dir: path.normalize(config.entry.scripts), name: file.meta.name}, minified.code)
    }

    async function htmlMinify(file) {
        file.data = file.data.replace(/>\n\s*</ig,'><')
        var minified = await htmlTerser.minify(file.data, {mangle: true, compress: true, removeComments: true})
        createFile({dir: path.normalize(config.entry.pages), name: file.meta.name}, minified)
    }

    async function cssMinify(file) {
        var minified = await csso.minify(file.data)
        createFile({dir: path.normalize(config.entry.styles), name: file.meta.name}, minified.css)
    }
}

function buildDirectory(dir) {
    dir = dir.split('/')
    var folderPath = ''
    for (folder of dir) {
        // console.log(`Making directory ${folderPath}`)
        folderPath = path.join(folderPath, folder)
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath)
        }
    }
}