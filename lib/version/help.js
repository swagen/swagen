'use strict';

const chalk = require('chalk');

module.exports = () => {
    console.log(chalk`{swagen version}`);
    console.log();
    console.log(`Display the version of the installed swagen CLI tool.`);
};
