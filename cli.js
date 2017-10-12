#!/usr/bin/env node

'use strict';

const process = require('process');

const chalk = require('chalk');
const minimist = require('minimist');
const _ = require('lodash');

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
    console.log(chalk.red(`Invalid command: '${command}'`));
    console.log(chalk.red(ex));
    helpCommand();
}

// This should not happen, but just in case the command module is falsey or is not a function.
if (!commandModule || typeof commandModule !== 'function') {
    console.log(chalk.red(`An unexpected error occurred; could not load the command '${command}'.`));
}

try {
    // Run the command, passing in the parsed arguments
    const promise = commandModule(argv);
    if (promise && promise instanceof Promise) {
        promise.catch(err => handleCommandError(err));
    }
} catch (ex) {
    handleCommandError(ex);
}

/**
 * If the command throws an exception, display the error message and command help
 * @param {*} ex The thrown exception
 */
function handleCommandError(ex) {
    // If the command throws an exception, display the error message and command help.
    if (ex instanceof Error) {
        console.log(chalk.red(ex.message));
    } else {
        console.log(chalk.red(ex));
    }
    const helpArgs = {
        _: [command]
    };
    helpCommand(helpArgs);
}
