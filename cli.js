#!/usr/bin/env node

'use strict';

const process = require('process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const chalk = require('chalk');

const cli = require('./lib/cli');
const Parser = require('./lib/parser');

const currentDir = process.cwd();

const configScriptFileName = 'swagen.config.js';
const configJsonFileName = 'swagen.config.json';

function getConfig() {
    let configScript = path.resolve(currentDir, configScriptFileName);
    if (fs.existsSync(configScript)) {
        return require(configScript);
    }

    let configJson = path.resolve(currentDir, configJsonFileName);
    if (fs.existsSync(configJson)) {
        return require(configJson);
    }

    throw `Specify a ${configScriptFileName} or ${configJsonFileName} file to configure the swagen tool.`;
}

function processInputs(config) {
    for (let profileKey in config) {
        let profile = config[profileKey];

        if (!profile.file && !profile.url) {
            throw `[${profileKey}] Must specify a file or url as the swagger input`;
        }
        if (!profile.output) {
            throw `[${profileKey}] Must specify an output file path.`;
        }
        if (!profile.debug) {
            profile.debug = {};
        }
        if (!profile.transforms) {
            profile.transforms = {};
        }

        if (profile.file) {
            let inputFilePath = path.resolve(currentDir, profile.file);
            console.log(chalk.green(`[${profileKey}] Input swagger file : ${inputFilePath}`));
            fs.readFile(inputFilePath, 'utf8', function(error, swagger) {
                if (error) {
                    throw error;
                }
                handleSwagger(swagger, profile, profileKey);
            });
        } else {
            console.log(chalk.green(`[${profileKey}] Input swagger URL : ${profile.url}`));
            let swagger = '';
            let request = http.request(profile.url, function(response) {
                response.setEncoding('utf8');
                response.on('data', function(chunk) {
                    swagger += chunk;
                });
                response.on('end', function() {
                    handleSwagger(swagger, profile, profileKey);
                });
            });
            request.end();
        }
    }
}

let config = getConfig();
processInputs(config);

function handleSwagger(swagger, profile, profileKey) {
    if (typeof swagger === 'string') {
        swagger = JSON.parse(swagger);
    }

    let parser = new Parser(swagger);
    let definition = parser.parse();
    if (profile.debug.definition) {
        let definitionJson = JSON.stringify(definition, null, 4);
        fs.writeFileSync(path.resolve(currentDir, profile.debug.definition), definitionJson, 'utf8');
        cli.debug(`[${profileKey}] Definition file written to '${profile.debug.definition}'.`);
    }

    let output;
    if (!profile.generator) {
        let generator = new Generator(definition, profile);
        output = generator.generate();
    } else {
        let generatorPkg = require(`swagen-${profile.generator}`);
        if (typeof generatorPkg.validateProfile === 'function') {
            generatorPkg.validateProfile(profile.language, profile);
        }
        output = generatorPkg.generate(profile.language, definition, profile);
    }

    let outputFilePath = path.resolve(currentDir, profile.output);
    fs.writeFileSync(path.resolve(currentDir, outputFilePath), output, 'utf8');
    console.log(chalk.green(`[${profileKey}] Code generated at '${outputFilePath}'.`))
}

module.exports = {
    Transformer: require('./lib/transformers/transformer')
};
