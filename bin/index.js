#! /bin/env node

const { fork } = require('child_process')
const path = require('path')
const { Command } = require('commander');
const program = new Command();

function run(script, args) {
    args = args || []
    var completed = false;

    var process = fork(script, args)

    process.on('error', err => {
        if (!completed) {
            console.log(err)
            completed = true;
        }
    })

    process.on('exit', err => {
        if (!completed) {
            console.log('Completed process')
            completed = true
        }
    })
}

program
    .version('1.2.1')
    .description('CLI for Prodbuild')

program
    .command('build')
    .description('build the website into the specified folder')
    .action(() => {
        console.log('Starting build script...')
        run('node_modules/prodbuild/lib/build.js')
    })
    
program
    .command('serve')
    .description('start the development server')
    .option('--prod', 'run the server root as the production (output) folder')
    .option('--dev', '(default) run the server root as the development (entry) folder')
    .action((name, options) => {
        console.log('Starting build server...')
        if (options.parent.args[1] == '--prod') {
            run(`node_modules/prodbuild/lib/server.js`, ['--prod'])
        } else {
            run(`node_modules/prodbuild/lib/server.js`, ['--dev'])
        }
    })

program.parse(process.argv)