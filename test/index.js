const {exec} = require('child_process')
// function exec(str) {console.log(str)}

var arg = process.argv[2]

if (arg === '--serve') {
    var serverOpt = process.argv[3]
    if (serverOpt === '--dev') {
        exec('npx prodbuild serve --dev')
    } else if (serverOpt === '--prod') {
        exec('npx prodbuild serve --prod')
    }
} else if (arg == '--build') {
    exec('npx prodbuild build')
}