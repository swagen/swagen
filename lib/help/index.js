'use strict';

const utils = require('../utils');
const cli = utils.cli;

function displayDefaultHelp() {
    cli.info(`Usage: swagen [<command>]`);
    cli.info();
    cli.info(`Commands:`);
    cli.info(`    generate, init, modes, definition, version, help`);
    cli.info();
    cli.info(`swagen help <command>   Get help for <command>`);
    cli.info(`swagen version          Print the CLI version`);
}

function displayCommandHelp(command) {
    let helpModule;
    try {
        helpModule = require(`../${command}/help`);
    } catch (ex) {
        cli.error(`Invalid command '${command}'.`);
        console.log();
        displayDefaultHelp();
        return;
    }

    const helpText = typeof helpModule === 'function' ? helpModule() : helpModule;
    (helpText || []).forEach(text => {
        cli.info(text);
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
