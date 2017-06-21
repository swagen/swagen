'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const process = require('process');

const inquirer = require('inquirer');
const swagenCore = require('swagen-core');

const _prompts = require('./prompts');

let _args = {
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

function getTransformValue(transform) {
    switch (transform) {
        case 'no': return undefined;
        case 'cc': return `camelCase`;
        case 'pc': return `pascalCase`;
        case 'fn': return undefined;
        default: return undefined;
    }
}

function buildConfig(answers, generatorAnswers, mode) {
    let currentDir = process.cwd();

    let configJsFilePath = path.resolve(currentDir, 'swagen.config.js');
    let configJsFileExists = fs.existsSync(configJsFilePath);
    if (!configJsFileExists) {
        let configJs = new swagenCore.CodeBuilder()
            .line(`const swagenConfig = require('./swagen.config.json');`)
            .blank()
            .line(`/**`)
            .line(` * Quite often, you will require a utility library like lodash when writing your code below.`)
            .line(` * If so, uncomment the following line and ensure that the lodash package is installed.`)
            .line(` */`)
            .line(`// const _ = require('lodash');`)
            .blank()
            .line(`/**`)
            .line(` * Update the swagen config with any dynamic code you require.`)
            .line(` * Example (to prefix all service names with 'Svc')`)
            .line(` */`)
            .line(`// swagenConfig.api.transforms.serviceName = function(name, details) {`)
            .line(`//    return 'Svc' + _.upperFirst(_.camelCase(name));`)
            .line(`// };`)
            .blank()
            .line(`module.exports = swagenConfig;`);
        let configText = configJs.toCode();
        fs.writeFileSync(configJsFilePath, configText, 'utf8');
    }

    let configJsonFilePath = path.resolve(currentDir, 'swagen.config.json');
    let configJson = fs.existsSync(configJsonFilePath) ? require(configJsonFilePath) : {};
    let config = {
        output: answers.output,
        generator: answers.generator,
        mode: mode.name,
        transforms: {
            serviceName: getTransformValue(answers.transformServiceName),
            operationName: getTransformValue(answers.transformOperationName),
            modelName: getTransformValue(answers.transformModelName),
            propertyName: getTransformValue(answers.transformPropertyName)
        }
    };
    if (answers.source === 'url') {
        config.url = answers.url;
    } else {
        config.file = answers.file;
    }
    config.options = {};
    if (typeof mode.configBuilderFn === 'function') {
        mode.configBuilderFn(config.options, generatorAnswers, answers);
    }
    configJson[answers.configKey] = config;

    fs.writeFileSync(configJsonFilePath, JSON.stringify(configJson, null, 2), 'utf8');

    console.log();
    console.log(`Configuration written to ${configJsonFilePath}.`);
    if (!configJsFileExists) {
        console.log(`Configuration file ${configJsFilePath} created.`);
    }

    console.log();
    console.log(`Use the command 'swagen' to generate the code.`);
}

module.exports = function(args) {
    _args.defaults = args.defaults === true;

    if (_args.defaults) {
        let defaultAnswers = getDefaultAnswers();
        buildConfig(defaultAnswers);
        return;
    }

    console.log();
    console.log(`General questions:`);

    inquirer.prompt(_prompts.questions).then(function(answers) {
        let generatorPkg = require(`swagen-${answers.generator}`);

        let mode = answers.mode ? generatorPkg.modes.find(m => m.name === answers.mode) : generatorPkg.modes[0];

        console.log();
        console.log(`Generator-specific questions:`);

        inquirer.prompt(mode.prompts).then(function(generatorAnswers) {
            buildConfig(answers, generatorAnswers, mode);
        });
    });
};
