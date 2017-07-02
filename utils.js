'use strict';

const process = require('process');

const currentDir = process.cwd();

const configScriptFileName = 'swagen.config.js';
const configJsonFileName = 'swagen.config.json';

function loadConfig() {
    let configScript = path.resolve(currentDir, configScriptFileName);
    if (fs.existsSync(configScript)) {
        return require(configScript);
    }

    let configJson = path.resolve(currentDir, configJsonFileName);
    if (fs.existsSync(configJson)) {
        return require(configJson);
    }

    let errorMessage = [
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

module.exports = {
    loadConfig: loadConfig
};
