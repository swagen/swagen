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
    // Swagger should be an object. If it is a string, parse it.
    if (typeof swagger === 'string') {
        try {
            swagger = JSON.parse(swagger);
        } catch (e) {
            cli.error(`Invalid swagger source.`);
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
    const definitionJson = JSON.stringify(definition, null, 4);
    fs.writeFileSync(path.resolve(currentDir, outputFile), definitionJson, 'utf8');
    cli.debug(`Definition file written to '${outputFile}'.`);
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
