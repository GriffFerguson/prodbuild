const fs = require('fs');
const { normalize } = require('path')
const rl = require('readline').createInterface({input: process.stdin, output: process.stdout})

var config = "{\n\t"
var res;

entry()
// config.entry
function entry() {
    rl.question('Entry point: (src/) ', answer => {
        if (answer == "") {
            res = 'src/'
        } else {
            res = normalize(answer)
        }
        if (!fs.existsSync(res)) {
            console.log(`Creating directory "${res}"`)
            fs.mkdir(res, err => {if (err) throw err})
        }
        config += `\"entry\": \"${res}\",\n\t`
        output()
    })
}


//config.output
function output() {
    rl.question('Output directory: (dist/) ', answer => {
        if (answer == "") {
            res = 'dist/'
        } else {
            res = normalize(answer)
        }
        if (!fs.existsSync(res)) {
            console.log(`Creating directory "${res}"`)
            fs.mkdir(res, err => {if (err) throw err})
        }
        config += `\"output\": \"${res}\",\n\t`
        port()
    })
}

//config.port
function port() {
    rl.question('Dev server port: (5000) ', answer => {
        if (answer == "") {
            res = '5000'
        } else {
            try {
                res = parseInt(answer)
            } catch(err) {
                console.log(`"${res}" is not a valid port number! Make sure the port number you enter is a valid integer greater than 0`)
                port()
            }
        }
        config += `\"port\": ${res}`
        exclude()
    })
}

//config.exclude
function exclude() {
    rl.question('(optional) Comma-separated list of files to ignore: ', answer => {
        if (!answer == "") {
            var ignoreList = answer.split(',')
            res = "["
            for (var i = 0; i < ignoreList.length; i++) {
                res += `"${ignoreList[i]}", `
            }
            res = res.substring(0, res.length - 2) + "]"
            config += `,\n\t\"exclude\": ${res}`
        }
        end()
    })
}


// End config
function end() {
    rl.close()
    config += "\n}"
    fs.writeFileSync('./build.config.json', config, {encoding: 'utf8'})
    console.log('Successfully created config file!')
}
