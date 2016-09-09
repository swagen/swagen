'use strict';

let definition = require('./definition');

function buildOperation(path, verb, details) {
    let getDataType = require('./get-data-type');

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
            if (response.schema) {
                let statusCode = parseInt(statusCodeKey);
                let dataType = getDataType(response.schema);
                if (statusCode >= 200 && statusCode < 300) {
                    if (!operation.responses.success) {
                        operation.responses.success = {};
                    }
                    operation.responses.success[statusCodeKey] = dataType;
                } else if (statusCode >= 300 && statusCode < 400) {
                    if (!operation.responses.redirection) {
                        operation.responses.redirection = {};
                    }
                    operation.responses.redirection[statusCodeKey] = dataType;
                } else if (statusCode >= 400 && statusCode < 500) {
                    if (!operation.responses.clientError) {
                        operation.responses.clientError = {};
                    }
                    operation.responses.clientError[statusCodeKey] = dataType;
                } else if (statusCode >= 500 && statusCode < 600) {
                    if (!operation.responses.serverError) {
                        operation.responses.serverError = {};
                    }
                    operation.responses.serverError[statusCodeKey] = dataType;
                }
            }
        }
        // if (!operation.responses.success) {
        //     throw new Error(`No success response messages with schema defined for endpoint\n:${verb} ${path}`);
        // }
    }

    return operation;
}

module.exports = function(swagger) {
    for (let pathKey in swagger.paths) {
        for (let verbKey in swagger.paths[pathKey]) {
            let verb = swagger.paths[pathKey][verbKey];
            if (!verb.tags || !verb.tags.length) {
                throw new Error(`Cannot figure out service name for following endpoint because it contains no tags\n:${verbKey} ${pathKey}`);
            }
            let serviceName = verb.tags[0];
            if (!definition.services[serviceName]) {
                definition.services[serviceName] = {};
            }
            let operationName = verb.operationId;
            if (!operationName) {
                throw new Error(`Cannot figure out name for following endpoint because it contains no operationId\n:${verbKey} ${pathKey}`);
            }
            definition.services[serviceName][operationName] = buildOperation(pathKey, verbKey, verb);
        }
    }
};
