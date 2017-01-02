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
        case 'no': return `undefined`;
        case 'cc': return `'camelCase'`;
        case 'pc': return `'pascalCase'`;
        case 'fn': return `function(name, details) { return name; }`;
        default: return `undefined`;
    }
}

function buildConfig(answers, generatorAnswers, mode) {
    let configBuilder = generatorAnswers ? mode.configBuilderFn : undefined;
    let config = new swagenCore.CodeBuilder()
        .line(`module.exports = {`)
            .indent(`api: {`)
                .indent()
                .lineIf(answers.source === 'url', `url: '${answers.url}',`)
                .lineIf(answers.source === 'file', `file: '${answers.file}',`)
                .line(`output: '${answers.output}',`)
                .line(`generator: '${answers.generator}',`)
                .line(`mode: '${mode.name}',`)
                .line(`transforms: {`)
                    .indent(`serviceName: ${getTransformValue(answers.transformServiceName)},`)
                    .line(`operationName: ${getTransformValue(answers.transformOperationName)},`)
                    .line(`modelName: ${getTransformValue(answers.transformModelName)},`)
                    .line(`propertyName: ${getTransformValue(answers.transformPropertyName)}`)
                .unindent(`},`)
                .line(`options: {`)
                    .indent()
                    .lineIf(!generatorAnswers, `// Generator-specific options`)
                    .funcIf(generatorAnswers, configBuilder, generatorAnswers, answers)
                .unindent(`}`)
            .unindent(`}`)
        .unindent(`};`);

    let configText = config.toCode();
    if (_args.console) {
        console.log(configText);
    } else {
        let currentDir = process.cwd();
        let configFilePath = path.resolve(currentDir, 'swagen.config.js');
        fs.writeFileSync(configFilePath, configText, 'utf8');
        console.log();
        console.log(`Configuration written to ${configFilePath}.`);
    }
}

module.exports = function(args) {
    _args.console = args.console === true;
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
