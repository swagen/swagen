'use strict';

const fs = require('fs');
const process = require('process');
const path = require('path');
const os = require('os');

const needle = require('needle');
const _ = require('lodash');

const utils = require('../utils');
const cli = utils.cli;
const helpCommand = require('../help');
const Parser = require('../_parser');
const Transformer = require('../_transformer');

const currentDir = process.cwd();

const configScriptFileName = 'swagen.config.js';
const configJsonFileName = 'swagen.config.json';

//TODO: Use utils.loadConfig
// function getConfig() {
//     const configScript = path.resolve(currentDir, configScriptFileName);
//     if (fs.existsSync(configScript)) {
//         return require(configScript);
//     }

//     const configJson = path.resolve(currentDir, configJsonFileName);
//     if (fs.existsSync(configJson)) {
//         return require(configJson);
//     }

//     const errorMessage = [
//         `Specify a ${configScriptFileName} or ${configJsonFileName} file to configure the swagen tool.`,
//         ``,
//         `To create a configuration file in the current directory, use the following command:`,
//         ``,
//         `    swagen init`,
//         ``,
//         `This will ask you a series of questions and generate a configuration file based on your answers.`
//     ].join(os.EOL);
//     throw errorMessage;
// }

/**
 * Ensure that the profile structure is valid.
 */
function verifyProfile(profile, profileKey) {
    if (!profile.file && !profile.url) {
        throw new Error(`[${profileKey}] Must specify a file or url in the configuration.`);
    }
    if (!profile.output) {
        throw new Error(`[${profileKey}] Must specify an output file path in the configuration.`);
    }
    if (!profile.generator) {
        throw new Error(`[${profileKey}] Must specify a generator in the configuration.`);
    }
    if (profile.generator.toLowerCase() === 'core') {
        throw new Error(`[${profileKey}] Invalid generator ${profile.generator}. This name is reserved.`);
    }
    if (profile.generator.match(/^[\w-]+-language$/i)) {
        throw new Error(`[${profileKey}] Invalid generator ${profile.generator}. The -language suffix is reserved for language helper packages.`);
    }
    if (!profile.debug) {
        profile.debug = {};
    }
    if (!profile.transforms) {
        profile.transforms = {};
    }
    if (!profile.options) {
        profile.options = {};
    }
}

/**
 * Reads the swagger json from a file specified in the profile.
 * @param {Profile} profile - The profile being handled.
 * @param {String} profileKey - The name of the profile.
 */
function handleFileSwagger(profile, profileKey) {
    const inputFilePath = path.resolve(currentDir, profile.file);
    cli.info(`[${profileKey}] Input swagger file : ${inputFilePath}`);
    fs.readFile(inputFilePath, 'utf8', (error, swagger) => {
        if (error) {
            cli.error(`Cannot read swagger file '${profile.file}'.`);
            cli.error(error);
        } else {
            handleSwagger(swagger, profile, profileKey);
        }
    });
}

/**
 * Reads the swagger json from a URL specified in the profile.
 * @param {Profile} profile The profile being handled.
 * @param {String} profileKey The name of the profile.
 */
function handleUrlSwagger(profile, profileKey) {
    cli.info(`[${profileKey}] Input swagger URL : ${profile.url}`);
    needle.get(profile.url, (err, resp, body) => {
        if (err) {
            cli.error(`Cannot read swagger URL '${profile.url}'.`);
            cli.error(err);
        } else {
            handleSwagger(body, profile, profileKey);
        }
    });
}

/**
 * Iterates through each profile in the config and handles the swagger.
 * @param {Object} config Configuration object
 */
function processInputs(config) {
    for (const profileKey in config) {
        const profile = config[profileKey];
        if (profile.skip) {
            continue;
        }

        verifyProfile(profile, profileKey);

        if (profile.file) {
            handleFileSwagger(profile, profileKey);
        } else {
            handleUrlSwagger(profile, profileKey);
        }
    }
}

function handleSwagger(swagger, profile, profileKey) {
    // Swagger should be an object. If it is a string, parse it.
    if (typeof swagger === 'string') {
        try {
            swagger = JSON.parse(swagger);
        } catch (e) {
            cli.error(`Invalid swagger source for profile '${profileKey}'.`);
            if (e instanceof SyntaxError) {
                if (e.lineNumber) {
                    cli.error(`At line number ${e.lineNumber}.`);
                }
                if (e.message) {
                    cli.error(e.message);
                }
            }
            return;
        }
    }

    // Parse the swagger and create a in-memory definition
    const parser = new Parser(swagger);
    const definition = parser.parse();

    // Run any transforms on the definition
    const transformer = new Transformer(profile);
    transformer.transformDefinition(definition);

    // Write the definition to a file if configured so
    if (profile.debug.definition) {
        const definitionJson = JSON.stringify(definition, null, 4);
        fs.writeFileSync(path.resolve(currentDir, profile.debug.definition), definitionJson, 'utf8');
        cli.debug(`[${profileKey}] Definition file written to '${profile.debug.definition}'.`);
    }

    // Load the generator package
    let generatorPkg;
    if (_.startsWith(profile.generator, '.')) {
        generatorPkg = require(path.resolve(currentDir, profile.generator));
    } else {
        generatorPkg = require(`swagen-${profile.generator}`);
    }

    // If the generator package exports a validateProfile function, call it to validate the profile.
    // If the profile fails validation, it should throw an exception.
    if (typeof generatorPkg.validateProfile === 'function') {
        generatorPkg.validateProfile(profile);
    }

    // Generate the code from the generator package
    const output = generatorPkg.generate(definition, profile);

    // Write the generated code to a file
    const outputFilePath = path.resolve(currentDir, profile.output);
    fs.writeFileSync(path.resolve(currentDir, outputFilePath), output, 'utf8');
    cli.info(`[${profileKey}] Code generated at '${outputFilePath}'.`);
}

module.exports = function() {
    try {
        const config = utils.loadConfig();
        processInputs(config);
    } catch (ex) {
        if (typeof ex === 'string') {
            cli.error(ex);
            helpCommand();
        } else {
            console.log(ex);
        }
    }
};
