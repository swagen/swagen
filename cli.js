#!/usr/bin/env node

'use strict';

let process = require('process');
let path = require('path');
let fs = require('fs');
let http = require('http');

let chalk = require('chalk');

let currentDir = process.cwd();

function getConfig() {
    let configScript = path.resolve(currentDir, 'swagger-client.js');
    if (fs.existsSync(configScript)) {
        return require(configScript);
    }

    let configJson = path.resolve(currentDir, 'swagger-client.json');
    if (fs.existsSync(configJson)) {
        return require(configJson);
    }

    throw new Error('Please specify a swagger-client.js or swagger-client.json file to configure the swagger-client tool.');
}

function handleSwagger(swagger, outputFile) {
    if (typeof swagger === 'string') {
        swagger = JSON.parse(swagger);
    }

    if (!swagger.info) {
        console.log(chalk.bold.red.bgBlack('No title found'));
        console.log(chalk.red.bgBlack('No description found'));
    } else {
        console.log(chalk.yellow.bgBlack.bold(swagger.info.title || 'No title found'));
        console.log(chalk.yellow.bgBlack(swagger.info.description || 'No description found'));
    }

    let parser = require('./lib/parser');
    let definition = parser(swagger);

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
                handleSwagger(swagger, outputFilePath);
            });
        } else {
            let swagger = '';
            let request = http.request(inputs.source.url, function(response) {
                response.setEncoding('utf8');
                response.on('data', function(chunk) {
                    swagger += chunk;
                });
                response.on('end', function() {
                    handleSwagger(swagger, outputFile);
                });
            });
            request.end();
        }
    }
}

let config = getConfig();
processInputs(config);
