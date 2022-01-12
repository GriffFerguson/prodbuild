#! /bin/env node

const childProcess = require('child_process')
const path = require('path')
const { Command } = require('commander');
const program = new Command();

function run(script, callback) {
    var completed = false;

    var process = childProcess.fork(script)

    process.on('error', err => {
        if (completed) {
            console.log(err)
            completed = true;
        }
    })
}

program
    .version('0.0.1')
    .description('CLI for Hardhat')

program
    .command('build')
    .description('build the website into the specified folder')
    .action(() => {
        console.log(path.join(__dirname, '../lib/build.js'))
        run(path.join(__dirname, '../lib/build.js'))
    })

program.parse(process.argv)