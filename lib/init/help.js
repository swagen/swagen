'use strict';

const chalk = require('chalk');

module.exports = () => {
    console.log(chalk`{cyan swagen init [--generator <generator>] [--mode <mode>] [--console]}`);
    console.log();
    console.log(chalk`Generates a swagen.config.json file in the current directory.`);
    console.log(chalk`User is asked a series of questions to set the initial values.`);
    console.log();
    console.log(chalk`  {cyan --generator}  Name of generator to use`);
    console.log(chalk`  {cyan --mode}       Name of generator mode to use`);
    console.log(chalk`  {cyan --console}    Outputs the configuration to the console instead of the swagen.config.json file`);
};
