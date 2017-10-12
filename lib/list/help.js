'use strict';

const chalk = require('chalk');

module.exports = () => {
    console.log(chalk`{cyan swagen list [--details]}`);
    console.log();
    console.log(chalk`Displays the list of profiles in the current swagen.config.json file.`);
    console.log();
    console.log(chalk`  {cyan --details}  Displays details about each profile`);
};
