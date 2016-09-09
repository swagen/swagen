'use strict';

function getSwaggerObject(swagger) {
    if (typeof swagger === 'string') {
        return JSON.parse(swagger);
    }
    if (typeof swagger === 'object') {
        return swagger;
    }
    throw new Error(`Unrecognized swagger data of type ${typeof swagger}:\n${swagger}`);
}

module.exports = function(swagger) {
    let swaggerObject = getSwaggerObject(swagger);

    let definition = require('./definition');
    definition.models = {};
    definition.services = {};

    let buildModel = require('./build-models');
    buildModel(swaggerObject);

    let buildServices = require('./build-services');
    buildServices(swaggerObject);

    return definition;
};

