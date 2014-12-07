$('document').ready(function() {
    
    // get list of devices
    $.ajax({
        
        url: '//localhost/deviceList',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            
            var nodeKeys = Object.keys(data);
            
            for (var i = 0, j = nodeKeys.length; i < j; i++) {
                
                var device = $('#deviceClone').clone();
                device.removeAttr('id');
                device.children('.name').html(data[nodeKeys[i]].name);
                device.children('.ip').html(nodeKeys[i]);
                device.children('.config').attr('href', '//' + nodeKeys[i] + '/configure.html');
                device.children('.behavior').attr('href', '//' + nodeKeys[i] + '/behavior.html');
                device.children('.monitor').attr('href', '//' + nodeKeys[i] + '/monitor.html');
                
                $('#deviceTable').append(device);
                
            }
            
        }
        
    });
    
});