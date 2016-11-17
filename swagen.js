'use strict';

const _ = require('lodash');
let config = require('./swagen.json');

let angular2Options = {
    baseUrl: {
        provider: 'Config',
        variable: 'config',
        path: ['baseUrl']
    }
};

function transformServiceName(serviceName, details) {
    return _.upperFirst(_.camelCase(serviceName));
}

config.swagger1.options = angular2Options;
config.swagger1.transforms = {
    serviceName: transformServiceName
};

config.swagger2.options = angular2Options;

config.swagger3.options = angular2Options;
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

config.petstore.options = angular2Options;
config.petstore.transforms = {
    serviceName: transformServiceName
};

module.exports = config;
