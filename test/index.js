const {exec} = require('child_process')
// function exec(str) {console.log(str)}

var arg = process.argv[2]
var serverOpt = process.argv[3]

if (arg === '--serveStart') {
    if (serverOpt === '--prod') {
        exec('npx prodbuild serve start --prod')
    } else {
        exec('npx prodbuild serve start')
    }
} else if (arg === '--serveKill') {
    if (serverOpt === '--purge') {
        exec('npx prodbuild serve kill --purge')
    } else {
        exec('npx prodbuild serve kill')
    }
} else if (arg === '--build') {
    exec('npx prodbuild build')
}