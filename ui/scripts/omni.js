$('document').ready(function() {

    // get list of devices
    $.ajax({

        url: '//localhost/deviceList',
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
                device.find('.config').attr('href', '//' + nodeKeys[i] + ':8080/ui/configure.html');
                device.find('.behavior').attr('href', '//' + nodeKeys[i] + ':8080/ui/behavior.html');
                device.find('.monitor').attr('href', '//' + nodeKeys[i] + ':8080/ui/monitor.html');

                $('#deviceTable').append(device);

            }

        }

    });

});