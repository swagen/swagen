'use strict';

const _ = require('lodash');
const inquirer = require('inquirer');

const transformChoices = [
    { name: 'No change', value: 'no' },
    new inquirer.Separator(),
    { name: 'Pascal-case', value: 'pc' },
    { name: 'Camel-case', value: 'cc' },
    new inquirer.Separator(),
    { name: 'Custom function', value: 'fn' }
];

function createTransformPrompt(name, message, defaultValue) {
    return {
        type: 'list',
        name: name,
        message: message,
        choices: transformChoices,
        default: defaultValue || 'no'
    };
}

module.exports = {
    source: {
        type: 'list',
        name: 'source',
        message: 'Select swagger source',
        choices: [
            { name: 'URL', value: 'url' },
            { name: 'Local file', value: 'file' }
        ],
        default: 'url'
    },
    url: {
        when: answers => answers.source === 'url',
        type: 'input',
        name: 'url',
        message: 'Swagger URL',
        validate: value => !!value
    },
    file: {
        when: answers => answers.source === 'file',
        type: 'input',
        name: 'file',
        message: 'Swagger file path',
        validate: value => !!value
    },
    output: {
        type: 'input',
        name: 'output',
        message: 'Generated file path',
        validate: value => !!value
    },
    generator: {
        type: 'input',
        name: 'generator',
        message: 'Generator name (without swagen- prefix)',
        filter: function(value) {
            if (_.startsWith(value.toLowerCase(), 'swagen-')) {
                return value.substr('swagen-'.length);
            }
            return value;
        },
        validate: value => !!value
    },
    mode: {
        type: 'input',
        name: 'mode',
        message: 'Select mode'
    },
    transformServiceName: createTransformPrompt('transformServiceName', 'Transform service name'),
    transformOperationName: createTransformPrompt('transformOperationName', 'Transform service operation name'),
    transformModelName: createTransformPrompt('transformModelName', 'Transform model name'),
    transformPropertyName: createTransformPrompt('transformPropertyName', 'Transform model property name')
};
