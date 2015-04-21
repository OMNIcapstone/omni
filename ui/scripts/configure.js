var config = {};

$(document).ready(function() {

	getDeviceTypes();

});

var multiInit = function() {

	$('#moduleSelect').multiSelect({
		selectableHeader: "<div class='custom-header'>Available</div>",
		selectionHeader: "<div class='custom-header'>Selected</div>"
	});

};

var getConfiguration = function() {

	$.get('//localhost/config', function(data) {

		$('#deviceNameLarge').html(data.deviceName);
		$('#deviceName').val(data.deviceName);
		$('#devType').val(data.deviceType);
		$('#moduleSelect').val(data.nodeModules);

		multiInit();
		config = data;

	});

};

var getDeviceTypes = function() {

	$.get('//localhost/deviceTypes', function(data) {

		for (var i = 0; i < data.length; i++) {

			var deviceType = $('<option></option>');
			deviceType.val(data[i]);
			deviceType.text(data[i]);
			$('#devType').append(deviceType);

		}

		getAvailableModules();

	});

};

var getAvailableModules = function() {

	$.get('//localhost/availableModules', function(data) {

		for (var i = 0; i < data.length; i++) {

			var module = $('<option></option>');
			module.val(data[i]);
			module.text(data[i]);
			$('#moduleSelect').append(module);

		}

		getConfiguration();

	});

};

var submitForm = function() {

	config.deviceName = $('#deviceName').val();
	config.deviceType = $('#devType').val();
	config.nodeModules = $('#moduleSelect').val();

	$.ajax({

		url: '//localhost/config',
		method: 'POST',
		data: JSON.stringify(config),
		success: function(data, stat, req) {
			if (data === 'success') {
				window.location.href = 'omni.html';
			}
			else {
				console.log(data);
			}
		},
		error: function(req, stat, err) {
			console.log(req);
		}

	});

};