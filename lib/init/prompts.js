const _ = require('lodash');
const inquirer = require('inquirer');

const cli = require('../../utils').cli;

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
        when: () => {
            if (describeTransforms) {
                console.log();
                cli.info('Transforms allow you to change aspects of the generated code, such as the names of services, operations and models.');
                cli.info(`Transforms can be pre-defined strings, like 'pascalCase' and 'camelCase', or a custom function where you can modify the name in any way you require.`);
                cli.info(`The next set of questions will allow you to optionally specify transform for each type of allowed element.`);
                cli.info(`  - For no transforms, select the 'No change' option.`);
                cli.info(`  - For a custom transform function, select the last option and add the custom function to the swagen.config.js file.`);
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
            when: () => {
                console.log();
                cli.info(`Generators are special NPM packages that swagen uses to generate code from a swagger definition.`);
                cli.info(`Anybody can write a generator and publish it as an NPM package for others to use. Generator package names must be prefixed with 'swagen-'.`);
                cli.info(`To use a generator, it must be installed globally on your system.`);
                cli.info(`For the following question, specify the name of the generator you wish to use. You can specify just the part of the name after the 'swagen-' prefix.`);
                return true;
            },
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
                    const package = require(`swagen-${value}`);
                    return typeof package.modes === 'object'
                        && package.modes.length && package.modes.length > 0;
                } catch (ex) {
                    console.log();
                    cli.error(`Cannot find swagen generator package named 'swagen-${value}'.`);
                    cli.error(`Either you typed the package name incorrectly or the package is not installed on your system.`);
                    cli.error(`Please re-enter the name.`);
                    return false;
                }
            }
        },
        {
            when: answers => {
                const package = require(`swagen-${answers.generator}`);
                return package.modes.length > 1;
            },
            type: 'list',
            name: 'mode',
            message: answers => `The 'swagen-${answers.generator}' generator supports multiple output modes. Select required output mode`,
            choices: answers => {
                const package = require(`swagen-${answers.generator}`);
                return package.modes.map(mode => ({
                    name: `${mode.description} (language: ${mode.language})`,
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
                const package = require(`swagen-${answers.generator}`);
                const mode = answers.mode ? package.modes.find(m => m.name === answers.mode)
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
