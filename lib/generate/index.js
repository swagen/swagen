'use strict';

const fs = require('fs');
const path = require('path');
const process = require('process');

const chalk = require('chalk');
const needle = require('needle');
const _ = require('lodash');

const utils = require('../utils');

const Parser = require('./parser');
const Filterer = require('./filterer');
const Transformer = require('./transformer');

const currentDir = process.cwd();

function handleSwagger(swagger, profile, profileKey) {
    // Ensure swagger is an object and not the swagger JSON string
    swagger = utils.resolveSwaggerObject(swagger);

    // Parse the swagger and create a in-memory definition
    const parser = new Parser(swagger);
    const definition = parser.parse();

    // Run any filter logic on the definition and remove unwanted services and models
    const filterer = new Filterer(profile);
    filterer.filterDefinition(definition);

    // Run any transforms on the definition
    const transformer = new Transformer(profile);
    transformer.transformDefinition(definition);

    // Write the definition to a file if configured so
    if (profile.debug.definition) {
        const definitionJson = JSON.stringify(definition, null, 4);
        fs.writeFileSync(path.resolve(currentDir, profile.debug.definition), definitionJson, 'utf8');
        console.log(chalk`{green [${profileKey}]} Definition file written to '{cyan ${profile.debug.definition}}'.`);
    }

    // Load the generator package
    let generatorPkg;
    if (_.startsWith(profile.generator, '.')) {
        generatorPkg = require(path.resolve(currentDir, profile.generator));
    } else {
        generatorPkg = require(`swagen-${profile.generator}`);
    }

    const modes = generatorPkg instanceof Array ? generatorPkg : [generatorPkg];
    const mode = modes.find(m => m.name === profile.mode);

    // If the generator package exports a validateProfile function, call it to validate the profile.
    // If the profile fails validation, it should throw an exception.
    if (typeof mode.validateProfile === 'function') {
        mode.validateProfile(profile);
    }

    // Generate the code from the generator package
    const output = mode.generate(definition, profile);

    // Write the generated code to a file
    const outputFilePath = path.resolve(currentDir, profile.output);
    fs.writeFileSync(path.resolve(currentDir, outputFilePath), output, 'utf8');
    console.log(chalk`{green [${profileKey}]} Code generated at '{cyan ${outputFilePath}}'.`);
}

/**
 * Reads the swagger json from a file specified in the profile.
 * @param {Profile} profile - The profile being handled.
 * @param {String} profileKey - The name of the profile.
 */
function handleFileSwagger(profile, profileKey) {
    const inputFilePath = path.resolve(currentDir, profile.file);
    console.log(`{green [${profileKey}]} Input swagger file : {cyan ${inputFilePath}}`);
    fs.readFile(inputFilePath, 'utf8', (error, swagger) => {
        if (error) {
            console.log(chalk`{red Cannot read swagger file '{bold ${profile.file}}'.}`);
            console.log(chalk.red(error));
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
    console.log(`{green [${profileKey}]} Input swagger URL : {cyan ${profile.url}}`);
    needle.get(profile.url, (err, resp, body) => {
        if (err) {
            console.log(chalk`{red Cannot read swagger URL '{bold ${profile.url}}'.}`);
            console.log(chalk.red(err));
        } else {
            handleSwagger(body, profile, profileKey);
        }
    });
}

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
    profile.debug = profile.debug || {};
    profile.filters = profile.filters || {};
    profile.transforms = profile.transforms || {};
    profile.options = profile.options || {};
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

module.exports = function() {
    const config = utils.loadConfig();
    processInputs(config);
};
