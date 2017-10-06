'use strict';

const inquirer = require('inquirer');

const utils = require('../utils');
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

function buildConfig(answers, generatorAnswers) {
    let configJson;
    try {
        configJson = utils.loadConfig(true);
    } catch(ex) {
        configJson = {};
    }

    const mode = answers.internal.selectedMode;

    const config = {
        output: answers.output,
        generator: answers.generator,
        mode: mode.name
    };

    config.transforms = mode.defaultTransforms;
    config.transforms = config.transforms || {};
    config.transforms.serviceName = config.transforms.serviceName || [];
    config.transforms.operationName = config.transforms.operationName || [];
    config.transforms.parameterName = config.transforms.parameterName || [];
    config.transforms.modelName = config.transforms.modelName || [];
    config.transforms.propertyName = config.transforms.propertyName || [];

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

    const configJsonFilePath = utils.saveConfig(configJson);

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
        const mode = answers.internal.selectedMode;

        console.log();
        console.log(`Generator-specific questions:`);

        inquirer.prompt(mode.prompts || []).then(generatorAnswers => {
            buildConfig(answers, generatorAnswers);
        });
    });
};
