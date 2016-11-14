'use strict';

const generateServices = require('./generate-services');
const generateModels = require('./generate-models');

const newline = require('os').EOL;

module.exports = function(definition) {
    let code = [];
    generateServices(definition, code);
    generateModels(definition, code);
    return code.join(newline);
};
