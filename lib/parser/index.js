'use strict';

const _ = require('lodash');
const getDataType = require('./get-data-type');

module.exports = class Parser {
    constructor(swagger) {
        this.swagger = this.getSwaggerObject(swagger);
    }

    getSwaggerObject(swagger) {
        if (typeof swagger === 'string') {
            return JSON.parse(swagger);
        }
        if (typeof swagger === 'object') {
            return swagger;
        }
        throw `Unrecognized swagger data of type ${typeof swagger}:\n${swagger}`;
    }

    parse() {
        this.definition = {
            metadata: {},
            services: {},
            models: {}
        };
        this.parseMetadata();
        this.parseModels();
        this.parseServices();
        return this.definition;
    }

    parseMetadata() {
        if (this.swagger.info) {
            this.definition.metadata.description = this.swagger.info.description;
            this.definition.metadata.title = this.swagger.info.title;
        }

        let baseUrl = this.swagger.schemes && typeof this.swagger.schemes === 'array' && this.swagger.schemes.length > 0
            ? this.swagger.schemes[0] : 'http';
        baseUrl += `://${this.swagger.host || 'localhost'}${this.swagger.basePath || ''}`;
        if (!_.endsWith(baseUrl, '/')) {
            baseUrl += '/';
        }
        this.definition.metadata.baseUrl = baseUrl;
    }

    parseModels() {
        for (let def in this.swagger.definitions) {
            if (this.swagger.definitions.hasOwnProperty(def)) {
                let model = this.parseModel(this.swagger.definitions[def]);
                this.definition.models[def] = model;
            }
        }
    }

    parseModel(def) {
        let model = {};
        for (let prop in def.properties) {
            if (def.properties.hasOwnProperty(prop)) {
                model[prop] = getDataType(def.properties[prop]);
            }
        }
        return model;
    }

    parseServices() {
        for (let pathKey in this.swagger.paths) {
            for (let verbKey in this.swagger.paths[pathKey]) {
                let verb = this.swagger.paths[pathKey][verbKey];
                if (!verb.tags || !verb.tags.length) {
                    throw new Error(`Cannot figure out service name for following endpoint because it contains no tags\n:${verbKey} ${pathKey}`);
                }
                let serviceName = verb.tags[0];
                if (!this.definition.services[serviceName]) {
                    this.definition.services[serviceName] = {};
                }
                let operationName = verb.operationId;
                if (!operationName) {
                    throw new Error(`Cannot figure out name for following endpoint because it contains no operationId\n:${verbKey} ${pathKey}`);
                }
                this.definition.services[serviceName][operationName] = this.parseOperation(pathKey, verbKey, verb);
            }
        }
    }

    parseOperation(path, verb, details) {
        let operation = {
            description: details.summary,
            path: path,
            verb: verb,
            parameters: []
        };

        if (details.parameters && details.parameters.length) {
            for (let i = 0; i < details.parameters.length; i++) {
                let param = details.parameters[i];
                operation.parameters.push({
                    name: param.name,
                    type: param['in'],
                    description: param.description,
                    required: param.required,
                    dataType: getDataType(param)
                });
            }
        }

        if (details.responses) {
            operation.responses = {};
            for (let statusCodeKey in details.responses) {
                let response = details.responses[statusCodeKey];
                let statusCode = +statusCodeKey;
                let dataType = response.schema ? getDataType(response.schema) : undefined;

                let responseDetails = {};
                if (dataType) {
                    responseDetails.dataType = dataType;
                }
                operation.responses[statusCodeKey] = responseDetails;
            }
        }

        return operation;
    }
}
