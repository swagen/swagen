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
        case 'no': return `'undefined'`;
        case 'cc': return `'camelCase'`;
        case 'pc': return `'pascalCase'`;
        case 'fn': return `function(name, details) { return name; }`;
        default: return `'undefined'`;
    }
}

function buildConfig(answers, generatorAnswers, generatorPkg) {
    let configBuilder = generatorAnswers ? generatorPkg.metadata.buildConfig : undefined;
    let config = new swagenCore.CodeBuilder()
        .line(`module.exports = {`)
            .indent(`api: {`)
                .indent()
                .lineIf(answers.source === 'url', `url: '${answers.url}',`)
                .lineIf(answers.source === 'file', `file: '${answers.file}',`)
                .line(`generator: '${answers.generator}',`)
                .line(`mode: '${answers.mode || 'undefined'}',`)
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

    inquirer.prompt([_prompts.installOption]).then(function(installedAnswer) {
        if (installedAnswer.installOption === 'n') {
            console.log(`Swagen generators are NPM packages prefixed with 'swagen-'.`);
            console.log(`You can search for these packages at https://www.npmjs.com/`);
            return;
        }

        console.log();
        console.log(`General questions:`);

        inquirer.prompt(_prompts.questions).then(function(answers) {
            if (installedAnswer.installOption === 'y') {
                let generatorPkg = require(`swagen-${answers.generator}`);

                console.log();
                console.log(`Generator-specific questions:`);

                inquirer.prompt(generatorPkg.metadata.prompts).then(function(generatorAnswers) {
                    buildConfig(answers, generatorAnswers, generatorPkg);
                });
            } else {
                buildConfig(answers);
            }
        });
    });
};
