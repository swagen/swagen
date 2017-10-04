'use strict';

module.exports = class DataTypeResolver {
    resolve(property) {
        if (property.schema) {
            property = property.schema;
        }

        const dataType = {};

        if (property.type === 'array') {
            dataType.isArray = true;
        }

        if (dataType.isArray) {
            if (!property.items) {
                throw new Error(`Array properties should specify a items property\n${JSON.stringify(property)}.`);
            }
            this.updateTypeDetails(property.items, dataType);
        } else {
            this.updateTypeDetails(property, dataType);
        }

        this.verifyResult(property, dataType);

        return dataType;
    }

    updateTypeDetails(property, dataType) {
        if (property.$ref) {
            dataType.complex = this.resolveComplexType(property.$ref);
        } else if (property.type) {
            if (property.type === 'string' && property.enum) {
                dataType.enum = '#';
                dataType.values = property.enum;
            } else {
                dataType.primitive = property.type;
                if (property.format) {
                    dataType.subType = property.format;
                }
            }
        } else {
            throw new Error(`Type information could not be inferred from:\n${JSON.stringify(property)}`);
        }
    }

    resolveComplexType(jsonRef) {
        if (!jsonRef) {
            throw new Error(`Cannot resolve empty $ref definition.`);
        }
        const refParts = jsonRef.split('/');
        if (refParts.length !== 3 || refParts[0] !== '#' || refParts[1] !== 'definitions') {
            throw new Error(`Unrecognized or invalid $ref ${jsonRef}`);
        }
        return refParts[2];
    }

    verifyResult(property, dataType) {
        if (!dataType.complex && !dataType.primitive && !dataType.enum) {
            throw new Error(`Could not figure out the type for property:\n${JSON.stringify(property)}`);
        }
    }
};
