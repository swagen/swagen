'use strict';

const chalk = require('chalk');

const utils = require('../utils');

module.exports = args => {
    if (!args || args._.length !== 2) {
        throw new Error(`Specify a profile name to rename and the new name.`);
    }

    const oldName = args._[0];
    const newName = args._[1];

    const config = utils.loadConfig(true);
    if (!config[oldName]) {
        throw new Error(`Cannot find a profile name '${oldName}' in the current configuration.`);
    }
    if (config[newName]) {
        throw new Error(`A profile name '${newName}' already exists. Cannot override it.`);
    }

    config[newName] = config[oldName];
    delete config[oldName];

    utils.saveConfig(config);

    console.log(chalk`Renamed profile '{cyan ${oldName}}' to '{cyan ${newName}}'.`);
};
