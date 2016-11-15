'use strict';

function verifyResult(result, property) {
    if (!result.complex && !result.primitive) {
        throw new Error(`Could not figure out the type for property:\n${JSON.stringify(property)}`);
    }
    if (result.isArray === undefined) {
        throw new Error(`Could not figure out whether the property is an array or not:\n${JSON.stringify(property)}`);
    }
}

function updateTypeDetails(data, result) {
    if (data.$ref) {
        result.complex = resolveObjectType(data.$ref);
    } else if (data.type) {
        result.primitive = data.type;
        result.subType = data.format;
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

//complex/primitive: <type name>
//subType: <for primitive types> (optional)
//isArray: boolean
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
