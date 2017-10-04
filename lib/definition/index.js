'use strict';

const fs = require('fs');
const path = require('path');
const process = require('process');

const needle = require('needle');

const utils = require('../utils');
const cli = utils.cli;
const Parser = require('../generate/parser');
const currentDir = process.cwd();

function handleFileSwagger(file, outputFile) {
    const inputFilePath = path.resolve(currentDir, file);
    fs.readFile(inputFilePath, 'utf8', (error, swagger) => {
        if (error) {
            cli.error(`Cannot read swagger file '${inputFilePath}'.`);
            cli.error(error);
        } else {
            buildDefinition(swagger, outputFile);
        }
    });
}

function handleUrlSwagger(url, outputFile) {
    needle.get(url, (err, resp, body) => {
        if (err) {
            cli.error(`Cannot read swagger URL '${url}'.`);
            cli.error(err);
        } else {
            buildDefinition(body, outputFile);
        }
    });
}

function buildDefinition(swagger, outputFile) {
    // Ensure swagger is an object and not the swagger JSON
    swagger = utils.resolveSwaggerObject(swagger);

    // Parse the swagger and create a in-memory definition
    const parser = new Parser(swagger);
    const definition = parser.parse();

    // Write the definition to the output file
    const definitionJson = JSON.stringify(definition, null, 4);
    fs.writeFileSync(path.resolve(currentDir, outputFile), definitionJson, 'utf8');
    cli.info(`Definition file written to '${outputFile}'.`);
}

module.exports = function(args) {
    const file = args.file;
    const url = args.url;
    if (!file && !url) {
        throw new Error(`Specify a file or URL to load the Swagger JSON from.`);
    }
    if (file && url) {
        throw new Error(`Cannot specify both a file and a URL.`);
    }

    if (!args._ || args._.length === 0) {
        throw new Error(`Please specify a definition file to output the definition to.`);
    }
    const outputFile = args._[0];
    if (file) {
        handleFileSwagger(file, outputFile);
    } else {
        handleUrlSwagger(url, outputFile);
    }
};
