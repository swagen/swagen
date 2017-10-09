'use strict';

const chalk = require('chalk');
const inquirer = require('inquirer');

const utils = require('../utils');
const prompts = require('./prompts');

const specifiedArgs = {
    console: false
};

function buildConfig(answers, generatorAnswers) {
    let configJson;
    try {
        // Try to load config from an existing swagen.config.json in the current directory
        configJson = utils.loadConfig(true);
    } catch(ex) {
        // If swagen.config.json does not exist in the current directory, start an empty
        // configuration
        configJson = {};
    }

    const mode = answers.internal.selectedMode;

    // Create the basic profile
    const config = {
        output: answers.output,
        generator: answers.generator,
        mode: mode.name
    };

    // Set the transforms on the profile from the mode's defaultTransforms property.
    // If any transform is not set, initialize it as an empty array.
    config.transforms = mode.defaultTransforms;
    config.transforms = config.transforms || {};
    config.transforms.serviceName = config.transforms.serviceName || [];
    config.transforms.operationName = config.transforms.operationName || [];
    config.transforms.parameterName = config.transforms.parameterName || [];
    config.transforms.modelName = config.transforms.modelName || [];
    config.transforms.propertyName = config.transforms.propertyName || [];

    // Set the Swagger source on the profile
    if (answers.source === 'url') {
        config.url = answers.url;
    } else {
        config.file = answers.file;
    }

    // Set the generator-specific options on the profile.
    // If the mode provides a buildProfile function, use it to set the options, otherwise just set it to {}
    config.options = {};
    if (typeof mode.buildProfile === 'function') {
        mode.buildProfile(config.options, generatorAnswers, answers);
    }

    // Finally, add the profile to the configuration
    configJson[answers.configKey] = config;

    if (specifiedArgs.console) {
        console.log(chalk.cyan(JSON.stringify(config, null, 4)));
    } else {
        const configJsonFilePath = utils.saveConfig(configJson);

        console.log();
        console.log(chalk`Configuration written to {cyan ${configJsonFilePath}}.`);
        console.log();
        console.log(chalk`Use the command '{cyan swagen}' to generate the code.`);
    }
}

module.exports = function(args) {
    // Initialize the CLI arguments
    specifiedArgs.defaults = args.defaults === true;

    // Ask the general questions
    console.log();
    console.log(chalk`{cyan.bold General questions:}`);
    inquirer.prompt(prompts).then(answers => {
        const mode = answers.internal.selectedMode;

        if (mode.prompts) {
            // Ask any generator-specific questions
            console.log();
            console.log(chalk`{cyan.bold Generator-specific questions:}`);
            inquirer.prompt(mode.prompts || []).then(generatorAnswers => {
                buildConfig(answers, generatorAnswers);
            });
        } else {
            buildConfig(answers, {});
        }
    });
};
