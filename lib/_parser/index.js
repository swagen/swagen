'use strict';

const _ = require('lodash');
const DataTypeResolver = require('./data-type-resolver');

module.exports = class Parser {
    constructor(swagger) {
        this.swagger = this.getSwaggerObject(swagger);
        this.dataTypeResolver = new DataTypeResolver();
    }

    getSwaggerObject(swagger) {
        if (typeof swagger === 'string') {
            return JSON.parse(swagger);
        }
        if (typeof swagger === 'object') {
            return swagger;
        }
        throw new Error(`Unrecognized swagger data of type ${typeof swagger}:\n${swagger}`);
    }

    parse() {
        this.definition = {
            metadata: {},
            services: {},
            models: {},
            enums: {}
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

        let baseUrl = this.swagger.schemes && this.swagger.schemes instanceof Array && this.swagger.schemes.length > 0
            ? this.swagger.schemes[0] : 'http';
        baseUrl += `://${this.swagger.host || 'localhost'}${this.swagger.basePath || ''}`;
        if (!_.endsWith(baseUrl, '/')) {
            baseUrl += '/';
        }
        this.definition.metadata.baseUrl = baseUrl;
    }

    parseModels() {
        for (const def in this.swagger.definitions) {
            if (this.swagger.definitions.hasOwnProperty(def)) {
                const model = this.parseModel(this.swagger.definitions[def], def);
                this.definition.models[def] = model;
            }
        }
    }

    parseModel(def, name) {
        const model = {};
        const requiredProps = def.required || [];
        for (const prop in def.properties) {
            if (def.properties.hasOwnProperty(prop)) {
                model[prop] = this.dataTypeResolver.resolve(def.properties[prop]);
                model[prop].required = requiredProps.some(rp => rp === prop);
                this.tryAddEnum(model[prop], `${prop}_${name}`);
            }
        }
        return model;
    }

    parseServices() {
        for (const pathKey in this.swagger.paths) {
            for (const verbKey in this.swagger.paths[pathKey]) {
                const verb = this.swagger.paths[pathKey][verbKey];
                if (!verb.tags || !verb.tags.length) {
                    throw new Error(`Cannot figure out service name for following endpoint because it contains no tags\n:${verbKey} ${pathKey}`);
                }
                const serviceName = verb.tags[0];
                if (!this.definition.services[serviceName]) {
                    this.definition.services[serviceName] = {};
                }
                let operationName = verb.operationId;
                if (!operationName) {
                    const resolvedPath = pathKey.replace(/\/(\w)/g, (s, ...args) => {
                        return args[0].toUpperCase();
                    });
                    operationName = `${verbKey.toLowerCase()}${resolvedPath}`;
                }
                this.definition.services[serviceName][operationName] = this.parseOperation(pathKey, verbKey, verb, operationName);
            }
        }
    }

    parseOperation(path, verb, details, operationName) {
        const operation = {
            description: details.summary,
            description2: details.description,
            path: path,
            verb: verb,
            parameters: []
        };

        if (details.parameters && details.parameters.length) {
            for (let i = 0; i < details.parameters.length; i++) {
                const param = details.parameters[i];
                const parameter = {
                    name: param.name,
                    type: param['in'],
                    description: param.description,
                    required: param.required,
                    dataType: this.dataTypeResolver.resolve(param)
                };
                this.tryAddEnum(parameter.dataType, `${operationName}_${param.name}`);
                operation.parameters.push(parameter);
            }
        }

        if (details.responses) {
            operation.responses = {};
            for (const statusCodeKey in details.responses) {
                const response = details.responses[statusCodeKey];
                // const statusCode = +statusCodeKey;
                const dataType = response.schema ? this.dataTypeResolver.resolve(response.schema) : undefined;

                const responseDetails = {};
                if (dataType) {
                    responseDetails.dataType = dataType;
                    this.tryAddEnum(dataType, `${operationName}_Result_${statusCodeKey}`);
                }
                operation.responses[statusCodeKey] = responseDetails;
            }
        }

        return operation;
    }

    tryAddEnum(dataType, recommendedName) {
        if (!dataType.enum) {
            return;
        }
        const valueHash = dataType.values.join();
        for (const e in this.definition.enums) {
            const compareHash = this.definition.enums[e].join();
            if (valueHash === compareHash) {
                dataType.enum = e;
                delete dataType.values;
                return;
            }
        }
        dataType.enum = recommendedName;
        this.definition.enums[recommendedName] = dataType.values;
        delete dataType.values;
    }
};
