"use strict";
(function(){
    var exports = {};

    // includes
    var nodemailer = require('nodemailer');

    // assignments
    var smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: 'collectorsdb@gmail.com',
                pass: 'collecting'
            }
        },
        transporter = nodemailer.createTransport(smtpConfig);

    // Public methods
    function sendMail(report){
        transporter.sendMail(_getMailData(report), _callback);
    }

    // private methods
    function _getMailData(report){
        return {
            from: 'collectorsdb@gmail.com',
            to: 'mgable43@gmail.com',
            subject: 'Data Collection Report for ' + Date(),
            text: report,
            html: report
        };
    }

    function _callback(){
    	console.info("I sent the mail");
    	console.info(arguments);
    }

    exports.sendMail = sendMail;

    module.exports = exports;
})();