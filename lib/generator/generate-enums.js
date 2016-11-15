'use strict';

const _ = require('lodash');

function generateEnums(definition, code) {
    for (let serviceName in definition.services) {
        let service = definition.services[serviceName];
        for (let operationName in service) {
            let operation = service[operationName];
            for (let i = 0; i < operation.parameters.length; i++) {
                let dataType = operation.parameters[i].dataType;
                if (dataType.primitive && dataType.primitive === 'string' && dataType.subType === 'enum') {
                    let enumTypeName = _.upperFirst(_.camelCase(operation.parameters[i].name));
                    code.push(`export type ${enumTypeName}Enum = '${dataType.enumValues.join('\'|\'')}';`)
                }
            }
        }
    }
}

module.exports = generateEnums;
