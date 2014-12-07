var OMNIModule = require('../../OMNIModule.js');
var thisModule = new OMNIModule("dummy-sensor");

// initialize the module
thisModule.init = function(nodeConfig) {
    
    // define the available states for this module
    thisModule.setStatusList(['OPEN', 'CLOSED']);

    // set initial state of the module
    thisModule.setState('OPEN', 0);

    var thisStatusIndex = 0;

    // change status every half second
    setInterval(function() {
        
        thisStatusIndex += 1;
        if (thisStatusIndex === 2) thisStatusIndex = 0;
        
        thisModule.setState(thisModule.getStatusList()[thisStatusIndex], null);
        
    }, 10000);

};

module.exports = thisModule;