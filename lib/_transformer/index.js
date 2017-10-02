'use strict';

const library = require('./library');

module.exports = class Transformer {
    constructor(profile) {
        this.profile = profile;
    }

    transformDefinition(definition) {
        // Transform all enum names in the definition
        for (const e in definition.enums) {
            const transformedName = this.modelName(e, {});
            if (transformedName === e) {
                continue;
            }
            if (definition.enums[transformedName]) {
                throw new Error(`Cannot transform enum named '${e}'. The transformed name is '${transformedName}', which already exists.`);
            }
            const enumValue = definition.enums[e];
            delete definition.enums[e];
            definition.enums[transformedName] = enumValue;
        }

        //TODO: Transform all enum member names
        // for (let e in definition.enums) {
        //     let enumType = definition.enums[e];
        // }

        // Transform all model names in the definition
        for (const m in definition.models) {
            const transformedName = this.modelName(m, {});
            if (transformedName === m) {
                continue;
            }
            if (definition.models[transformedName]) {
                throw new Error(`Cannot transform model named '${m}'. The transformed name is '${transformedName}', which already exists.`);
            }
            const model = definition.models[m];
            delete definition.models[m];
            definition.models[transformedName] = model;
        }

        // Update all enum/complex property types in the models
        // Transform all property names within the models
        for (const m in definition.models) {
            const model = definition.models[m];
            for (const p in model) {
                const property = model[p];
                if (property.enum) {
                    property.enum = this.modelName(property.enum, {});
                } else if (property.complex) {
                    property.complex = this.modelName(property.complex, {});
                }

                const transformedName = this.propertyName(p, {});
                if (transformedName === p) {
                    continue;
                }
                if (model[transformedName]) {
                    throw new Error(`Cannot transform property named '${m}.${p}'. The transformed name is '${m}.${transformedName}', which already exists.`);
                }
                property.originalName = p;
                delete model[p];
                model[transformedName] = property;
            }
        }

        // Update all parameter/response types in operations
        for (const s in definition.services) {
            const service = definition.services[s];
            for (const o in service) {
                const operation = service[o];
                for (let i = 0; i < operation.parameters.length; i++) {
                    operation.parameters[i].name = this.parameterName(operation.parameters[i].name, {});
                    if (operation.parameters[i].dataType.enum) {
                        operation.parameters[i].dataType.enum = this.modelName(operation.parameters[i].dataType.enum, {});
                    } else if (operation.parameters[i].dataType.complex) {
                        operation.parameters[i].dataType.complex = this.modelName(operation.parameters[i].dataType.complex, {});
                    }
                }
                for (const r in operation.responses) {
                    const response = operation.responses[r];
                    if (response.dataType) {
                        if (response.dataType.enum) {
                            response.dataType.enum = this.modelName(response.dataType.enum);
                        } else if (response.dataType.complex) {
                            response.dataType.complex = this.modelName(response.dataType.complex);
                        }
                    }
                }

                const transformedName = this.operationName(o, {});
                delete service[o];
                service[transformedName] = operation;
            }

            const transformedServiceName = this.serviceName(s, {});
            delete definition.services[s];
            definition.services[transformedServiceName] = service;
        }
    }

    modelName(modelName, details) {
        return this.internalTransform('modelName', modelName, details);
    }

    operationName(operationName, details) {
        return this.internalTransform('operationName', operationName, details);
    }

    parameterName(parameterName, details) {
        return this.internalTransform('parameterName', parameterName, details);
    }

    propertyName(propertyName, details) {
        return this.internalTransform('propertyName', propertyName, details);
    }

    serviceName(serviceName, details) {
        return this.internalTransform('serviceName', serviceName, details);
    }

    /**
     * Common function to accept a name from the definition and use transforms to change its name.
     * @param {string} targetType The definition type who's name is being transformed. Could be
     * serviceName, operationName, modelName, etc.
     * @param {string} targetName The original name of the target type from the definition
     * @param {*} details Additional details. Varies based on the target type.
     */
    internalTransform(targetType, targetName, details) {
        // Get the transforms for the specified targetType (serviceName, operationName, modelName, etc.)
        let transforms = this.profile.transforms[targetType];
        if (!transforms) {
            return targetName;
        }

        // The transform value can be an array, function or string.
        // If the transform is not an array, enclose it in an array.
        if (!(transforms instanceof Array)) {
            transforms = [transforms];
        }

        // Iterate over each transform and update the transformed name.
        let transformedName = targetName;
        for (const transform of transforms) {
            if (typeof transform === 'function') {
                transformedName = transform(transformedName, details);
            } else if (typeof transform === 'string') {
                const transformParts = transform.split(':').map(t => t.trim());
                const libraryTransform = library[targetType].find(t => t.name === transformParts[0]);
                if (!libraryTransform) {
                    throw new Error(`Could not find built-in transform named ${transformParts[0]}.`);
                }
                const args = transformParts.slice(1);
                transformedName = libraryTransform.transformer(transformedName, details, args);
            } else {
                throw new Error(`Invalid transform specified - ${transform}. A transform can only be a function or a string`);
            }
        }

        return transformedName;
    }
};
