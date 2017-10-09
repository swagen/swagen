'use strict';

const chalk = require('chalk');

module.exports = () => {
    console.log(chalk`{cyan swagen definition [--file <swagger file>] [--url <swagger url>] <definition file>}`);
    console.log();
    console.log(`Generates a definition file from the specified Swagger file or URL.`);
    console.log();
    console.log(chalk`  {cyan --file}   File that contains the Swagger JSON`);
    console.log(chalk`  {cyan --url}    URL to the Swagger JSON`);
    console.log();
    console.log(chalk`  {cyan <definition file>}   File to write the definition to.`);
};
