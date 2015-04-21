var OMNIModule = require('../../OMNIModule.js');
var thisModule = new OMNIModule("central-server");

// initialize the module
thisModule.init = function(nodeConfig) {

    // define the available states for this module
    thisModule.setStatusList(['IDLE', 'SENDING']);

    // set initial state of the module
    thisModule.setState('IDLE', null);

};

module.exports = thisModule;