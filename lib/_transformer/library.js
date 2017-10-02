/**
 * Library of named transforms. This module returns the built-in named transforms for all transform types.
 */

'use strict';

const _ = require('lodash');

const camelCaseTransform = name => _.camelCase(name);
const pascalCaseTransform = name => _.upperFirst(_.camelCase(name));
const snakeCaseTransform = name => _.snakeCase(name);
const kebabCaseTransform = name => _.kebabCase(name);
const prefixTransform = (name, details, args) => {
    if (!args || args.length === 0) {
        return name;
    }
    return args[0] + name;
};
const suffixTransform = (name, details, args) => {
    if (!args || args.length === 0) {
        return name;
    }
    return name + args[0];
};
const replaceTransform = (name, details, args) => {
    if (!args || args.length !== 2) {
        return name;
    }
    const regexp = new RegExp(args[0], 'g');
    return name.replace(regexp, args[1]);
};

const library = {
    modelName: [
        { name: 'camel-case', transformer: camelCaseTransform },
        { name: 'pascal-case', transformer: pascalCaseTransform },
        { name: 'snake-case', transformer: snakeCaseTransform },
        { name: 'kebab-case', transformer: kebabCaseTransform },
        { name: 'prefix', transformer: prefixTransform },
        { name: 'suffix', transformer: suffixTransform },
        { name: 'replace', transformer: replaceTransform }
    ],
    operationName: [
        { name: 'camel-case', transformer: camelCaseTransform },
        { name: 'pascal-case', transformer: pascalCaseTransform },
        { name: 'snake-case', transformer: snakeCaseTransform },
        { name: 'kebab-case', transformer: kebabCaseTransform },
        { name: 'prefix', transformer: prefixTransform },
        { name: 'suffix', transformer: suffixTransform },
        { name: 'replace', transformer: replaceTransform }
    ],
    propertyName: [
        { name: 'camel-case', transformer: camelCaseTransform },
        { name: 'pascal-case', transformer: pascalCaseTransform },
        { name: 'snake-case', transformer: snakeCaseTransform },
        { name: 'kebab-case', transformer: kebabCaseTransform },
        { name: 'prefix', transformer: prefixTransform },
        { name: 'suffix', transformer: suffixTransform },
        { name: 'replace', transformer: replaceTransform }
    ],
    serviceName: [
        { name: 'camel-case', transformer: camelCaseTransform },
        { name: 'pascal-case', transformer: pascalCaseTransform },
        { name: 'snake-case', transformer: snakeCaseTransform },
        { name: 'kebab-case', transformer: kebabCaseTransform },
        { name: 'prefix', transformer: prefixTransform },
        { name: 'suffix', transformer: suffixTransform },
        { name: 'replace', transformer: replaceTransform }
    ],
    parameterName: [
        { name: 'camel-case', transformer: camelCaseTransform },
        { name: 'pascal-case', transformer: pascalCaseTransform },
        { name: 'snake-case', transformer: snakeCaseTransform },
        { name: 'kebab-case', transformer: kebabCaseTransform },
        { name: 'prefix', transformer: prefixTransform },
        { name: 'suffix', transformer: suffixTransform },
        { name: 'replace', transformer: replaceTransform }
    ]
};

module.exports = library;
