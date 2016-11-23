#!/usr/bin/env node

'use strict';

const process = require('process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const chalk = require('chalk');

const cli = require('./lib/cli');
const Generator = require('./lib/generator1');
const Parser = require('./lib/parser');

const currentDir = process.cwd();

const configScriptFileName = 'swagenfile.js';
const configJsonFileName = 'swagenfile.json';

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
            throw `Must specify a file or url as the swagger input for the profile '${profileKey}'`;
        }
        if (!profile.output) {
            throw `Must specify an output for the profile '${profileKey}'`;
        }
        if (!profile.debug) {
            profile.debug = {};
        }
        if (!profile.transforms) {
            profile.transforms = {};
        }

        if (profile.file) {
            let inputFilePath = path.resolve(currentDir, profile.file);
            console.log(chalk.green(`Input swagger file : ${inputFilePath}`));
            fs.readFile(inputFilePath, 'utf8', function(error, swagger) {
                if (error) {
                    throw error;
                }
                handleSwagger(swagger, profile);
            });
        } else {
            console.log(chalk.green(`Input swagger URL : ${profile.url}`));
            let swagger = '';
            let request = http.request(profile.url, function(response) {
                response.setEncoding('utf8');
                response.on('data', function(chunk) {
                    swagger += chunk;
                });
                response.on('end', function() {
                    handleSwagger(swagger, profile);
                });
            });
            request.end();
        }
    }
}

let config = getConfig();
processInputs(config);

function handleSwagger(swagger, profile) {
    if (typeof swagger === 'string') {
        swagger = JSON.parse(swagger);
    }

    let parser = new Parser(swagger);
    let definition = parser.parse();
    if (profile.debug.definition) {
        let definitionJson = JSON.stringify(definition, null, 4);
        fs.writeFileSync(path.resolve(currentDir, profile.debug.definition), definitionJson, 'utf8');
        cli.debug(`Definition file written to '${profile.debug.definition}'.`);
    }

    let output;
    if (!profile.generator) {
        let generator = new Generator(definition, profile);
        output = generator.generate();
    } else {
        let generatorPkg = require(`swagen-${profile.generator}`);
        output = generatorPkg.generate(profile.language, definition, profile);
    }

    let outputFilePath = path.resolve(currentDir, profile.output);
    fs.writeFileSync(path.resolve(currentDir, outputFilePath), output, 'utf8');
    console.log(chalk.green(`Code generated at '${outputFilePath}'.`))
}

module.exports = {
    Transformer: require('./lib/generator/transformer')
};
