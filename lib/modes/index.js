const swagenCore = require('swagen-core');
const cli = swagenCore.cli;

const help = require('./help');

function getPackageName(packageName) {
    if (packageName.match(/^swagen-/i)) {
        return packageName;
    }
    return `swagen-${packageName}`;
}

function displayHelp(errorMessage) {
    cli.error(errorMessage);
    console.log();
    for (let i = 0; i < help.length; i++) {
        console.log(help[i]);
    }
}

module.exports = function(args) {
    if (args._.length === 0) {
        displayHelp('Specify a package name.');
        return;
    }
    let packageName = getPackageName(args._[0]);
    let generatorPkg;
    try {
        generatorPkg = require(packageName);
    } catch (ex) {
        console.error(`Cannot load generator package named ${packageName}.`);
        return;
    }
    for (let i = 0; i < generatorPkg.modes.length; i++) {
        let mode = generatorPkg.modes[i];
        console.log(`Name       : ${mode.name}`);
        console.log(`Description: ${mode.description}`);
        console.log(`Language   : ${mode.language}`);
        console.log();
    }
}
