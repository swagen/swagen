'use strict';

const chalk = require('chalk');

const utils = require('../utils');

module.exports = function(args) {
    if (!args || args._.length === 0) {
        throw new Error(`Specify a profile name to remove`);
    }

    const profileName = args._[0];
    const config = utils.loadConfig(true);
    if (!config[profileName]) {
        throw new Error(`Cannot find a profile name '${profileName}' in the current configuration.`);
    }

    delete config[profileName];

    utils.saveConfig(config);

    console.log(chalk`Removed profile '{cyan ${profileName}}'.`);
};
