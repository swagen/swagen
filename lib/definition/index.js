'use strict';

const fs = require('fs');
const path = require('path');
const process = require('process');

const chalk = require('chalk');
const needle = require('needle');

const utils = require('../utils');
const Parser = require('../generate/parser');

const currentDir = process.cwd();

async function handleFileSwagger(file, outputFile) {
    return new Promise((resolve, reject) => {
        const inputFilePath = path.resolve(currentDir, file);
        fs.readFile(inputFilePath, 'utf8', (err, swagger) => {
            if (err) {
                reject(err);
            } else {
                buildDefinition(swagger, outputFile);
                resolve();
            }
        });
    });
}

async function handleUrlSwagger(url, outputFile) {
    const resp = await needle('get', url);
    buildDefinition(resp.body, outputFile);
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
    console.log(chalk`Definition file written to {cyan '${outputFile}}'.`);
}

module.exports = async function(args) {
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
        await handleFileSwagger(file, outputFile);
    } else {
        await handleUrlSwagger(url, outputFile);
    }
};
