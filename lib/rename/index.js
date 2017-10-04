'use strict';

const utils = require('../utils');

module.exports = function(args) {
    if (!args || args._.length !== 2) {
        throw new Error(`Specify a profile name to rename and the new name.`);
    }

    const profileName = args._[0];
    const newName = args._[1];

    const config = utils.loadConfig(true);
    if (!config[profileName]) {
        throw new Error(`Cannot find a profile name '${profileName}' in the current configuration.`);
    }
    if (config[newName]) {
        throw new Error(`A profile name '${newName}' already exists. Cannot override it.`);
    }

    config[newName] = config[profileName];
    delete config[profileName];

    utils.saveConfig(config);

    utils.cli.info(`Renamed profile '${profileName}' to '${newName}'.`);
};
