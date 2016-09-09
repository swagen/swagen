'use strict';

let definition = require('./definition');

function buildModel(def) {
    let getDataType = require('./get-data-type');
    let model = {};
    for (let prop in def.properties) {
        if (def.properties.hasOwnProperty(prop)) {
            model[prop] = getDataType(def.properties[prop]);
        }
    }
    return model;
}

module.exports = function(swagger) {
    for (let def in swagger.definitions) {
        if (swagger.definitions.hasOwnProperty(def)) {
            let model = buildModel(swagger.definitions[def]);
            definition.models[def] = model;
        }
    }
}