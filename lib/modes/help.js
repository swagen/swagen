'use strict';

const chalk = require('chalk');

module.exports = () => {
    console.log(chalk`{cyan swagen modes <generator>}`);
    console.log();
    console.log(chalk`Lists the modes supported by specified generator.`);
    console.log();
    console.log(chalk`  {cyan <generator>}   Name of the generator.`);
    console.log(chalk`                {dim Note: The specified generator must be installed.}`);
};
