const _ = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');

const utils = require('../utils');

/**
 * If a swagen.config.json configuration file exists in the current directory, any existing Swagger
 * sources for the specified source type (url or file) will be returned.
 * @param {'url'|'file'} sourceType
 * @returns {string[]} List of existing sources for the specified source type
 */
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

/**
 * Builds an inquirer.js list of choices from the given list of Swagger sources.
 * The choices list includes an additional item that specifies "None of the above".
 * @param {string[]} sources List of Swagger sources
 * @returns {Array} List of inquirer.js choices
 */
function buildSourceChoices(sources) {
    return [
        ...sources,
        new inquirer.Separator(),
        { name: `None of the above; I'll enter it manually.`, value: ''}
    ];
}

module.exports = [
    {
        name: 'generator',
        message: 'Generator package name',
        type: 'input',
        when: () => {
            console.log();
            console.log(chalk`{cyan Generators are special NPM packages that swagen uses to generate code from a swagger definition.}`);
            console.log(chalk`{cyan Anybody can write a generator and publish it as an NPM package for others to use. Generator package names must be prefixed with 'swagen-'.}`);
            console.log(chalk`{cyan To use a generator, it must be installed either globally on your system or locally in your project directory.}`);
            console.log(chalk`{cyan For the following question, specify the name of the generator you wish to use.}`);
            return true;
        },
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

            // Try to load the generator package
            let package;
            try {
                package = require(`swagen-${value}`);
            } catch (ex) {
                console.log();
                console.log(chalk`{red Cannot find swagen generator package named 'swagen-${value}'.}`);
                console.log(chalk`{red Either you typed the package name incorrectly or the package is not installed on your system.}`);
                console.log(chalk`{red Please re-enter the name.}`);
                return false;
            }

            const modes = package instanceof Array ? package : [package];
            const isValid = !!modes && modes.length > 0;
            if (isValid) {
                // Populate answers.internal with some precalculated values that can be
                // used in the other prompts.
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
        }
    },

    {
        name: 'mode',
        message: answers => `The 'swagen-${answers.generator}' generator supports multiple generation modes. Select required mode`,
        type: 'list',
        when: answers => answers.internal.modes.length > 1,
        choices: answers => answers.internal.modes.map(mode => ({
            name: `${mode.description} (language: ${mode.language})`,
            value: mode.name
        }))
    },

    {
        name: 'source',
        message: 'Select the source of the swagger data',
        type: 'list',
        when: answers => {
            const selectedMode = answers.mode;
            answers.internal.selectedMode = answers.internal.modes.find(m => m.name === selectedMode) || answers.internal.modes[0];
            return true;
        },
        choices: [
            { name: 'URL', value: 'url' },
            { name: 'Local file', value: 'file' }
        ],
        default: 'url'
    },

    {
        name: 'url',
        message: 'Do you want to select an existing URL from configuration?',
        type: 'list',
        when: answers => answers.source === 'url' && answers.internal.urlSources.length > 0,
        choices: answers => answers.internal.urlSourceChoices
    },

    {
        name: 'url',
        message: 'Enter Swagger URL',
        type: 'input',
        when: answers => answers.source === 'url' && !answers.url,
        validate: value => !!value
    },

    {
        name: 'file',
        message: 'Do you want to select an existing file from configuration?',
        type: 'list',
        when: answers => answers.source === 'file' && answers.internal.fileSources.length > 0,
        choices: answers => answers.internal.fileSourceChoices
    },

    {
        name: 'file',
        message: 'Enter Swagger file path',
        type: 'input',
        when: answers => answers.source === 'file' && !answers.file,
        validate: value => !!value
    },

    {
        name: 'output',
        message: 'Path to the output file (directory must exist, file does not need to)',
        type: 'input',
        validate: value => !!value,
        default: answers => `./output.${answers.internal.selectedMode.extension || 'txt'}`
    },

    {
        name: 'configKey',
        message: 'Descriptive name for this configuration profile',
        type: 'input',
        validate: value => !!value,
        default: answers => answers.file || answers.url
    }
];
