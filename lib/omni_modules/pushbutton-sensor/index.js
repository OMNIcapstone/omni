var OMNIModule = require('../../OMNIModule.js');
var thisModule = new OMNIModule("pushbutton-sensor");

// initialize the module
thisModule.init = function(nodeConfig) {
    
    // make sure sensor protocol is valid - otherwise, this module cannot be used
    if (nodeConfig.deviceType !== 'Arduino Yun') return;

    var firmata = require('firmata');

    // define the available states for this module
    thisModule.setStatusList(['UP', 'DOWN']);

    // set initial state of the module
    thisModule.setState('UP', 0);

    // get an instance of the board and setup read loop    
    var board = new firmata.Board('/dev/ttyATH0', function(err) {
            
        if (err) {
            
            console.error('There was an error connecting to the sensor board.');
            return;
            
        }
        else {
            
            var sensorPin = 3;
            board.pinMode(sensorPin, board.MODES.input);
    
            board.digitalRead(sensorPin, function(data) {
                
                var state = '';
                
                if (data === 0) state = 'UP';
                else state = 'DOWN';
                
                thisModule.setState(state, data);
                
            });
            
        }
        
    });

};

module.exports = thisModule;