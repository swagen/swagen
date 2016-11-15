'use strict';

const _ = require('lodash');

function getDataType(property, name) {
    let typeName = property.primitive ? getPrimitiveTypeName(property, name) : property.complex;
    if (property.isArray) {
        typeName += '[]';
    }
    return typeName;
}

function getPrimitiveTypeName(property, name) {
    switch (property.primitive) {
        case 'integer':
        case 'number':
            return 'number';
        case 'string': {
            switch (property.subType) {
                case 'date-time':
                    return 'Date';
                case 'uuid':
                    return 'string';
                case 'byte':
                    return 'number';
                case 'enum':
                    return `${_.upperFirst(_.camelCase(name))}Enum`;
                default:
                    return 'string';
            }
        }
        case 'boolean':
            return 'boolean';
        case 'file':
        case 'object':
            return 'any';
        default:
            throw `Cannot translate primitive type ${JSON.stringify(property, null, 4)}`;
    }
}

module.exports = getDataType;
