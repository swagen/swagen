#!/usr/bin/env node

'use strict';

const process = require('process');

const minimist = require('minimist');
const _ = require('lodash');

const utils = require('./lib/utils');
const cli = utils.cli;
const helpCommand = require('./lib/help');

// Calculate arguments
const allArgs = process.argv;
const argsCount = _.endsWith(allArgs[0].toLowerCase(), 'node.exe') ? 3 : 2;

// Figure out the command and parse the remaining arguments.
// If no command is specified, assume it to be generate.
let command = 'generate';
let argv = {};
if (allArgs.length >= argsCount) {
    command = allArgs[argsCount - 1];
    argv = minimist(allArgs.slice(argsCount));
}

// Load the module for the command.
let commandModule;
try {
    commandModule = require(`./lib/${command}`);
} catch (ex) {
    // If the module could not be loaded, it means that the specified command is invalid.
    // Display error message and help.
    cli.error(`Invalid command: '${command}'`);
    cli.error(ex);
    helpCommand();
}

// This should not happen, but just in case the command module is falsey or is not a function.
if (!commandModule || typeof commandModule !== 'function') {
    cli.error(`An unexpected error occurred; could not load the command '${command}'.`);
}

try {
    // Run the command, passing in the parsed arguments
    commandModule(argv);
} catch (ex) {
    // If the command throws an exception, display the error message and command help.
    if (ex instanceof Error) {
        cli.error(ex.message);
    } else {
        cli.error(ex);
    }
    console.log();
    const helpArgs = {
        _: [command]
    };
    helpCommand(helpArgs);
}
