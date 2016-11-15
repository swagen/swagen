'use strict';

const getDataType = require('./get-data-type');

module.exports = function(definition, code) {
    for (let modelName in definition.models) {
        let model = definition.models[modelName];
        code.push(`export interface ${modelName} {`);

        for (let propertyName in model) {
            let property = model[propertyName];
            code.push(`    ${propertyName}${property.required ? '?' : ''}: ${getDataType(property, propertyName)};`);
        }

        code.push('}');
    }
}
