'use strict';

const utils = require('../../utils');

module.exports = function(args) {
    let config = utils.loadConfig();
    for (let profileKey in config) {
        console.log(profileKey);
    }
};
