'use strict';

const fs = require('fs');
const path = require('path');
const process = require('process');

const inquirer = require('inquirer');

const _prompts = require('./prompts');

const _args = {
    console: false,
    defaults: false
};

function getDefaultAnswers() {
    return {
        source: 'url',
        url: '<swagger url>',
        output: '<path to output file>',
        generator: '<generator name>',
        mode: '<mode>',
        transformServiceName: 'no',
        transformOperationName: 'no',
        transformModelName: 'no',
        transformPropertyName: 'no'
    };
}

function buildConfig(answers, generatorAnswers, mode) {
    const currentDir = process.cwd();

    const configJsonFilePath = path.resolve(currentDir, 'swagen.config.json');
    const configJson = fs.existsSync(configJsonFilePath) ? require(configJsonFilePath) : {};
    const config = {
        output: answers.output,
        generator: answers.generator,
        mode: mode.name,
        transforms: {
            serviceName: [],
            operationName: [],
            modelName: [],
            propertyName: [],
            parameterName: []
        }
    };
    if (answers.source === 'url') {
        config.url = answers.url;
    } else {
        config.file = answers.file;
    }
    config.options = {};
    if (typeof mode.buildProfile === 'function') {
        mode.buildProfile(config.options, generatorAnswers, answers);
    }
    configJson[answers.configKey] = config;

    fs.writeFileSync(configJsonFilePath, JSON.stringify(configJson, null, 2), 'utf8');

    console.log();
    console.log(`Configuration written to ${configJsonFilePath}.`);
    console.log();
    console.log(`Use the command 'swagen' to generate the code.`);
}

module.exports = function(args) {
    _args.defaults = args.defaults === true;

    if (_args.defaults) {
        const defaultAnswers = getDefaultAnswers();
        buildConfig(defaultAnswers);
        return;
    }

    console.log();
    console.log(`General questions:`);

    inquirer.prompt(_prompts.questions).then(answers => {
        const generatorPkg = require(`swagen-${answers.generator}`);

        const modes = generatorPkg instanceof Array ? generatorPkg : [generatorPkg];
        const mode = answers.mode ? modes.find(m => m.name === answers.mode) : modes[0];

        console.log();
        console.log(`Generator-specific questions:`);

        inquirer.prompt(mode.prompts || []).then(generatorAnswers => {
            buildConfig(answers, generatorAnswers, mode);
        });
    });
};
