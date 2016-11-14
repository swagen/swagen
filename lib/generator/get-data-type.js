'use strict';

function getDataType(property) {
    let typeName = property.kind === 'primitive' ? getPrimitiveTypeName(property) : property.type;
    if (property.isArray) {
        typeName += '[]';
    }
    return typeName;
}

function getPrimitiveTypeName(property) {
    switch (property.type) {
        case 'integer':
        case 'number':
            return 'number';
        case 'string': {
            switch (property.subType) {
                case 'date-time':
                    return 'Date';
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
