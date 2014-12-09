var OMNIModule = require('../../OMNIModule.js');
var thisModule = new OMNIModule("camera");
var process = require('child_process');
var thisDir = __dirname;

// initialize the module
thisModule.init = function(nodeConfig) {
    
    // define the available states for this module
    thisModule.setStatusList(['OFF', 'ON']);

    // set initial state of the module
    thisModule.setState('OFF', null);
    
    var turnOnCommand = thisModule.addCommand('TURNON', function(req, res, data) {
        
        var cameraHost = req.headers.host || '';
        var cameraPort = 8081;
        
        // remove old port number from camera host if present
        var cameraHostPortIndex = cameraHost.indexOf(':');
        if (cameraHostPortIndex !== -1) {
            cameraHost = cameraHost.substring(0, cameraHostPortIndex);
        }
        
        var cameraURL = cameraHost + ':' + cameraPort;

        // run camera on script here
        process.execFile(thisDir + '/startmotion.sh');
	thisModule.setState('ON', cameraURL);
        
        if (data.duration > -1) {
            setTimeout(function() {

                // run camera off script here
                process.execFile(thisDir + '/stopmotion.sh');
		thisModule.setState('OFF', null);
                
            }, data.duration);
        }
        
    });
    
    turnOnCommand.addParameter('duration', false, null, -1);

    var turnOffCommand = thisModule.addCommand('TURNOFF', function(req, res, data) {

        // run camera off script here
        process.execFile(thisDir + '/stopmotion.sh');
        thisModule.setState('OFF', null);
        
    });
    
};

module.exports = thisModule;
