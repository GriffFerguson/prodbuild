const { exec } = require('child_process')
const fs = require('fs')
const { minify } = require('terser')

function createFile(file, code) {
    if (!fs.existsSync(`../dist/${file.dir}`)) {
        fs.mkdir(`../dist/${file.dir}`, (err) => {if (err) {console.log(err)}})
    }
    fs.writeFile(`../dist/${file.dir}${file.name}`, code, (err) => {if (err) {console.log(err)}})
}

// JavaScript
for (fileName of fs.readdirSync('../src/scripts/', {encoding: 'utf8', withFileTypes: false})) {
    fs.readFile(`../src/scripts/${fileName}`, {encoding: 'utf8'}, async (err, data) => {
        var minified = await minify(data, {mangle: true, compress: true})
        createFile({dir: 'scripts/', name: fileName}, minified.code)
    })
}

// CSS
for (fileName of fs.readdirSync('../src/styles/', {encoding: 'utf8', withFileTypes: false})) {
    fs.readFile(`../src/styles/${fileName}`, {encoding: 'utf8'}, async (err, data) => {
        exec(`npx postcss ./src/styles/${fileName} > ./dist`)
    })
}