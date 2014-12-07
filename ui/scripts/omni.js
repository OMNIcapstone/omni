$('document').ready(function() {
    
    // get list of devices
    $.ajax({
        
        url: '//localhost:8080/deviceList',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            
            var nodeKeys = Object.keys(data);
            
            for (var i = 0, j = nodeKeys.length; i < j; i++) {
                console.log(nodeKeys[i]);
                var device = $('#deviceClone').clone();
                device.removeAttr('id');
                device.find('.name').html(data[nodeKeys[i]].name);
                device.find('.ip').html(nodeKeys[i]);
                device.find('.config').attr('href', '//' + nodeKeys[i] + ':8080/configure.html');
                device.find('.behavior').attr('href', '//' + nodeKeys[i] + ':8080/behavior.html');
                device.find('.monitor').attr('href', '//' + nodeKeys[i] + ':8080/monitor.html');
                
                $('#deviceTable').append(device);
                
            }
            
        }
        
    });
    
});