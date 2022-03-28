const fs = require('fs')
const path = require('path')
const jsTerser = require('terser')
const ts = require('typescript')

var config;
fs.readFile('./build.config.json', {encoding: 'utf8'}, (err, data) => {
    if (err) {
        console.log('Could not read "build.config.json". Will resort to default values of:\nOutput: ./dist/\nEntry: ./src/\nPort: 5000')
        data = require('../build.config.json')
    }
    console.log('Loaded build config')
    config = JSON.parse(data)
    config.entry = path.normalize(config.entry)
    config.output = path.normalize(config.output)
    build()
})

function createFile(file, code) {
    // console.log('Creating file ' + file.name)
    buildDirectory(path.join(config.output, file.dir))
    fs.writeFile(`${path.join(config.output, file.dir)}/${file.name}`, Buffer.from(code, 'utf8'), (err) => {if (err) console.error(`Error while creating file ${file.name} at ${file.dir}:\n${err}`)})
}

function findFiles(origin) {
    var i = 0;
    var files = [];
    var dir = fs.readdirSync(origin, {encoding: 'utf8', withFileTypes: false});

    function searcher() {
        var file = {
            /*
            Follows schema of:
            'name': file name (ex: example.file)
            'path': directory (ex: path/to/file)
            'fullPath': directory and file name (ex: path/to/file/example.file)
            'isDirectory': boolean, self explanatory
            'ext': file extension (ex: .file)
             */
            name: dir[i],
            path: origin,
            fullPath: path.join(origin, dir[i]),
            isDirectory: fs.statSync(path.join(origin, dir[i])).isDirectory(),
            ext: path.extname(dir[i])
        }
        // console.log(file.fullPath, checkExclude(file.fullPath))
        if (!checkExclude(file.fullPath)) {
            if (file.isDirectory) {
                files = files.concat(findFiles(file.fullPath))
            } else {
                var reqdFile = fs.readFileSync(file.fullPath, {encoding: 'utf8'})
                files.push({meta: file, data: reqdFile})
            }
        } else console.log(`Ignoring '${file.name}'`)
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
    var files = findFiles(config.entry);
    fs.rmSync(config.output, {recursive: true})
    fs.mkdirSync(config.output)
    
    for (file of files) {
        console.log(`Processing '${file.meta.name}'`)
        if (file.meta.ext == '.js') {
            // JavaScript
            jsMinify(file)
        } else if (file.meta.ext == '.ts') {
            //TypeScript
            tsMinify(file)

        } else if (file.meta.ext == '.css') {
            // CSS
            cssMinify(file)
        } else if (file.meta.ext == '.html') {
            // HTML
            htmlMinify(file)
        } else {
            createFile({dir: path.normalize(file.meta.path.split('src')[1]), name: file.meta.name}, file.data)
        }
    }

    async function jsMinify(file) {
        var minified = await jsTerser.minify(file.data, {mangle: true, compress: true})
        createFile({dir: path.normalize(file.meta.path.split('src')[1]), name: file.meta.name}, minified.code)
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
        file.data = file.data.replace(/>\n\s*</ig,'><')
        var minified = await htmlTerser.minify(file.data, {mangle: true, compress: true, removeComments: true})
        createFile({dir: path.normalize(file.meta.path.split('src')[1]), name: file.meta.name}, minified)
    }

    async function cssMinify(file) {
        var minified = await csso.minify(file.data)
        createFile({dir: path.normalize(file.meta.path.split('src')[1]), name: file.meta.name}, minified.css)
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

function checkExclude(fileName) {
    if (config.exclude != undefined) {
        for (file of config.exclude) {
            if (fileName.indexOf(path.normalize(file)) != -1) return true
        }
    }
    return false
}