/// <reference path="../../typings/index.d.ts" />

'use strict';

const library = require('./library');

module.exports = class Transformer {
    constructor(profile) {
        this.profile = profile;
    }

    transformDefinition(definition) {
        // Transform all enum names in the definition
        for (const e in definition.enums) {
            const enumValue = definition.enums[e];
            const transformedName = this.modelName(e, {
                modelType: 'enum',
                model: enumValue
            });
            if (transformedName === e) {
                continue;
            }
            if (definition.enums[transformedName]) {
                throw new Error(`Cannot transform enum named '${e}'. The transformed name is '${transformedName}', which already exists.`);
            }
            delete definition.enums[e];
            definition.enums[transformedName] = enumValue;
        }

        //TODO: Transform all enum member names
        // for (let e in definition.enums) {
        //     let enumType = definition.enums[e];
        // }

        // Transform all model names in the definition
        for (const m in definition.models) {
            const model = definition.models[m];
            const transformedName = this.modelName(m, {
                modelType: 'complex',
                model
            });
            if (transformedName === m) {
                continue;
            }
            if (definition.models[transformedName]) {
                throw new Error(`Cannot transform model named '${m}'. The transformed name is '${transformedName}', which already exists.`);
            }
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
                    property.enum = this.modelName(property.enum, {
                        modelType: 'enum',
                        model
                    });
                } else if (property.complex) {
                    property.complex = this.modelName(property.complex, {
                        modelType: 'complex',
                        model
                    });
                }

                const transformedName = this.propertyName(p, {
                    modelType: property.enum ? 'enum' : 'complex',
                    model: model,
                    modelName: m,
                    property: property
                });
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
                    operation.parameters[i].name = this.parameterName(operation.parameters[i].name, {
                        service,
                        serviceName: s,
                        operation,
                        operationName: o,
                        parameters: operation.parameters
                    });
                    if (operation.parameters[i].dataType.enum) {
                        operation.parameters[i].dataType.enum = this.modelName(operation.parameters[i].dataType.enum, {
                            modelType: 'enum',
                            model: operation.parameters[i].dataType
                        });
                    } else if (operation.parameters[i].dataType.complex) {
                        operation.parameters[i].dataType.complex = this.modelName(operation.parameters[i].dataType.complex, {
                            modelType: 'complex',
                            model: operation.parameters[i].dataType
                        });
                    }
                }
                for (const r in operation.responses) {
                    const response = operation.responses[r];
                    if (response.dataType) {
                        if (response.dataType.enum) {
                            response.dataType.enum = this.modelName(response.dataType.enum, {
                                modelType: 'enum',
                                model: response.dataType
                            });
                        } else if (response.dataType.complex) {
                            response.dataType.complex = this.modelName(response.dataType.complex, {
                                modelType: 'complex',
                                model: response.dataType
                            });
                        }
                    }
                }

                const transformedName = this.operationName(o, {
                    serviceName: s,
                    service,
                    operation
                });
                delete service[o];
                service[transformedName] = operation;
            }

            const transformedServiceName = this.serviceName(s, { service });
            delete definition.services[s];
            definition.services[transformedServiceName] = service;
        }
    }

    /**
     *
     * @param {string} modelName
     * @param {ModelTransformDetails} details
     */
    modelName(modelName, details) {
        return this.internalTransform('modelName', modelName, details);
    }

    /**
     *
     * @param {string} operationName
     * @param {OperationTransformDetails} details
     */
    operationName(operationName, details) {
        return this.internalTransform('operationName', operationName, details);
    }

    /**
     *
     * @param {string} parameterName
     * @param {ParameterTransformDetails} details
     */
    parameterName(parameterName, details) {
        return this.internalTransform('parameterName', parameterName, details);
    }

    /**
     *
     * @param {string} propertyName
     * @param {PropertyTransformDetails} details
     */
    propertyName(propertyName, details) {
        return this.internalTransform('propertyName', propertyName, details);
    }

    /**
     *
     * @param {string} serviceName
     * @param {ServiceTransformDetails} details
     */
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
