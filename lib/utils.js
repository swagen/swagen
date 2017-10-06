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
 *
 * @param {string|Object} swagger The Swagger JSON string or deserialized object
 */
function resolveSwaggerObject(swagger) {
    if (typeof swagger === 'string') {
        try {
            return JSON.parse(swagger);
        } catch (ex) {
            if (ex instanceof SyntaxError) {
                let errorMessage = ex.message;
                if (ex.lineNumber) {
                    errorMessage += ` At line number ${ex.lineNumber}`;
                }
                throw new Error(errorMessage);
            }
            throw ex;
        }
    } else {
        return swagger;
    }
}
/**
 * Loads the correct configuration from the current directory.
 * @returns {Object} Configuration object
 */
function loadConfig(justJson) {
    if (!justJson) {
        const configScript = path.resolve(currentDir, configScriptFileName);
        if (fs.existsSync(configScript)) {
            return require(configScript);
        }
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

function saveConfig(config) {
    if (typeof config !== 'string') {
        config = JSON.stringify(config, null, 4);
    }
    const configJsonFile = path.resolve(currentDir, configJsonFileName);
    fs.writeFileSync(configJsonFile, config, 'utf8');
    return configJsonFile;
}

function debug(message) {
    if (message) {
        console.log(chalk.blue(`[debug] ${message}`));
    } else {
        console.log();
    }
}

function error(message) {
    if (message) {
        console.log(chalk.red(message));
    } else {
        console.log();
    }
}

function info(message) {
    if (message) {
        console.log(chalk.green(message));
    } else {
        console.log();
    }
}

function warn(message) {
    if (message) {
        console.log(chalk.yellow(`[warn] ${message}`));
    } else {
        console.log();
    }
}

module.exports = {
    resolveSwaggerObject,
    loadConfig,
    saveConfig,
    cli: {
        debug,
        error,
        info,
        warn
    }
};
