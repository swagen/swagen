'use strict';

const chalk = require('chalk');

const utils = require('../utils');

module.exports = function(args) {
    if (!args || args._.length === 0) {
        throw new Error(`Specify one or more  profile names to remove`);
    }

    const config = utils.loadConfig(true);

    const profileNames = args._;
    profileNames.forEach(profileName => {
        if (!config[profileName]) {
            console.log(chalk`{red Cannot find a profile named {bold ${profileName}} in the current configuration.}`);
        }
        delete config[profileName];
        console.log(chalk`Removed profile '{cyan ${profileName}}'.`);
    });

    utils.saveConfig(config);
};
