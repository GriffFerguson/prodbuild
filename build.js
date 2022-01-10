const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const jsTerser = require('terser')
const htmlTerser = require('html-minifier-terser')

function createFile(file, code) {
    if (!fs.existsSync(`../dist/${file.dir}`)) {
        fs.mkdir(`./dist/${file.dir}`, (err) => {if (err) {console.log(err)}})
    }
    fs.writeFile(`./dist/${file.dir}${file.name}`, code, (err) => {if (err) {console.log(err)}})
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

// JavaScript
var jsFiles = findFiles('./src/scripts/', '.js')
for (file of jsFiles) {
    jsMinify(file.data)
}

async function jsMinify(file) {
    var minified = await jsTerser.minify(file.data, {mangle: true, compress: true})
    createFile({dir: 'scripts/', name: file.name}, minified.code)
}

// CSS
var cssFiles = findFiles('./src/styles/', '.css')
for (file of cssFiles) {
    exec(`npx postcss ./src/styles/${file.name} > ./dist/styles/${file.name}`)
}