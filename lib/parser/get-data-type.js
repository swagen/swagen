'use strict';

function verifyResult(result, property) {
    if (!result.type) {
        throw new Error(`Could not figure out the type for type:\n${JSON.stringify(property)}`);
    }
    if (!result.kind) {
        throw new Error(`Could not figure out the kind of property:\n${JSON.stringify(property)}`);
    }
    if (result.isArray === undefined) {
        throw new Error(`Could not figure out whether the property is an array or not:\n${JSON.stringify(property)}`);
    }
}

function updateTypeDetails(data, result) {
    if (data.$ref) {
        result.kind = 'complex';
        result.type = resolveObjectType(data.$ref);
    } else if (data.type) {
        result.kind = 'primitive';
        result.type = data.type;
        result.subType = data.format;
        result.required = data.required;
    } else {
        throw new Error(`Type information could not be inferred from\n:${JSON.stringify(data)}`);
    }
}

function resolveObjectType(jsonRef) {
    if (!jsonRef) {
        throw new Error('Cannot resolve empty $ref definition');
    }
    let refParts = jsonRef.split('/');
    if (refParts.length !== 3 || refParts[0] !== '#' || refParts[1] !== 'definitions') {
        throw new Error(`Unrecognized or invalid $ref ${jsonRef}`);
    }
    return refParts[2];
}

//kind: complex, primitive,
//type: <type name>
//subType: <for primitive types>
//isArray: boolean
//required: boolean
module.exports = function(property) {
    if (property.schema) {
        property = property.schema;
    }

    let result = {
        isArray: property.type === 'array'
    };

    if (result.isArray) {
        if (!property.items) {
            throw new Error(`Array properties should specify a items property\n${JSON.stringify(property)}.`);
        }
        updateTypeDetails(property.items, result);
    } else {
        updateTypeDetails(property, result);
    }

    verifyResult(result, property);

    return result;
}
