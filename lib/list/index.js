'use strict';

const utils = require('../../utils');

module.exports = function() {
    const config = utils.loadConfig();
    for (const profileKey in config) {
        console.log(profileKey);
    }
};
