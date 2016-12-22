#!/usr/bin/env node

'use strict';

const process = require('process');
const minimist = require('minimist');
const _ = require('lodash');

let allArgs = process.argv;
let argsCount = _.endsWith(allArgs[0].toLowerCase(), 'node.exe') ? 3 : 2;

let command = 'default';
let argv = {};
if (allArgs.length >= argsCount) {
    command = allArgs[argsCount - 1];
    argv = minimist(allArgs.slice(argsCount));
}

let commandModule;
try {
    commandModule = require(`./lib/${command}`);
} catch (ex) {
    console.error(`Invalid command: '${command}'`);
}
if (commandModule) {
    commandModule(argv);
}
