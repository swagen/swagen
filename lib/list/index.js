'use strict';

const chalk = require('chalk');

const utils = require('../utils');

module.exports = function() {
    const config = utils.loadConfig();
    let count = 0;
    for (const profileKey in config) {
        const profile = config.profileKey;
        count++;
        if (count > 0) {
            console.log();
        }
        console.log(chalk.cyan(profileKey));
        console.log(chalk`    {dim Generator:} ${profile.generator}}`);
        console.log(chalk`    {dim Mode:}      ${profile.mode}}`);
        console.log(chalk`    {dim Source:}    ${profile.url || profile.file}}`);
        console.log(chalk`    {dim Output:}    ${profile.output}`);
    }
};
