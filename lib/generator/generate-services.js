'use strict';

const _ = require('lodash');
const getDataType = require('./get-data-type');

function getMethodSignature(operationName, operation) {
    let parameters = '';
    for (let p = 0; p < (operation.parameters || []); p++) {
        let parameter = operation.parameters[p];
        if (parameters) {
            parameters += ', '
        }
        parameters += `${parameter.name}: ${getDataType(parameter.dataType)}`;
    }

    let returnType = '';
    if (operation.responses && operation.responses.success) {
        for (let successKey in operation.responses.success) {
            if (returnType) {
                returnType += ' | ';
            }
            returnType += getDataType(operation.responses.success[successKey]);
        }
    } else {
        returnType = 'void';
    }

    let methodSig = `${operationName}(${parameters}): Observable<${returnType}>`;
    return methodSig;
}

module.exports = function(definition, code) {
    for (let serviceName in definition.services) {
        let service = definition.services[serviceName];
        code.push(`export interface I${_.upperFirst(_.camelCase(serviceName))} {`);

        for (let operationName in service) {
            let operation = service[operationName];
            code.push(`    ${getMethodSignature(operationName, operation)};`)
        }

        code.push('}');

        code.push('');
    }
}
