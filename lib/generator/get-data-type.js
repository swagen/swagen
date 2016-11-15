'use strict';

function getDataType(property) {
    let typeName = property.primitive ? getPrimitiveTypeName(property) : property.complex;
    if (property.isArray) {
        typeName += '[]';
    }
    return typeName;
}

function getPrimitiveTypeName(property) {
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
