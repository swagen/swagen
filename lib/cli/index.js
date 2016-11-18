'use strict';

const chalk = require('chalk');

function debug(message) {
    console.log(chalk.blue(`[debug] ${message}`));
}

module.exports = {
    debug: debug
};
