'use strict';

const chalk = require('chalk');

module.exports = () => {
    console.log(chalk`{cyan swagen rename <current profile> <new profile name>}`);
    console.log();
    console.log(`Renames an existing profile.`);
    console.log();
    console.log(chalk`  {cyan <current profile>}    Name of the profile to rename`);
    console.log(chalk`  {cyan <new profile name>}   New name for the profile`);
    console.log();
    console.log(chalk`To view a list of existing profiles, use the {cyan list} command.`);
};
