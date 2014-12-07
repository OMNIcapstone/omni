var submitForm = function() {

    var username = $('#username').val();
    var password = $('#password').val();
    var passwordConfirm = $('#confirmPassword').val();
    
    if (password !== passwordConfirm) {
        alert('Passwords must match!');
        return;
    }

    $.ajax({
        
        url: '//localhost/register',
        method: 'POST',
        data: JSON.stringify({username: username, password: password}),
        success: function(data, stat, req) {
            if (data === 'success') {
                window.location.href = 'omni.html';
            } else {
                console.log(data);
            }
        },
        error: function(req, stat, err) {
             console.log(req);
        }
        
    });
    
};