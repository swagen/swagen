function getPackageName(packageName) {
    if (packageName.match(/^swagen-/i)) {
        return packageName;
    }
    return `swagen-${packageName}`;
}

module.exports = function(args) {
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
