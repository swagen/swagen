'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const process = require('process');

const chalk = require('chalk');

const currentDir = process.cwd();

const configScriptFileName = 'swagen.config.js';
const configJsonFileName = 'swagen.config.json';

/**
 * Loads the correct configuration from the current directory.
 * @returns {Object} Configuration object
 */
function loadConfig() {
    const configScript = path.resolve(currentDir, configScriptFileName);
    if (fs.existsSync(configScript)) {
        return require(configScript);
    }

    const configJson = path.resolve(currentDir, configJsonFileName);
    if (fs.existsSync(configJson)) {
        return require(configJson);
    }

    const errorMessage = [
        `Specify a ${configScriptFileName} or ${configJsonFileName} file to configure the swagen tool.`,
        ``,
        `To create a configuration file in the current directory, use the following command:`,
        ``,
        `    swagen init`,
        ``,
        `This will ask you a series of questions and generate a configuration file based on your answers.`
    ].join(os.EOL);
    throw errorMessage;
}

function debug(message) {
    console.log(chalk.blue(`[debug] ${message}`));
}

function error(message) {
    console.log(chalk.red(message));
}

function info(message) {
    console.log(chalk.green(message));
}

function warn(message) {
    console.log(chalk.yellow(`[warn] ${message}`));
}

module.exports = {
    loadConfig: loadConfig,
    cli: {
        debug,
        error,
        info,
        warn
    }
};
