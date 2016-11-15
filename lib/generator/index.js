'use strict';

const generateInitialCode = require('./generate-initial-code');
const generateServices = require('./generate-services');
const generateModels = require('./generate-models');
const generateEnums =require('./generate-enums');

const newline = require('os').EOL;

module.exports = function(definition) {
    let code = generateInitialCode(definition);
    generateServices(definition, code);
    code.push('');
    generateModels(definition, code);
    code.push('');
    generateEnums(definition, code);
    return code.join(newline);
};
