var util = require('util');
var events = require('events');

var OMNIModule = function(moduleName) {
    
    events.EventEmitter.call(this);
    
    // private variables

    var name = moduleName || '';

    var data = null;    

    var status = '';
    var statusList = [];

    var commandList = {};
    
    // public access methods
    
    this.setName = function(moduleName) {
        name = moduleName;
    };
    
    this.getName = function() {
        return name;
    };
    
    this.setData = function(dataValues) {
        data = dataValues;
    };
    
    this.getData = function() {
        return data;
    };
    
    this.setStatusList = function(statusListArray) {
        statusList = statusListArray;
    };

    this.getStatusList = function() {
        return statusList;
    };

    this.setStatus = function(newStatus) {
        status = newStatus;
    };
    
    this.getStatus = function() {
        return status;
    };
    
    this.setState = function(status, data) {
        this.setStatus(status);
        this.setData(data);
        this.emit('stateChange', this.getName());
    };
    
    this.getState = function() {
        return {
            status: this.getStatus(),
            data: this.getData()
        };
    };

    this.addCommand = function(comName, comMethod) {
        
        commandList[comName] = {};
        commandList[comName].parameters = [];
        commandList[comName].method = comMethod;
        
        return {
            
            addParameter: function(paramName, paramRequired, paramValues, paramDefaultValue) {

                var parameter = {
                    name: paramName || '',
                    required: paramRequired || false,
                    values: paramValues || [],
                    defaultValue: paramDefaultValue || ''
                };

                commandList[comName].parameters.push(parameter);
            }
            
        };

    };
    
    this.getCommandList = function() {
        return commandList;
    };

    this.getCommandListNoMethods = function() {
        
        var commandListNoMethods = JSON.parse(JSON.stringify(commandList));
        var commandListKeys = Object.keys(commandList);

        for (var i = 0, j = commandListKeys.length; i < j; i++) {
            delete commandListNoMethods[commandListKeys[i]].method;
        }
        
        return commandListNoMethods;
        
    };
    
    this.getCommandParameters = function(comName) {
        return commandList[comName].parameters;
    };
    
    this.init = function() {};
    
};

util.inherits(OMNIModule, events.EventEmitter);

module.exports = OMNIModule;