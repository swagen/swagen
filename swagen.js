'use strict';

const _ = require('lodash');
let config = require('./swagen.json');

config.swagger1.transforms = {
    serviceName: 'pascalCase'
};

config.swagger2.transforms = {
    serviceName: 'pascalCase',
    operationName: function(operationName, details) {
        let pattern = /^(\w+)Using(GET|POST|PUT|DELETE|PATCH)$/;
        if (operationName.match(pattern)) {
            return _.camelCase(operationName.replace(pattern, '$1'));
        }
        console.warn(`Could not transform operation named ${operationName} under service ${details.serviceName}.`);
        return operationName;
    }
};

config.swagger3.transforms = {
    operationName: function(operationName, details) {
        let pattern = new RegExp(`^Api${details.serviceName}(\\w*)(Get|Post|Put|Delete|Patch)$`);
        if (operationName.match(pattern)) {
            return _.camelCase(operationName.replace(pattern, "$2$1"));
        }
        console.error(`Could not transform operation named ${operationName} under service ${details.serviceName}.`);
        return operationName;
    }
};

config.petstore.transforms = {
    serviceName: 'pascalCase'
};

module.exports = config;
