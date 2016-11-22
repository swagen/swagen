'use strict';

const _ = require('lodash');

function getDataType(property, name, ns) {
    let typeName = property.primitive ? getPrimitiveTypeName(property, name, ns) : prefixNamespace(property.complex, ns);
    if (property.isArray) {
        typeName += '[]';
    }
    return typeName;
}

function getPrimitiveTypeName(property, name, ns) {
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
                    return prefixNamespace(`${_.upperFirst(_.camelCase(name))}Enum`, ns);
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

function prefixNamespace(name, ns) {
    return ns ? `__models.${name}` : name;
}

module.exports = getDataType;
