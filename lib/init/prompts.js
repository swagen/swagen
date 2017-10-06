const _ = require('lodash');
const inquirer = require('inquirer');

const utils = require('../utils');
const cli = utils.cli;

function getExistingConfigSources(sourceType) {
    const sources = new Set();
    try {
        const config = utils.loadConfig(true);
        for (const profile in config) {
            if (config[profile][sourceType]) {
                sources.add(config[profile][sourceType]);
            }
        }
    } catch (ex) {
        // Swallow
    }
    return Array.from(sources);
}

function buildSourceChoices(sources) {
    return [
        ...sources,
        new inquirer.Separator(),
        { name: `None of the above; I'll enter it manually.`, value: ''}
    ];
}

const transformChoices = [
    { name: `No change or I'll customize it later`, value: 'no' },
    new inquirer.Separator(),
    { name: 'Convert them to PascalCase', value: 'pc' },
    { name: 'Convert them to camelCase', value: 'cc' }
];

function createTransformPrompt(name, message, describeTransforms) {
    return {
        when: () => {
            if (describeTransforms) {
                console.log();
                cli.info('Transforms allow you to change aspects of the generated code, such as the names of services, operations and models.');
                cli.info(`Transforms can be pre-defined strings, like 'pascal-case' and 'camel-case', or a custom function where you can modify the name in any way you require.`);
                cli.info(`The next set of questions will allow you to optionally specify transform for each type of allowed element.`);
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
            filter: value => {
                if (_.startsWith(value.toLowerCase(), 'swagen-')) {
                    return value.substr('swagen-'.length);
                }
                return value;
            },
            validate: (value, answers) => {
                if (!value) {
                    return false;
                }
                try {
                    const package = require(`swagen-${value}`);
                    const modes = package instanceof Array ? package : [package];
                    const isValid = !!modes && modes.length > 0;
                    if (isValid) {
                        const urlSources = getExistingConfigSources('url');
                        const fileSources = getExistingConfigSources('file');
                        answers.internal = {
                            modes,
                            selectedMode: modes[0],
                            urlSources,
                            urlSourceChoices: buildSourceChoices(urlSources),
                            fileSources,
                            fileSourceChoices: buildSourceChoices(fileSources)
                        };
                    }
                    return isValid;
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
            when: answers => answers.internal.modes.length > 1,
            type: 'list',
            name: 'mode',
            message: answers => `The 'swagen-${answers.generator}' generator supports multiple generation modes. Select required mode`,
            choices: answers => answers.internal.modes.map(mode => ({
                name: `${mode.description} (language: ${mode.language})`,
                value: mode.name
            }))
        },

        {
            when: answers => {
                const selectedMode = answers.mode;
                answers.internal.selectedMode = answers.internal.modes.find(m => m.name === selectedMode) || answers.internal.modes[0];
                return true;
            },
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
            when: answers => answers.source === 'url' && answers.internal.urlSources.length > 0,
            type: 'list',
            name: 'url',
            message: 'Do you want to select an existing URL from configuration?',
            choices: answers => answers.internal.urlSourceChoices
        },

        {
            when: answers => answers.source === 'url' && !answers.url,
            type: 'input',
            name: 'url',
            message: 'Enter Swagger URL',
            validate: value => !!value
        },

        {
            when: answers => answers.source === 'file' && answers.internal.fileSources.length > 0,
            type: 'list',
            name: 'file',
            message: 'Do you want to select an existing file from configuration?',
            choices: answers => answers.internal.fileSourceChoices
        },

        {
            when: answers => answers.source === 'file' && !answers.file,
            type: 'input',
            name: 'file',
            message: 'Enter Swagger file path',
            validate: value => !!value
        },

        {
            type: 'input',
            name: 'output',
            message: 'Path to the output file (directory must exist, file does not need to)',
            validate: value => !!value,
            default: answers => `./output.${answers.internal.selectedMode.extension || 'txt'}`
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
