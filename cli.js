#!/usr/bin/env node

'use strict';

const process = require('process');
const chalk = require('chalk');
const minimist = require('minimist');
const _ = require('lodash');

const helpCommand = require('./lib/help');

const allArgs = process.argv;
const argsCount = _.endsWith(allArgs[0].toLowerCase(), 'node.exe') ? 3 : 2;

let command = 'generate';
let argv = {};
if (allArgs.length >= argsCount) {
    command = allArgs[argsCount - 1];
    argv = minimist(allArgs.slice(argsCount));
}

let commandModule;
try {
    commandModule = require(`./lib/${command}`);
} catch (ex) {
    console.log(chalk.red(`Invalid command: '${command}'`));
    console.log(chalk.red(ex));
    helpCommand();
}
if (commandModule) {
    commandModule(argv);
}
