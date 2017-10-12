'use strict';

const chalk = require('chalk');

module.exports = () => {
    console.log(chalk`{cyan swagen remove <profile> [<profile> ...]}`);
    console.log();
    console.log(`Removes one or more profiles from the current swagen.config.json file.`);
    console.log();
    console.log(chalk`  {cyan <profile>}   Name of the profile to remove`);
    console.log();
    console.log(chalk`To view a list of existing profiles, use the {cyan list} command.`);
};
