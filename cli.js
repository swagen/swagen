#!/usr/bin/env node

'use strict';

let process = require('process');
let path = require('path');
let fs = require('fs');
let http = require('http');

let chalk = require('chalk');

let currentDir = process.cwd();

function getConfig() {
    let configScript = path.resolve(currentDir, 'swagen.js');
    if (fs.existsSync(configScript)) {
        return require(configScript);
    }

    let configJson = path.resolve(currentDir, 'swagen.json');
    if (fs.existsSync(configJson)) {
        return require(configJson);
    }

    throw new Error('Please specify a swagen.js or swagen.json file to configure the swagen tool.');
}

function handleSwagger(swagger, outputFile, inputs) {
    if (typeof swagger === 'string') {
        swagger = JSON.parse(swagger);
    }

    let parser = require('./lib/parser');
    let definition = parser(swagger);
    if (inputs.debug && inputs.debug.definition) {
        let definitionJson = JSON.stringify(definition, null, 4);
        fs.writeFileSync(path.resolve(currentDir, inputs.debug.definition), definitionJson, 'utf8');
    }

    let generator = require('./lib/generator');
    let output = generator(definition);

    fs.writeFileSync(path.resolve(currentDir, outputFile), output, 'utf8');
}

function processInputs(config) {
    for (let outputFile in config) {
        let inputs = config[outputFile];

        let outputFilePath = path.resolve(currentDir, outputFile);
        console.log(`Output path: ${outputFilePath}`);

        if (inputs.source.file) {
            let inputFilePath = path.resolve(currentDir, inputs.source.file);
            console.log(`Input path : ${inputFilePath}`);
            fs.readFile(inputFilePath, 'utf8', function(error, swagger) {
                if (error) {
                    throw error;
                }
                handleSwagger(swagger, outputFilePath, inputs);
            });
        } else {
            let swagger = '';
            let request = http.request(inputs.source.url, function(response) {
                response.setEncoding('utf8');
                response.on('data', function(chunk) {
                    swagger += chunk;
                });
                response.on('end', function() {
                    handleSwagger(swagger, outputFile, inputs);
                });
            });
            request.end();
        }
    }
}

let config = getConfig();
processInputs(config);
