/*

    1. Subsystem sets up communication platform (udp + http)
    2. Device is detected, initialized, and stored in device object
    3. OMNI modules are loaded and initialized with device object

*/

var fs = require('fs');
var util = require('util');
var http = require('http');
var dgram = require('dgram');
var url = require('url');
var crypto = require('crypto');

// GLOBALS

var httpPort = 8080;
var udpAnnounceInterval = 5000;
var udpKeepAlive = (udpAnnounceInterval / 1000) * 3; // 3 announcements
var udpMulticastAddress = '230.185.192.108';
var udpPort = 41234;

var users = {};
var sessions = {};

// List of nodes (nodeList) - a hash containing a list of discovered nodes
// and their corresponding current state information

var nodeList = {};
        
// Node configuration object (nodeConfig) - an object containing node information
// such as name and required modules

var nodeConfig = {};

// Node ruleset object (nodeRuleSet) - an object containing the rules the node
// must follow, given certain stimuli

var nodeRuleSet = {};

// Node modules object (nodeModules) - an hash containing functions defined
// for each loaded node module

var nodeModules = {};

// Node device types object (nodeDeviceTypes) - an array containing 

var nodeDeviceTypes = [];

try {
    
    nodeConfig = JSON.parse(fs.readFileSync('./config.json'));
    
} catch (e) {
    
    console.error('There was an error while reading the configuration file (config.json)!');
    process.exit(1);
    
}

// Ensure the node configuration object is well-formed
if (!(nodeConfig instanceof Object)) {
	console.error('The configuration file is not well-formed.');
	console.error('The configuration object must be of type Object.');
	process.exit(1);
}

if (typeof nodeConfig.deviceName === 'undefined') {
	console.error('The configuration file is not well-formed.');
	console.error('The configuration file must contain a "deviceName" key.');
	process.exit(1);
}

else if (typeof nodeConfig.nodeModules === 'undefined') {
	console.error('The configuration file is not well-formed.');
	console.error('The configuration file must contain a "nodeModules" key.');
	process.exit(1);
}

else if (!(Array.isArray(nodeConfig.nodeModules))) {
	console.error('The configuration file is not well-formed.');
	console.error('The "nodeModules" key must be of type Array.');
	process.exit(1);
}

else if (typeof nodeConfig.deviceType === 'undefined') {
	console.error('The configuration file is not well-formed.');
	console.error('The configuration file must contain a "deviceType" key.');
	process.exit(1);
}

// default non-required configuration keys
nodeConfig.hardware = '';


// Load users file
try {
    
    users = JSON.parse(fs.readFileSync('./users.json'));
    
} catch (e) {
    
    console.error('There was an error while reading the users file (users.json)!');
    process.exit(1);
    
}

// Load and validate the ruleset file for this node
// Ruleset file defines:
// 1. The ruleset to apply when status of a node changes

try {
    
    nodeRuleSet = JSON.parse(fs.readFileSync('./ruleset.json'));
    
} catch (e) {
    
    console.error('There was an error while reading the ruleset file (ruleset.json)!');
    process.exit(1);
    
}

// Ensure the node ruleset object is well-formed
if (!(Array.isArray(nodeRuleSet))) {
    console.error('The ruleset file is not well-formed.');
    console.error('The ruleset object must be of type Array.');
    process.exit(1);
}

for (var i = 0, j = nodeRuleSet.length; i < j; i++) {

	if (typeof nodeRuleSet[i].sourceNodeName === 'undefined') {
		console.error('The ruleset file is not well-formed.');
		console.error('Each ruleset in the ruleset file must contain a "sourceNodeName" key.');
		process.exit(1);
	}
	
	else if (typeof nodeRuleSet[i].sourceNodeModule === 'undefined') {
		console.error('The ruleset file is not well-formed.');
		console.error('Each ruleset in the ruleset file must contain a "sourceNodeModule" key.');
		process.exit(1);
	}

	else if (typeof nodeRuleSet[i].sourceNodeComparableField === 'undefined') {
		console.error('The ruleset file is not well-formed.');
		console.error('Each ruleset in the ruleset file must contain a "sourceNodeComparableField" key.');
		process.exit(1);
	}

	else if (typeof nodeRuleSet[i].sourceNodeComparableOperator === 'undefined') {
		console.error('The ruleset file is not well-formed.');
		console.error('Each ruleset in the ruleset file must contain a "sourceNodeComparableOperator" key.');
		process.exit(1);
	}

	else if (typeof nodeRuleSet[i].sourceNodeComparableValue === 'undefined') {
		console.error('The ruleset file is not well-formed.');
		console.error('Each ruleset in the ruleset file must contain a "sourceNodeComparableValue" key.');
		process.exit(1);
	}

	else if (typeof nodeRuleSet[i].destNodeName === 'undefined') {
		console.error('The ruleset file is not well-formed.');
		console.error('Each ruleset in the ruleset file must contain a "destNodeName" key.');
		process.exit(1);
	}

	else if (typeof nodeRuleSet[i].destNodeModule === 'undefined') {
		console.error('The ruleset file is not well-formed.');
		console.error('Each ruleset in the ruleset file must contain a "destNodeModule" key.');
		process.exit(1);
	}

	else if (typeof nodeRuleSet[i].destNodeCommandName === 'undefined') {
		console.error('The ruleset file is not well-formed.');
		console.error('Each ruleset in the ruleset file must contain a "destNodeCommandName" key.');
		process.exit(1);
	}

	else if (typeof nodeRuleSet[i].destNodeCommandData === 'undefined') {
		console.error('The ruleset file is not well-formed.');
		console.error('Each ruleset in the ruleset file must contain a "destNodeCommandData" key.');
		process.exit(1);
	}

	else if (!(nodeRuleSet[i].destNodeCommandData instanceof Object)) {
		console.error('The ruleset file is not well-formed.');
		console.error('Each "destNodeCommandName" key in the ruleset file must be of type Object.');
		process.exit(1);
	}

	else if (typeof nodeRuleSet[i].execTriggerDelayMS === 'undefined') {
		console.error('The ruleset file is not well-formed.');
		console.error('Each ruleset in the ruleset file must contain a "execTriggerDelayMS" key.');
		process.exit(1);
	}

	else if (typeof parseInt(nodeRuleSet[i].execTriggerDelayMS, 10) !== 'number') {
		console.error('The ruleset file is not well-formed.');
		console.error('Each "execTriggerDelayMS" key in the ruleset file must be an integer.');
		process.exit(1);
	}

}

try {
    
    nodeDeviceTypes = JSON.parse(fs.readFileSync('./deviceTypes.json'));
    
} catch (e) {
    
    console.error('There was an error while reading the device types file (deviceTypes.json)!');
    process.exit(1);
    
}

// Ensure the node device types object is well-formed
if (!(Array.isArray(nodeDeviceTypes))) {
	console.error('The node device types file is not well-formed.');
	console.error('The node device types object must be of type Array.');
	process.exit(1);
}

// Define the node comparable comparison function
// Compares a nodes comparable field to its value based on a given operator
var nodeComparableCompare = function(sourceValue, comparableOperator, ruleValue) {

	var ruleValueSplit;
	
	if (comparableOperator === null || comparableOperator === 'null') return true;
	
	// less than
	else if (comparableOperator === "LT") return sourceValue < ruleValue;

	// less than or equal to
	else if (comparableOperator === "LTE") return sourceValue <= ruleValue;

	// equal to
	else if (comparableOperator === "EQ") return sourceValue == ruleValue;

	// greater than or equal to
	else if (comparableOperator === "GTE") return sourceValue >= ruleValue;

	// greater than
	else if (comparableOperator === "GT") return sourceValue > ruleValue;

	// between, inclusive of values
	else if (comparableOperator === "BETWEEN_INC") {
		
		ruleValueSplit = ruleValue.split(',');
		return sourceValue >= ruleValueSplit[0] && sourceValue <= ruleValueSplit[1];

	}
	
	// between, excluding values
	else if (comparableOperator === "BETWEEN_EXC") {
		
		ruleValueSplit = ruleValue.split(',');
		return sourceValue > ruleValueSplit[0] && sourceValue < ruleValueSplit[1];

	}
	
	else return false;
	
};


// Define the node ruleset execution function
// Executes a ruleset given information about a source node

var execRuleSet = function(sourceNodeKey, sourceNodeModuleKey) {
  
	// 1. Traverse the ruleset object, looking for matching source nodes
	// 2. For each matching source node, evaluate values based on ruleset
	// 3. If a rule matches, execute the described rule
	
	// rules are of the form:
	// <source node name>, <source node module>, <STATUS or DATA>, <comparison operator>, <source node status>,
	// <dest node name>, <dest node module>, <dest node command>, <dest node command data [array of objects, endpoint]>
	
	// example: if the doorbell is pushed, turn the camera on
	// "doorbell", "pushbutton", "STATUS", "eq", "pushed", "camera1", "camera", "TURNON", NULL
	
	// example: if the temperature is > 80 degrees, turn the air-conditioner on cold
	// "thermometer1", "temperature", "DATA", "gt", "82", "airconditioner", "cold", "TURNON", NULL
	
	// example: if the camera is on, send an email to test@test.com
	// "camera1", "camera", "STATUS", "eq", "on", NULL, "email", "SEND", "{address: test@test.com, message: The camera is on!}"
	
	// example: if the camera is on, send an sms to 1234567788
	// "camera1", "camera", "STATUS", "eq", "on", NULL, "sms", "SEND", "{number: 1234567788, message: The camera is on!}"
	
	// example: archive the current temperature readings
	// "thermometer1", "temperature", NULL, NULL, NULL, "Central Node", "archive", "ARCHIVE", "http://thermometer1/temperature/data"
	
	var sourceNode = nodeList[sourceNodeKey];
	var sourceNodeModules = sourceNode.modules;
	
	if (typeof sourceNodeModuleKey !== 'undefined') {
		sourceNodeModules = {};
		sourceNodeModules[sourceNodeModuleKey] = sourceNode.modules[sourceNodeModuleKey];
	}
	
	for (var i = 0, j = nodeRuleSet.length; i < j; i++) {
	
		// make sure the source node name of this rule is the name for this source node
		if (nodeRuleSet[i].sourceNodeName === sourceNode.name) {

			// make sure the source node module of this rule is one of the modules in this source node
			if (typeof sourceNodeModules[nodeRuleSet[i].sourceNodeModule] !== 'undefined') {

				var sourceNodeComparableField = nodeRuleSet[i].sourceNodeComparableField.toLowerCase();

				// make sure source node comparable field is valid
				if (['status', 'data', 'null', null].indexOf(sourceNodeComparableField) === -1) return;

				// compare source module field value to ruleset value based on operator
				if (nodeComparableCompare(sourceNodeModules[nodeRuleSet[i].sourceNodeModule].state[sourceNodeComparableField], nodeRuleSet[i].sourceNodeComparableOperator, nodeRuleSet[i].sourceNodeComparableValue)) {

					// ensure the status of this node module has changed since the last message recieved, or that
					// it has been at least X milliseconds since recieving the last message, as defined by the ruleset
					if (sourceNodeModules[nodeRuleSet[i].sourceNodeModule].state.status !== sourceNodeModules[nodeRuleSet[i].sourceNodeModule].lastState.status ||
						typeof nodeRuleSet[i].lastExecTime === 'undefined' ||
						Date.now() - nodeRuleSet[i].lastExecTime >= nodeRuleSet[i].execTriggerDelayMS) {

						nodeRuleSet[i].lastExecTime = Date.now();

						// get destination node ip address
						var nodeListKeys = Object.keys(nodeList);
						var destNodeIP = null;
						
						for (var k = 0, l = nodeListKeys.length; k < l; k++) {
							if (nodeList[nodeListKeys[k]].name === nodeRuleSet[i].destNodeName) {
								destNodeIP = nodeListKeys[k];
								break;
							}
						}
						
						// execute rule by performing an http post to specified destination node
						if (destNodeIP !== null) {
	
							var postData = JSON.stringify({
								commandName: nodeRuleSet[i].destNodeCommandName,
								commandData: nodeRuleSet[i].destNodeCommandData
							});
	
							var postOptions = {
								host: destNodeIP,
		      					port: httpPort,
		      					path: '/' + nodeRuleSet[i].destNodeModule + '/command',
								method: 'POST',
								headers: {
							          'Content-Type': 'application/json',
							          'Content-Length': postData.length
							      }
							};
							
							console.log('\nRule is being processed:');
							console.log(util.inspect(nodeRuleSet[i], {showHidden: false, depth: null, colors: true}));
	
							http.request(postOptions, function(res) {
								
								var data = '';
								
								res.on('data', function(value) {
									data += value;
								});
								
								res.on('end', function() {
									console.log(data);	
								});
								
							}).end(postData);
	
						}

					}

				}

			}
			
		}

	}
	
};

// Start UDP server
// UDP server:
// 1. Sends out node announcements for this node
// 2. Listens on a common broadcast address for node announcements
// and updates nodeList with current info

var udpServer = dgram.createSocket('udp4');

// Define main UDP announcement function
// if a module name is passed in, only announce
// the status of that module
var udpAnnounce = function(moduleName) {

    var udpAnnounceMessage = {
		messageType: 'announce',
    	messageData: {
    	    name: nodeConfig.deviceName,
    	    modules: {}
    	}
    };

    // gather the names of all modules to include in announcement
    var nodeModuleNames = Object.keys(nodeModules);
    
    // if a module name has been given, this indicates we only
    // want to send the state of that module, and not a full
    // announcement that would otherwise tell the other nodes
    // that this module is the only one this node has available

    if (typeof moduleName !== 'undefined') {
    	nodeModuleNames = [moduleName];
    	udpAnnounceMessage.messageType = 'state';
    }
    
    // for each module, add its status and data to the announcement
    for (var i = 0, j = nodeModuleNames.length; i < j; i++) {
    	
        udpAnnounceMessage.messageData.modules[nodeModuleNames[i]] = {
            state: nodeModules[nodeModuleNames[i]].getState()
        };

    }
    
    var udpMessage = new Buffer(JSON.stringify(udpAnnounceMessage));

	// send node announcement
	udpServer.send(udpMessage, 0, udpMessage.length, udpPort, udpMulticastAddress);

};

// handle udp listening event
udpServer.on('listening', function () {

  var address = udpServer.address();
  console.log('Node listening for messages on UDP port ' + address.port);

});

// handle incoming UDP multicast messages
udpServer.on('message', function(msg, rinfo) {
	
	var message;
	var prevMessageData = JSON.parse(JSON.stringify(nodeList[rinfo.address] || {}));

	try {

		message = JSON.parse(msg);

	} catch(e) {
		
	    console.error('There was an error while reading an incoming UDP message.');
	    console.error('The message was not in JSON format.');
		return;

	}

	console.log('\nNode received a UDP message from ' + rinfo.address + ':' + rinfo.port);
	console.log(util.inspect(message, {showHidden: false, depth: null, colors: true}));
	
	var messageModuleList = message.messageData.modules;
	var messageModuleListKeys = Object.keys(messageModuleList);

	// add/replace the node to the list of available nodes is new
	// or if an announcement has been received
	if (typeof nodeList[rinfo.address] === 'undefined' || message.messageType === 'announce') {
		nodeList[rinfo.address] = message.messageData;
	}
	
	// otherwise, add message info to current node in nodeList
	// since this is a state message, it is only for one module
	else if (message.messageType === 'state') {
		nodeList[rinfo.address].modules[messageModuleListKeys[0]] = messageModuleList[messageModuleListKeys[0]];
	}

	// if the message type is an announcement or a state change,
	// update the nodes current/last state and current/last announcement times
	if (message.messageType === 'announce' || message.messageType === 'state') {
		
		// for every module for this node, update last status and current/last announcement times
		for (var i = 0, j = messageModuleListKeys.length; i < j; i++) {
			
			// if the message type is a state update, make sure to capture the new state
			if (message.messageType === 'state' && typeof message.messageData.modules !== 'undefined' && typeof message.messageData.modules[messageModuleListKeys[i]] !== 'undefined') {
				nodeList[rinfo.address].modules[messageModuleListKeys[i]].state = message.messageData.modules[messageModuleListKeys[i]].state;
			}

			nodeList[rinfo.address].modules[messageModuleListKeys[i]].announcementTime = Date.now();
			nodeList[rinfo.address].modules[messageModuleListKeys[i]].lastState = {status: null, data: null};
			nodeList[rinfo.address].modules[messageModuleListKeys[i]].lastAnnouncementTime = 0;

			if (typeof prevMessageData.modules !== 'undefined' && typeof prevMessageData.modules[messageModuleListKeys[i]] !== 'undefined') {
				nodeList[rinfo.address].modules[messageModuleListKeys[i]].lastState = prevMessageData.modules[messageModuleListKeys[i]].state;
				nodeList[rinfo.address].modules[messageModuleListKeys[i]].lastAnnouncementTime = prevMessageData.modules[messageModuleListKeys[i]].announcementTime;
			}

		}

	}

	// reset the nodes keep-alive time since we know it's alive
	nodeList[rinfo.address].keepAlive = udpKeepAlive;

	// once the message has been received, process any rules that may
	// be defined according to the information from the sender node
	// - state announcements are for one module only - we don't want
	// to process rules for every module just because one changed
	if (message.messageType === 'state') {
		execRuleSet(rinfo.address, messageModuleListKeys[0]);
	} else {
		execRuleSet(rinfo.address);
	}
	
});

// start listening for UDP messages, ignoring any local messages
udpServer.bind(udpPort, function() {
    
	udpServer.addMembership(udpMulticastAddress);
	udpServer.setMulticastLoopback(true);

    // send node announcements on interval timer
    setInterval(function() {
        
		udpAnnounce();
    
    }, udpAnnounceInterval);
    
    // decay nodes every second to detect if they have gone off-network
    setInterval(function() {
    
    	var nodeAddresses = Object.keys(nodeList);
    	var thatNode;
    
    	for (var i = 0; i < nodeAddresses.length; i++) {
    
    		thatNode = nodeList[nodeAddresses[i]];
    		thatNode.keepAlive--;
    
    		// if the node has not announced itself within the keepalive time
    		// assume that is has disconnected from the network and remove it
    		// from the list of available nodes
    		if (thatNode.keepAlive === 0) {
    			console.log('\n\nNode ' + nodeAddresses[i] + ' has died!\n');
    			delete nodeList[nodeAddresses[i]];
    		}
    	}
    
    }, 1000);
    
    // show nodes that are currently active every 5 seconds
    setInterval(function() {
    
    	console.log('\nNodes currently active:\n');
    	console.log(util.inspect(nodeList, {showHidden: false, depth: null, colors: true}));
    
    }, 5000);
	
});

// 6. Start HTTP server
// HTTP server:
// 1. Listens for HTTP connections
// 2a. Reacts to <node>/config, <node>/behavior, <node>/deviceTypes
// 2b. Reacts to <node>/<module>/state, <node>/<module>/monitor, and <node>/<module>/command requests
// by calling the appropriate module functions

// start http server to serve endpoints
var httpServer = http.createServer(function (req, res) {

	var parsedURL = url.parse(req.url);
	var postData = '';
	var jsonPostData = '';
	
	// break url into module name and endpoint
	var pathSplit = parsedURL.pathname.split('/');
	var domain = req.headers.host || null;
	var moduleName = pathSplit[1] || null;
	var endPointIndex, endPoint = null;

	if (moduleName !== null) {
		endPointIndex = parsedURL.pathname.indexOf(moduleName) + moduleName.length + 1;
		endPoint = parsedURL.pathname.substring(endPointIndex);
	}
	
	// if no module name was specified, this is for the node only
	if (endPoint === null || endPoint === '') {

		if (moduleName === null) {
			
			res.writeHead(301, {
	  			'Location': '/ui/loginNew.html'
			});
			return res.end();
			
		}

		endPoint = moduleName;
		moduleName = null;

	}

	if (moduleName === 'ui') {
		
		if (req.method === 'GET') {
		
			fs.readFile('./' + moduleName + '/' + endPoint, function(err, data) {
	
				if (err) {
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('Invalid request. Page not found.');
					return res.end();
				}
				
				// replace localhost reference with actual domain
				data = data.toString().replace(/localhost/g, domain);

				var contentType = 'text/html';
				var extIndex = endPoint.lastIndexOf('.');
				
				if (endPoint.substring(extIndex) === '.js') contentType = 'text/javascript';
				if (endPoint.substring(extIndex) === '.css') contentType = 'text/css';
				
				res.writeHead(200, {'Content-Type': contentType});
				res.write(data);
	        	return res.end();
	
			});
			
		}

		else return res.end();

	}
	
	else if (endPoint === 'register') {

		if (req.method === 'POST') {

			postData = '';

			// collect all posted data
			req.on('data', function(data) {

				postData += data;

				// ensure post data is not too big
				// otherwise, end the request abruptly
				if (postData.length > 1e6) {
					res.writeHead(413, {'Content-Type': 'text/plain'});
					res.end();
					req.connection.destroy();
				}

			});
			
			req.on('end', function() {
				
				var jsonPostData;

				try {

					jsonPostData = JSON.parse(postData);

				} catch(e) {

					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('Invalid POST - request not in JSON format!');
					return res.end();

				}
				
				var username = jsonPostData.username;
				var password = jsonPostData.password;
				
				// make sure username and password are valid
				if (username === '' || password === '') {
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('User or password invalid!');
					return res.end();
				}

				// make sure user doesn't already exist
				if (typeof users[username] !== 'undefined') {
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('User already exists!');
					return res.end();
				}
				
				// update users file
				users[username] = crypto.createHash('md5').update(password).digest('hex');
				fs.writeFile('./users.json', JSON.stringify(users), function(err) {

					// set session
					sessions[username] = 1;
					
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('success');
					return res.end();

				});

			});

		}

		else return res.end();

	}
	
	else if (endPoint === 'login') {

		if (req.method === 'POST') {

			postData = '';

			// collect all posted data
			req.on('data', function(data) {

				postData += data;

				// ensure post data is not too big
				// otherwise, end the request abruptly
				if (postData.length > 1e6) {
					res.writeHead(413, {'Content-Type': 'text/plain'});
					res.end();
					req.connection.destroy();
				}

			});
			
			req.on('end', function() {
				
				var jsonPostData;

				try {

					jsonPostData = JSON.parse(postData);

				} catch(e) {

					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('Invalid POST - request not in JSON format!');
					return res.end();

				}

				var username = jsonPostData.username;
				var password = jsonPostData.password;

				// make sure username and password are valid
				if (username === '' || password === '') {
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('User or password invalid!');
					return res.end();
				}

				// check user credentials
				if (typeof users[username] === 'undefined' || users[username] !== crypto.createHash('md5').update(password).digest('hex')) {
					
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('Invalid credentials');
					return res.end();

				}
				
				// set session
				sessions[username] = 1;
				
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.write('success');
				return res.end();

			});

		}

		else return res.end();

	}
	
	else if (endPoint === 'config') {
		
		if (req.method === 'GET') {

			res.writeHead(200, {'Content-Type': 'text/json'});
			res.write(JSON.stringify(nodeConfig));
        	return res.end();

		}
		
		else if (req.method === 'POST') {

			postData = '';

			// collect all posted data
			req.on('data', function(data) {

				postData += data;

				// ensure post data is not too big
				// otherwise, end the request abruptly
				if (postData.length > 1e6) {
					res.writeHead(413, {'Content-Type': 'text/plain'});
					res.end();
					req.connection.destroy();
				}

			});
			
			req.on('end', function() {
				
				var jsonPostData;

				try {

					jsonPostData = JSON.parse(postData);

				} catch(e) {

					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('Invalid POST - request not in JSON format!');
					return res.end();

				}

				// save node configuration to file
				fs.writeFile('./config.json', JSON.stringify(jsonPostData), function(err) {
					
					if (err) {
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write('error');
						res.write('Unable to save configuration file to disk!');
						return res.end();
					}
					
					// replace current node configuration
					nodeConfig = jsonPostData;
					loadNodeModules();

					// need to fix - and unload previous modules

					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('success');
					return res.end();

				});
				
			});

		}

		else return res.end();

	}
	
	else if (endPoint === 'behavior') {

		if (req.method === 'GET') {

			res.writeHead(200, {'Content-Type': 'text/json'});
			res.write(JSON.stringify(nodeRuleSet));
        	return res.end();

		}
		
		else if (req.method === 'POST') {

			postData = '';

			// collect all posted data
			req.on('data', function(data) {

				postData += data;

				// ensure post data is not too big
				// otherwise, end the request abruptly
				if (postData.length > 1e6) {
					res.writeHead(413, {'Content-Type': 'text/plain'});
					res.end();
					req.connection.destroy();
				}

			});
			
			req.on('end', function() {
				
				jsonPostData = '';

				try {

					jsonPostData = JSON.parse(postData);

				} catch(e) {

					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('Invalid POST - request not in JSON format!');
					return res.end();

				}

				// save node behavior to file
				fs.writeFile('./ruleset.json', JSON.stringify(jsonPostData), function(err) {
					
					if (err) {
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write('error');
						res.write('Unable to save behavior file to disk!');
						return res.end();
					}
					
					// replace current node behavior
					nodeRuleSet = jsonPostData;

					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('success');
					res.write('Behavior file saved to disk');
					return res.end();

				});
				
			});

		}

		else return res.end();

	}
	
	else if (endPoint === 'deviceTypes') {

		if (req.method === 'GET') {

			res.writeHead(200, {'Content-Type': 'text/json'});
			res.write(JSON.stringify(nodeDeviceTypes));
			return res.end();

		}

       else return res.end();

	}

	else if (endPoint === 'deviceList') {

		if (req.method === 'GET') {

			res.writeHead(200, {'Content-Type': 'text/json'});
			res.write(JSON.stringify(nodeList));
			return res.end();

		}

       	else return res.end();

	}

	else if (endPoint === 'availableModules') {

		if (req.method === 'GET') {
			
			fs.readdir('./lib/omni_modules/', function(err, files) {

				if (err) {
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('Unable to load list of modules!');
					return res.end();
				}

				res.writeHead(200, {'Content-Type': 'text/json'});
				res.write(JSON.stringify(files));
				return res.end();

			});

		}

       	else return res.end();

	}

    else if (moduleName !== null && endPoint === 'state') {

		// ensure module name is valid
		if (moduleName !== null && typeof nodeModules[moduleName] === 'undefined') {
		    return res.end();
		}

		// return status if requested
		if (req.method === 'GET') {
		    
		    // send the status to the client
			res.writeHead(200, {'Content-Type': 'text/json'});
			res.write(JSON.stringify(nodeModules[moduleName].getState() || null));
			return res.end();

		}

        else return res.end();

    }
    
    else if (moduleName !== null && endPoint === 'statusList') {

		// ensure module name is valid
		if (moduleName !== null && typeof nodeModules[moduleName] === 'undefined') {
		    return res.end();
		}

		// return status if requested
		if (req.method === 'GET') {
		    
		    // send the status to the client
			res.writeHead(200, {'Content-Type': 'text/json'});
			res.write(JSON.stringify(nodeModules[moduleName].getStatusList() || null));
			return res.end();

		}

        else return res.end();

    }

    else if (moduleName !== null && endPoint === 'monitor') {
        
		// ensure module name is valid
		if (moduleName !== null && typeof nodeModules[moduleName] === 'undefined') {
		    return res.end();
		}

		// return data if requested
		if (req.method === 'GET') {
			
			// get monitor file
			fs.readFile('./lib/omni_modules/' + moduleName + '/monitor.html', function(err, data) {

				if (err) {
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('No monitor file for specified node module.');
					return res.end();
				}
				
				// replace 'localhost' in monitor file with ip of node
				data = data.toString().replace(/localhost/g, domain);

				// send the data to the client
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(data);
	        	return res.end();

			});

		}
		
        else return res.end();

    }
    
    else if (moduleName !== null && endPoint === 'command') {
        
		// ensure module name is valid
		if (moduleName !== null && typeof nodeModules[moduleName] === 'undefined') {
		    return res.end();
		}

		// return command list if requested
		if (req.method === 'GET') {
		    
		    // clone command list so we can manipulate it
		    var commandList = JSON.parse(JSON.stringify(nodeModules[moduleName].getCommandListNoMethods()));

			// send the command list to the client
			res.writeHead(200, {'Content-Type': 'text/json'});
			res.write(JSON.stringify(commandList));
        	return res.end();

		}
		
		else if (req.method === 'POST') {

			postData = '';

			// collect all posted data
			req.on('data', function(data) {

				postData += data;

				// ensure post data is not too big
				// otherwise, end the request abruptly
				if (postData.length > 1e6) {
					res.writeHead(413, {'Content-Type': 'text/plain'});
					res.end();
					req.connection.destroy();
				}

			});

			// once all post data is collected, parse it
			req.on('end', function() {
				
				jsonPostData = '';

				try {

					jsonPostData = JSON.parse(postData);

				} catch(e) {

					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('Invalid POST - request not in JSON format!');
					return res.end();

				}

				var commandName = jsonPostData.commandName || '';
				var commandData = jsonPostData.commandData || {};

				// check that requested command is valid
				if (Object.keys(nodeModules[moduleName].getCommandList()).indexOf(commandName) === -1) {

					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('Invalid POST - command given is invalid!');
					return res.end();

				}

				// ensure command data is a valid type
				if (!(commandData instanceof Object)) {

					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('Invalid POST - command data not in JSON format!');
					return res.end();

				}

				// check that the requested command method has been defined
				if (typeof nodeModules[moduleName].getCommandList()[commandName].method === 'undefined') {
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('error');
					res.write('Invalid command - this command has not been implemented!');
					return res.end();
				}
				
				// check that all required parameters are given and
				// assign default values to missing command parameters, based on command list parameters
				var commandParameters = nodeModules[moduleName].getCommandParameters(commandName);

				for (var i = 0, j = commandParameters.length; i < j; i++) {
					
					if (typeof commandData[commandParameters[i].name] === 'undefined') {
						
						if (commandParameters[i].required) {
							res.writeHead(200, {'Content-Type': 'text/plain'});
							res.write('error');
							res.write('Invalid command - some required parameters are missing!');
							res.write(util.inspect(commandParameters[i], {showHidden: false, depth: null, colors: true}));
							return res.end();
						}
						
						commandData[commandParameters[i].name] = commandParameters[i].defaultValue || '';
						
					}

				}

				// perform command as given
				nodeModules[moduleName].getCommandList()[commandName].method(req, res, commandData);

				return res.end();

			});

		}

		else return res.end();

    }
    
    else {
        
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write('error');
		res.write('Invalid request');
        return res.end();
        
    }

});

httpServer.listen(httpPort, function() {
	console.log('Node listening for requests on HTTP port ' + httpPort);
});


var loadNodeModules = function() {

	// load all modules found in config file
	for (var i = 0, j = nodeConfig.nodeModules.length; i < j; i++) {
	    
	    var moduleDirName = nodeConfig.nodeModules[i];
	    var modulePath = 'lib/omni_modules/' + moduleDirName;
	    
	    if (fs.existsSync(modulePath) && fs.statSync(modulePath).isDirectory()) {
	
	        var thisModule = require('./' + modulePath);
	        var moduleName = thisModule.getName();
	        
	        nodeModules[moduleName] = thisModule;
	        
	        nodeModules[moduleName].on('stateChange', function(thisModuleName) {
	        	return udpAnnounce(thisModuleName);
	        });
	
	        nodeModules[moduleName].init(nodeConfig);
	
	        console.log('Module loaded: "' + moduleDirName + '"');
	
	    } else {
	    
	        console.error('Could not load module "' + moduleDirName + '"');
	
	    }
	    
	}
	
};

loadNodeModules();