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
    installOption: {
        type: 'list',
        name: 'installOption',
        message: 'Have you installed the generator package you want to use?',
        choices: [
            { name: 'Yes', value: 'y' },
            { name: `No, I will install it later. Let's proceed now and I'll enter the generator-specific configuration manually`, value: 'l' },
            { name: 'No, I will install it now and rerun the swagen init command', value: 'n' }
        ],
        default: 'y'
    },
    questions: [
        {
            type: 'list',
            name: 'source',
            message: 'Select swagger source',
            choices: [
                { name: 'URL', value: 'url' },
                { name: 'Local file', value: 'file' }
            ],
            default: 'url'
        },
        {
            when: answers => answers.source === 'url',
            type: 'input',
            name: 'url',
            message: 'Swagger URL',
            validate: value => !!value
        },
        {
            when: answers => answers.source === 'file',
            type: 'input',
            name: 'file',
            message: 'Swagger file path',
            validate: value => !!value
        },
        {
            type: 'input',
            name: 'output',
            message: 'Generated file path',
            validate: value => !!value
        },
        {
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
        {
            when: answers => {
                try {
                    let package = require(`swagen-${answers.generator}`);
                    return false;
                } catch (ex) {
                    return true;
                }
            },
            type: 'input',
            name: 'mode',
            message: 'Generator mode (optional)'
        },
        {
            when: answers => {
                try {
                    let package = require(`swagen-${answers.generator}`);
                    return true;
                } catch (ex) {
                    return false;
                }
            },
            type: 'list',
            name: 'mode',
            message: 'Generator mode',
            choices: answers => {
                let package = require(`swagen-${answers.generator}`);
                return package.metadata.supportedModes.map(mode => ({
                    name: `${mode.name} - ${mode.description} (language: ${mode.language})`,
                    value: mode.name
                }));
            }
        },
        createTransformPrompt('transformServiceName', 'Transform service name'),
        createTransformPrompt('transformOperationName', 'Transform service operation name'),
        createTransformPrompt('transformModelName', 'Transform model name'),
        createTransformPrompt('transformPropertyName', 'Transform model property name')
    ]
};
