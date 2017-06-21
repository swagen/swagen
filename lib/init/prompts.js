const _ = require('lodash');
const inquirer = require('inquirer');

const swagenCore = require('swagen-core');
const cli = swagenCore.cli;

const transformChoices = [
    { name: 'No change', value: 'no' },
    new inquirer.Separator(),
    { name: 'Convert them to PascalCase', value: 'pc' },
    { name: 'Convert them to camelCase', value: 'cc' },
    new inquirer.Separator(),
    { name: 'Convert them using a custom function', value: 'fn' }
];

function createTransformPrompt(name, message, describeTransforms) {
    return {
        when: answers => {
            if (describeTransforms) {
                console.log();
                console.log('Transforms allow you to change aspects of the generated code, such as the names of services, operations and models.');
                console.log(`Transforms can be pre-defined strings, like 'pascalCase' and 'camelCase', or a custom function where you can modify the name in any way you require.`);
                console.log(`The next set of questions will allow you to optionally specify transform for each type of allowed element.`);
                console.log(`  - For no transforms, select the 'No change' option.`);
                console.log(`  - For a custom transform function, select the last option and add the custom function to the swagen.config.js file.`);
            }
            return true;
        },
        type: 'list',
        name: name,
        message: message,
        choices: transformChoices,
        default: 'no'
    };
}

module.exports = {
    questions: [
        {
            type: 'input',
            name: 'generator',
            message: 'Generator package name',
            filter: function(value) {
                if (_.startsWith(value.toLowerCase(), 'swagen-')) {
                    return value.substr('swagen-'.length);
                }
                return value;
            },
            validate: function(value) {
                if (!value) {
                    return false;
                }
                try {
                    let package = require(`swagen-${value}`);
                    return typeof package.modes === 'object'
                        && package.modes.length && package.modes.length > 0;
                } catch (ex) {
                    cli.error(`Cannot find swagen generator package named 'swagen-${value}'.`);
                    return false;
                }
            }
        },
        {
            when: answers => {
                let package = require(`swagen-${answers.generator}`);
                return package.modes.length > 1;
            },
            type: 'list',
            name: 'mode',
            message: answers => `${answers.generator} generator supports multiple modes. Select required mode`,
            choices: answers => {
                let package = require(`swagen-${answers.generator}`);
                return package.modes.map(mode => ({
                    name: `${mode.name} - ${mode.description} (language: ${mode.language})`,
                    value: mode.name
                }));
            }
        },
        {
            type: 'list',
            name: 'source',
            message: 'Select the source of the swagger data',
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
            message: 'Path to the output file (directory must exist, file does not need to)',
            validate: value => !!value,
            default: answers => {
                let package = require(`swagen-${answers.generator}`);
                let mode = answers.mode ? package.modes.find(m => m.name === answers.mode)
                    : package.modes[0];
                return `./output.${mode.extension || 'txt'}`;
            }
        },
        {
            type: 'input',
            name: 'configKey',
            message: 'Descriptive name for this configuration',
            validate: value => !!value,
            default: answers => answers.file || answers.url
        },
        createTransformPrompt('transformServiceName', 'How should service names be changed?', true),
        createTransformPrompt('transformOperationName', 'How should operation names be changed?'),
        createTransformPrompt('transformModelName', 'How should model names be changed?'),
        createTransformPrompt('transformPropertyName', 'How should model property names be changed?')
    ]
};
