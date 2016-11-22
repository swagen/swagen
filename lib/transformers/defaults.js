'use strict';

const _ = require('lodash');

module.exports = {
    serviceName: {
        pascalCase: (profile, serviceName, details) => _.upperFirst(_.camelCase(serviceName)),
        camelCase: (profile, serviceName, details) => _.camelCase(serviceName)
    },
    operationName: {
        camelCase: (profile, serviceName, details) => _.camelCase(serviceName)
    }
};
