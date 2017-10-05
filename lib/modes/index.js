'use strict';

function getPackageName(packageName) {
    if (packageName.match(/^swagen-/i)) {
        return packageName;
    }
    return `swagen-${packageName}`;
}

module.exports = function(args) {
    // Process arguments
    if (args._.length === 0) {
        throw new Error(`Specify a package name.`);
    }
    const packageName = getPackageName(args._[0]);

    // Load generator and modes
    let generator;
    try {
        generator = require(packageName);
    } catch (ex) {
        throw new Error(`Cannot load generator package named ${packageName}.`);
    }
    const modes = generator instanceof Array ? generator : [generator];

    // Iterate over modes and display the details
    for (const mode of modes) {
        console.log(`Name       : ${mode.name}`);
        console.log(`Description: ${mode.description}`);
        console.log(`Language   : ${mode.language} (ext: .${mode.extension})`);
        console.log();
    }
};
