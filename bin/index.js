#! /bin/env node

const { fork } = require('child_process')
const path = require('path')
const { Command } = require('commander');
const program = new Command();
const {version} = require(path.join('.', '../package.json'))

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
    .version(`prodbuild@${version}`)
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
    .argument('<action>', '\'start\' or \'kill\' the dev server')
    .description('start the development server')
    .option('--prod', 'run the server root as the production (output) folder', false)
    .option('--purge', 'purge the dev server logs' , false)
    .action((action, options) => {
        console.log('Changing dev server status...')
        run(`node_modules/prodbuild/lib/server.js`, [
            action,
            options.prod,
            options.purge
        ])
    })

program
    .command('init')
    .description('create a configuration file and the necessary folders for Prodbuild')
    .action(() => {
        run(`node_modules/prodbuild/bin/init.js`)
    })

program.parse(process.argv)