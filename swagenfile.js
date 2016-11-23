'use strict';

const _ = require('lodash');
let config = require('./swagenfile.json');

let commonOptions = {
    moduleName: "common",
    baseUrl: {
        provider: "Config",
        variable: "config",
        path: ["baseUrl"]
    },
    namespaces: {
        services: "common.webservices",
        models: "common.webservices.models"
    },
    references: [
        "../../../../typings/index.d.ts",
        "../../../../typings/app.d.ts"
    ]
};

config.swagger1.options = commonOptions;
config.swagger1.transforms = {
    serviceName: 'pascalCase'
};

config.swagger2.options = commonOptions;
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

config.swagger3.options = commonOptions;
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

config.swagger4.options = commonOptions;
config.swagger4.transforms.operationName = function(operationName, details) {
    let pattern = new RegExp(`^${details.serviceName}_?(\\w+)$`, 'i');
    if (operationName.match(pattern)) {
        return _.camelCase(operationName.replace(pattern, '$1'));
    }
    console.error(`Could not transform operation named ${operationName} under service ${details.serviceName}.`);
    return operationName;
};

config.petstore.options = commonOptions;
config.petstore.transforms = {
    serviceName: 'pascalCase'
};

module.exports = config;
