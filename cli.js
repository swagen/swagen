#!/usr/bin/env node

'use strict';

const process = require('process');
const minimist = require('minimist');
const _ = require('lodash');

const swagenCore = require('swagen-core');
const cli = swagenCore.cli;

const helpCommand = require('./lib/help');

let allArgs = process.argv;
let argsCount = _.endsWith(allArgs[0].toLowerCase(), 'node.exe') ? 3 : 2;

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
    cli.error(`Invalid command: '${command}'`);
    cli.error(ex);
    helpCommand();
}
if (commandModule) {
    commandModule(argv);
}
