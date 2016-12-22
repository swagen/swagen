'use strict';

const os = require('os');
const inquirer = require('inquirer');

const _prompts = require('./prompts');

let _args = {
    console: false,
    defaults: false
};

function getPrompts() {
    let prompts = [
        _prompts.source,
        _prompts.url,
        _prompts.file,
        _prompts.output,
        _prompts.generator,
        _prompts.mode,
        _prompts.transformServiceName,
        _prompts.transformOperationName,
        _prompts.transformModelName,
        _prompts.transformPropertyName
    ];
    return prompts;
}

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
        case 'no': return '\'undefined\'';
        case 'cc': return '\'camelCase\'';
        case 'pc': return '\'pascalCase\'';
        case 'fn': return 'function(name, details) { return name; }';
        default: return '\'undefined\'';
    }
}

function buildConfig(answers) {
    let config = [
        `module.exports = {`,
        `    api: {`
    ];
    if (answers.source === 'url') {
        config.push(`        url: '${answers.url}',`);
    } else {
        config.push(`        file: '${answers.file}',`);
    }
    config.push(
        `        output: '${answers.output}',`,
        `        generator: '${answers.generator}',`,
        `        mode: '${answers.mode || 'undefined'}',`,
        `        transforms: {`,
        `            serviceName: ${getTransformValue(answers.transformServiceName)},`,
        `            operationName: ${getTransformValue(answers.transformOperationName)},`,
        `            modelName: ${getTransformValue(answers.transformModelName)},`,
        `            propertyName: ${getTransformValue(answers.transformPropertyName)}`,
        `        },`,
        `        options: {`,
        `            // Generator-specific options`,
        `        }`,
        `    }`,
        `};`
    );
    return config;
}

module.exports = function(args) {
    _args.console = args.console === true;
    _args.defaults = args.defaults === true;

    if (_args.defaults) {
        let defaultAnswers = getDefaultAnswers();
        console.log(buildConfig(defaultAnswers));
    } else {
        let prompts = getPrompts();
        inquirer.prompt(prompts).then(function(answers) {
            console.log(buildConfig(answers));
        });
    }
};
