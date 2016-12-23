'use strict';

const fs = require('fs');
const path = require('path');
const process = require('process');

module.exports = function(args) {
    let packageJsonPath = path.resolve(__dirname, '../../package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.error(`Something went wrong; couldn't get the version.`);
        console.error(`If the problem persists, try reinstalling swagen.`);
        return;
    }
    let packageJson = require(packageJsonPath);
    console.log(packageJson.version);
};
