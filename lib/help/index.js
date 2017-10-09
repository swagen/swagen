'use strict';

const chalk = require('chalk');

function displayDefaultHelp() {
    console.log(chalk`{cyan Usage: }{white.bold swagen [<command>] [<args>...]}`);
    console.log();
    console.log(`Generator commands:`);
    console.log(chalk`    {cyan generate}    Generates code`);
    console.log(chalk`    {cyan modes}       Lists modes in generator`);
    console.log(chalk`    {cyan definition}  Generates definition JSON from Swagger`);
    console.log();
    console.log(`Configuration management commands:`);
    console.log(chalk`    {cyan init}        Creates or appends profile to configuration`);
    console.log(chalk`    {cyan list}        Lists profiles in configuration`);
    console.log(chalk`    {cyan rename}      Renames profile in configuration`);
    console.log(chalk`    {cyan remove}      Removes profile from configuration`);
    console.log();
    console.log(chalk`{cyan swagen help <command>}   Get detailed help for <command>`);
    console.log(chalk`{cyan swagen version}          Print the CLI version`);
    console.log();
    console.log(chalk`Visit {blue.underline https://github.com/swagen/swagen/wiki/Command-line-reference} for help.`);
}

function displayCommandHelp(command) {
    let helpModule;
    try {
        helpModule = require(`../${command}/help`);
    } catch (ex) {
        console.log(chalk`{red Invalid command '${command}'.}`);
        console.log();
        displayDefaultHelp();
        return;
    }

    const helpText = typeof helpModule === 'function' ? helpModule() : helpModule;
    (helpText || []).forEach(text => {
        console.log(chalk.cyan(text));
    });
}

module.exports = function(args) {
    console.log();

    if (!args || args._.length === 0 || args._[0].match(/^generate$/)) {
        displayDefaultHelp();
    } else {
        displayCommandHelp(args._[0]);
    }

    console.log();
};
