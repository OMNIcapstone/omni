var OMNIModule = require('../../OMNIModule.js');
var thisModule = new OMNIModule("email");

// initialize the module
thisModule.init = function(nodeConfig) {

    // define the available states for this module
    thisModule.setStatusList(['IDLE', 'SENDING']);

    // set initial state of the module
    thisModule.setState('IDLE', null);

    // set module dependencies
    var nodemailer = require('nodemailer');

    var sendCommand = thisModule.addCommand('SEND', function(req, res, data) {

        var SMTPServerAddress = data.SMTPServerAddress;
        var SMTPServerPort = data.SMTPServerPort;

        var emailUser = data.emailUser;
        var emailDomain = data.emailDomain;
        var emailPass = data.emailPass;

        var emailFrom = emailUser + '@' + emailDomain;
        var emailTo = data.emailTo;
        var subject = data.subject;
        var message = data.message;

        // change status to sending and announce it
        thisModule.setState('SENDING', null);

        // define transporter to send email
        var transporter = nodemailer.createTransport({
            port: SMTPServerPort,
            host: SMTPServerAddress,
            secure: true,
            auth: {
                user: emailFrom,
                pass: emailPass
            }
        });

        // define email message
        var mailOptions = {
            from: emailFrom,
            to: emailTo,
            subject: subject,
            text: message
        };

        // send email
        transporter.sendMail(mailOptions, function(error, info) {

            if (error) {
                res.write(JSON.stringify(error));
            }
            else {
                res.write(JSON.stringify('Message sent: ' + info.response));
            }

            // change status to idle and announce it
            thisModule.setState('IDLE', null);

        });

    });

    sendCommand.addParameter('SMTPServerAddress', true, null, '');
    sendCommand.addParameter('SMTPServerPort', true, null, '');
    sendCommand.addParameter('emailUser', true, null, '');
    sendCommand.addParameter('emailDomain', true, null, '');
    sendCommand.addParameter('emailPass', true, null, '');
    sendCommand.addParameter('emailTo', true, null, '');
    sendCommand.addParameter('subject', false, null, 'OMNI System Message');
    sendCommand.addParameter('message', false, null, '');

};

module.exports = thisModule;