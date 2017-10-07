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

const removePrefixTransform = (name, details, args) => {
    // args - comma-separated prefices
    if (!args || args !== 1) {
        console.log(`[remove-prefix] Invalid number of arguments.`);
        return name;
    }

    const prefices = args[0].split(',');
    const matchingPrefix = prefices.find(prefix => _.startsWith(name.toLowerCase(), prefix.toLowerCase()));
    return matchingPrefix ? name.substr(matchingPrefix.length) : name;
};

const suffixTransform = (name, details, args) => {
    if (!args || args.length === 0) {
        return name;
    }
    return name + args[0];
};

const removeSuffixTransform = (name, details, args) => {
    // args - comma-separated suffices
    if (!args || args !== 1) {
        console.log(`[remove-suffix] Invalid number of arguments.`);
        return name;
    }

    const suffices = args[0].split(',');
    const matchingSuffix = suffices.find(suffix => _.startsWith(name.toLowerCase(), suffix.toLowerCase()));
    return matchingSuffix ? name.substr(0, name.length - matchingSuffix.length) : name;
};

const replaceTransform = (name, details, args) => {
    //args - regex | replacement
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
        { name: 'remove-prefix', transformer: removePrefixTransform },
        { name: 'suffix', transformer: suffixTransform },
        { name: 'remove-suffix', transformer: removeSuffixTransform },
        { name: 'replace', transformer: replaceTransform }
    ],
    operationName: [
        { name: 'camel-case', transformer: camelCaseTransform },
        { name: 'pascal-case', transformer: pascalCaseTransform },
        { name: 'snake-case', transformer: snakeCaseTransform },
        { name: 'kebab-case', transformer: kebabCaseTransform },
        { name: 'prefix', transformer: prefixTransform },
        { name: 'remove-prefix', transformer: removePrefixTransform },
        { name: 'suffix', transformer: suffixTransform },
        { name: 'remove-suffix', transformer: removeSuffixTransform },
        { name: 'replace', transformer: replaceTransform }
    ],
    propertyName: [
        { name: 'camel-case', transformer: camelCaseTransform },
        { name: 'pascal-case', transformer: pascalCaseTransform },
        { name: 'snake-case', transformer: snakeCaseTransform },
        { name: 'kebab-case', transformer: kebabCaseTransform },
        { name: 'prefix', transformer: prefixTransform },
        { name: 'remove-prefix', transformer: removePrefixTransform },
        { name: 'suffix', transformer: suffixTransform },
        { name: 'remove-suffix', transformer: removeSuffixTransform },
        { name: 'replace', transformer: replaceTransform }
    ],
    serviceName: [
        { name: 'camel-case', transformer: camelCaseTransform },
        { name: 'pascal-case', transformer: pascalCaseTransform },
        { name: 'snake-case', transformer: snakeCaseTransform },
        { name: 'kebab-case', transformer: kebabCaseTransform },
        { name: 'prefix', transformer: prefixTransform },
        { name: 'remove-prefix', transformer: removePrefixTransform },
        { name: 'suffix', transformer: suffixTransform },
        { name: 'remove-suffix', transformer: removeSuffixTransform },
        { name: 'replace', transformer: replaceTransform }
    ],
    parameterName: [
        { name: 'camel-case', transformer: camelCaseTransform },
        { name: 'pascal-case', transformer: pascalCaseTransform },
        { name: 'snake-case', transformer: snakeCaseTransform },
        { name: 'kebab-case', transformer: kebabCaseTransform },
        { name: 'prefix', transformer: prefixTransform },
        { name: 'remove-prefix', transformer: removePrefixTransform },
        { name: 'suffix', transformer: suffixTransform },
        { name: 'remove-suffix', transformer: removeSuffixTransform },
        { name: 'replace', transformer: replaceTransform }
    ]
};

module.exports = library;
