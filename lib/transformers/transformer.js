'use strict';

const defaultTransforms = require('./defaults');

module.exports = class Transformer {
    constructor(profile) {
        this.profile = profile;
    }

    operationName(operationName, details) {
        let transform = this.profile.transforms.operationName;
        if (typeof transform === 'function') {
            return transform(operationName, details);
        }
        if (typeof transform === 'string') {
            let transformFn = defaultTransforms.operationName[transform];
            return transformFn ? transformFn(this.profile, operationName, details) : operationName;
        }
        return operationName;
    }

    serviceName(serviceName, details) {
        let transform = this.profile.transforms.serviceName;
        if (typeof transform === 'function') {
            return transform(serviceName, details);
        }
        if (typeof transform === 'string') {
            let transformFn = defaultTransforms.serviceName[transform];
            return transformFn ? transformFn(this.profile, serviceName, details) : serviceName;
        }
        return serviceName;
    }
}
