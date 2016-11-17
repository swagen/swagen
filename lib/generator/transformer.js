'use strict';

module.exports = class Transformer {
    constructor(profile) {
        this.profile = profile;
    }

    operationName(operationName, details) {
        let transformedOperationName = typeof this.profile.transforms.operationName === 'function'
            ? this.profile.transforms.operationName(operationName, details) : operationName;
        return transformedOperationName;
    }

    serviceName(serviceName, details) {
        let transformedServiceName = typeof this.profile.transforms.serviceName === 'function'
            ? this.profile.transforms.serviceName(serviceName, details) : serviceName;
        return transformedServiceName;
    }
}
