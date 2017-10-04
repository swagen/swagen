'use strict';

function displayDefaultHelp() {
    console.log(`Usage: swagen [<command>]`);
    console.log();
    console.log(`Commands:`);
    console.log(`    generate, init, help, modes, definition, version`);
    console.log();
    console.log(`swagen help <command>   Get help for <command>`);
    console.log(`swagen version          Print the CLI version`);
}

function displayCommandHelp(command) {
    let helpModule;
    try {
        helpModule = require(`../${command}/help`);
    } catch (ex) {
        console.error(`Invalid command '${command}'.`);
        console.log();
        displayDefaultHelp();
        return;
    }

    const helpText = typeof helpModule === 'function' ? helpModule() : helpModule;
    for (let i = 0; i < (helpText || []).length; i++) {
        console.log(helpText[i]);
    }
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
