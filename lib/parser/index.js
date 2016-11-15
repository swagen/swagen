'use strict';

const buildMetadata = require('./build-metadata');
const buildModel = require('./build-models');
const buildServices = require('./build-services');

function parse(swagger) {
    let swaggerObject = getSwaggerObject(swagger);

    let definition = require('./definition');
    definition.metadata = {};
    definition.models = {};
    definition.services = {};

    buildMetadata(swaggerObject);
    buildModel(swaggerObject);
    buildServices(swaggerObject);

    return definition;
}

function getSwaggerObject(swagger) {
    if (typeof swagger === 'string') {
        return JSON.parse(swagger);
    }
    if (typeof swagger === 'object') {
        return swagger;
    }
    throw new Error(`Unrecognized swagger data of type ${typeof swagger}:\n${swagger}`);
}

module.exports = parse;
