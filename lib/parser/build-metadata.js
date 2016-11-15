'use strict';

const _ = require('lodash');
let definition = require('./definition');

function buildMetadata(swagger) {
    if (swagger.info) {
        definition.metadata.description = swagger.info.description;
        definition.metadata.title = swagger.info.title;
    }

    let baseUrl = swagger.schemes && typeof swagger.schemes === 'array' && swagger.schemes.length > 0
        ? swagger.schemes[0] : 'http';
    baseUrl += `://${swagger.host || 'localhost'}${swagger.basePath || ''}`;
    if (!_.endsWith(baseUrl, '/')) {
        baseUrl += '/';
    }
    definition.metadata.baseUrl = baseUrl;
}

module.exports = buildMetadata;
