var config = {};
var behaviors = [];
var deviceList = {}
var availableModules = [];
var statusList = [];
var commandList = {};

$(document).ready(function(){
	
	getConfiguration();
	prepareAddBehavior();

});

var getConfiguration = function() {
	
	$.get('//localhost/config', function(data) {

        $('.deviceNameLarge').html(data.deviceName);
		
		config = data;
		getBehavior();

		$('#destNodeModule').empty();
		$('#destNodeModule').append('<option selected disabled>Choose Module</option>');
		
		for (var i = 0; i < config.nodeModules.length; i++) {
	
			var module = $('<option></option>');
			module.val(config.nodeModules[i]);
			module.html(config.nodeModules[i]);
			
			$('#destNodeModule').append(module);
		}

	});
	
};

var getBehavior = function() {

	$.get('//localhost/behavior', function(data) {
		
		behaviors = data;
		$('.behavior').not('#behaviorClone').remove();

		for (var i = 0; i < behaviors.length; i++) {
			
			behaviors[i].id = i;

	        	var behaviorHTML = 'IF: ' + behaviors[i].sourceNodeName + ' module "' + behaviors[i].sourceNodeModule + '" ( ' + behaviors[i].sourceNodeComparableField + ' ) ';
	        	behaviorHTML += behaviors[i].sourceNodeComparableOperator + ' "' + behaviors[i].sourceNodeComparableValue + '" ';
	        	behaviorHTML += '</br><br/>THEN: ' + behaviors[i].destNodeName + ' module "' + behaviors[i].destNodeModule + '" ( ' + behaviors[i].destNodeCommandName + ' ) ';
	        	behaviorHTML += '<br/><br/>WITH PARAMETERS: ';

			var commandDataKeys = Object.keys(behaviors[i].destNodeCommandData);
			
			for (var j = 0; j < commandDataKeys.length; j++) {
				behaviorHTML += commandDataKeys[j] + ' = ' + behaviors[i].destNodeCommandData[commandDataKeys[j]];
				if (j !== commandDataKeys.length - 1) behaviorHTML += ', ';
			}
			
			behaviorHTML += '<br/><br/>REPEAT EVERY: ' + behaviors[i].execTriggerDelayMS + ' ms';

			var behavior = $('#behaviorClone').clone();
			behavior.attr('id', 'behavior' + i);
			behavior.find('.behaviorHTML').html(behaviorHTML);
			behavior.find('.delete').on('click', function(id) {
				return function() { deleteBehavior(id); }
			}(behaviors[i].id));
			
			$('#behaviors').append(behavior);

		}

	});
    
};

var deleteBehavior = function(behaviorID) {

	for (var i = 0; i < behaviors.length; i++) {
		if (behaviors[i].id === behaviorID) {
			$('#behavior' + behaviorID).remove();
			behaviors.splice(i, 1);
			saveBehaviors();
			break;
		}
	}
	
	
	
};

var addBehavior = function() {
	
	var commandData = {};
	
	var command = $('#destNodeCommandName').val();
	var parameterList = commandList[command].parameters;
	var nodeKeys = Object.keys(parameterList);
	
	for (var i = 0, j = nodeKeys.length; i < j; i++) {
		
		var paramName = parameterList[nodeKeys[i]].name;
	    	
		var param = $('[name=' + paramName + ']');
		commandData[paramName] = param.val();

	}

	behaviors.push({
		
		sourceNodeName: $('#sourceNodeName option:selected').text(),
		sourceNodeModule: $('#sourceNodeModule').val(),
		sourceNodeComparableField: $('#sourceNodeComparableField').val(),
		sourceNodeComparableOperator: $('#sourceNodeComparableOperator').val(),
		sourceNodeComparableValue: $('#sourceNodeComparableValue').val(),
		destNodeName: config.deviceName,
		destNodeModule: $('#destNodeModule').val(),
		destNodeCommandName: $('#destNodeCommandName').val(),
		destNodeCommandData: commandData,
		execTriggerDelayMS: $('#execTriggerDelayMS').val()
		
	});

	saveBehaviors(function() {
		location.reload();
	});

};

var saveBehaviors = function(callback) {

    $.ajax({
        
        url: '//localhost/behavior',
        method: 'POST',
        data: JSON.stringify(behaviors),
        success: function(data, stat, req) {
            if (data === 'success') {
                if (typeof callback !== 'undefined') callback();
            } else {
                if (typeof callback !== 'undefined') callback(data);
            }
        },
        error: function(req, stat, err) {
             if (typeof callback !== 'undefined') callback(err);
        }
        
    });
	
};

var getDeviceList = function(callback) {

	// get list of devices
	$.get('//localhost/deviceList', function(data) {
		deviceList = data;
		if (typeof callback !== 'undefined') callback();
	});


};

var getAvailableModules = function(deviceIP, callback) {

	$.get('//' + deviceIP + '/config', function(data) {

		availableModules = data.nodeModules;
		if (typeof callback !== 'undefined') callback();
	});
	
};

var getStatusList = function(deviceIP, moduleName, callback) {

	$.get('//' + deviceIP + '/' + moduleName + '/statusList', function(data) {
		statusList = data;
		if (typeof callback !== 'undefined') callback();
	});
	
};

var getCommandList = function(moduleName, callback) {

	$.get('//localhost/' + moduleName + '/command', function(data) {
		commandList = data;
		if (typeof callback !== 'undefined') callback();
	});
	
};

var prepareAddBehavior = function() {

	getDeviceList(function() {
		
            var nodeKeys = Object.keys(deviceList);

            for (var i = 0, j = nodeKeys.length; i < j; i++) {

		var sourceNode = $('<option></option>');
		sourceNode.val(nodeKeys[i]);
		sourceNode.html(deviceList[nodeKeys[i]].name);
		
		$('#sourceNodeName').append(sourceNode);
		
            }

	});
	
};

var changedSourceNodeName = function() {
	
	var sourceNodeIP = $('#sourceNodeName').val();
	sourceNodeIP = 'localhost';
	getAvailableModules(sourceNodeIP, function() {
			
		$('#sourceNodeModule').empty();
		$('#sourceNodeModule').append('<option selected disabled>Choose Module</option>');

		for (var i = 0; i < availableModules.length; i++) {
			
			var module = $('<option></option>');
			module.val(availableModules[i]);
			module.html(availableModules[i]);
			
			$('#sourceNodeModule').append(module);

		}
		
	});
	
}


var changedOperator = function() {
	
	var sourceNodeIP = $('#sourceNodeName').val();
	var module = $('#sourceNodeModule').val();
	
	sourceNodeIP = 'localhost';
	
	getStatusList(sourceNodeIP, module, function() {
			
		$('#sourceNodeComparableValue').empty();

		for (var i = 0; i < statusList.length; i++) {
			
			var value = $('<option></option>');
			value.val(statusList[i]);
			value.html(statusList[i]);
			
			$('#sourceNodeComparableValue').append(value);

		}
		
	});
	
}

var changedDestNodeModule = function() {

	var module = $('#destNodeModule').val();

	$('#destNodeCommandName').empty();
	$('#destNodeCommandName').append('<option disabled>Choose Action</option>');

	getCommandList(module, function() {
		
            var nodeKeys = Object.keys(commandList);

            for (var i = 0, j = nodeKeys.length; i < j; i++) {

		var command = $('<option></option>');
		command.val(nodeKeys[i]);
		command.html(nodeKeys[i]);
		
		$('#destNodeCommandName').append(command);
		
            }
		
		
	});
	
};

var loadCommandParams = function() {

	var command = $('#destNodeCommandName').val();
	var parameterList = commandList[command].parameters;
	var nodeKeys = Object.keys(parameterList);
	
	$('#commandParams').empty();

	for (var i = 0, j = nodeKeys.length; i < j; i++) {
	    	
		$('#commandParams').append('<span>' + parameterList[nodeKeys[i]].name + ': </span>');
		
	    	// show drop down if values is a list
	    	if (parameterList[nodeKeys[i]].values.length > 0) {
	    		
	    		var parameterSelect = $('<select name="' + parameterList[nodeKeys[i]].name + '"></select>');
	    		
	    		for (var j = 0; j < parameterList[nodeKeys[i]].values.length; j++) {
	    			
	    			var value = parameterList[nodeKeys[i]].values[j];
	    			var parameter = $('<option></option>');
	    			parameter.val(value.value);
	    			parameter.html(value.key);
				parameterSelect.append(parameter);	    			
	    			
	    		}
	    		
	    		$('#commandParams').append(parameterSelect);
	
	    	} else {
	    	
		    	// otherwise show a text box
			var parameter = $('<input name="' + parameterList[nodeKeys[i]].name + '" type="text"/>');
			$('#commandParams').append(parameter);

	    	}
	
		$('#commandParams').append('</br>');
	}

};