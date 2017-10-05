const chalk = require('chalk');

const help = require('./help');

function getPackageName(packageName) {
    if (packageName.match(/^swagen-/i)) {
        return packageName;
    }
    return `swagen-${packageName}`;
}

function displayHelp(errorMessage) {
    console.log(chalk.red(errorMessage));
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
    const packageName = getPackageName(args._[0]);
    let generatorPkg;
    try {
        generatorPkg = require(packageName);
    } catch (ex) {
        console.error(`Cannot load generator package named ${packageName}.`);
        return;
    }
    const modes = generatorPkg instanceof Array ? generatorPkg : [generatorPkg];
    for (const mode of modes) {
        console.log(`Name       : ${mode.name}`);
        console.log(`Description: ${mode.description}`);
        console.log(`Language   : ${mode.language} (ext: .${mode.extension})`);
        console.log();
    }
};
