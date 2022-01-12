const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const jsTerser = require('terser')
const htmlTerser = require('html-minifier-terser')

var config;
fs.readFile(path.join(__dirname, '../build.config.json'), {encoding: 'utf8'}, (err, data) => {
    if (err) {console.log(err)}
    console.log('Loaded build config')
    config = JSON.parse(data)
    config.entryRoot = path.join(__dirname, config.entryRoot)
    config.output = path.join(__dirname, config.output)
    build()
})

function createFile(file, code) {
    if (!fs.existsSync(path.join(config.output, file.dir))) {
        fs.mkdir(path.join(config.output, file.dir), (err) => {if (err) {console.log(err)}})
    }
    fs.writeFile(`${path.join(config.output, file.dir)}${file.name}`, code, (err) => {if (err) {console.log(err)}})
}

function findFiles (origin, type, prefix) {
    prefix = prefix || ''

    var files = [];
    var dir = fs.readdirSync(origin, {encoding: 'utf8', withFileTypes: false});

    function searcher() {
        for (var i = 0; i < dir.length; i++) {
            var file = {
                name: prefix + dir[i],
                path: path.join(origin, dir[i]),
                isDirectory: fs.statSync(path.normalize(dir[i])).isDirectory(),
                ext: path.extname(dir[i])
            }
            if (file.isDirectory) {
                i++;
                file.push(findFiles(file.path, type, file.name + '/'))
            } else {
                if (file.ext == type) {
                    fs.readFile(file.path, {encoding: 'utf8'}, (err, data) => {
                        if (err) {
                            console.error(err)
                        }
                        files.push({name: file.path, data: data})
                        console.log(files)
                    })
                }
            }
        }
    }
    searcher()
    return files;
}

function build() {
    // JavaScript
    console.log('Finding JavaScript files...')
    var jsFiles = findFiles(path.join(config.entryRoot, config.entry.scripts), '.js')
    console.log('Building Javascript files...')
    for (file of jsFiles) {
        jsMinify(file.data)
    }

    async function jsMinify(file) {
        var minified = await jsTerser.minify(file.data, {mangle: true, compress: true})
        createFile({dir: path.normalize(config.entry.scripts), name: file.name}, minified.code)
    }

    // CSS
    console.log('Finding CSS files...')
    var cssFiles = findFiles(path.join(config.entryRoot, config.entry.styles), '.css')
    console.log('Building CSS files...')
    for (file of cssFiles) {
        exec(`npx postcss ${path.join(config.entryRoot, config.entry.styles)}${file.name} > ${path.join(config.output, config.entry.styles)}${file.name}`)
    }

    // HTML
    console.log('Finding HTML files...')
    var jsFiles = findFiles(path.join(config.entryRoot, config.entry.pages), '.html' || '.htm')
    console.log('Building HTML files...')
    for (file of jsFiles) {
        htmlMinify(file.data)
    }
}