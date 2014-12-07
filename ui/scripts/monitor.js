var config = {};

$(document).ready(function(){
	
	getConfiguration();

});

var getConfiguration = function() {
	
	$.get('//localhost:8080/config', function(data) {

        $('#deviceNameLarge').html(data.deviceName);
		
		config = data;
		getMonitors();

	});
	
};

var getMonitors = function() {
    
    var modules = config.nodeModules;
    
    $('.monitor').remove();
    
    for (var i = 0; i < modules.length; i++) {
        
	    var monitor = $('#monitorClone').clone();
	    monitor.attr('id', '');
	    monitor.attr('class', 'monitor');
	    monitor.attr('src', '//localhost:8080/' + modules[i] + '/monitor');

	    monitor.load(function() {
	    	$(this).css('height', this.contentWindow.document.body.scrollHeight);
	    });

	    $('#monitors').append(monitor);	    

    }
    
};

//setInterval(getMonitors, 5000);