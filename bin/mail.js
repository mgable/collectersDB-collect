(function(){
    "use strict";
    
    var exports = {};

    // includes
    var nodemailer = require('nodemailer'),
        credentials = require('../config/credentials.js')

    // assignments
    var smtpConfig = {
            host: credentials.smtp.host,
            port: 465,
            secure: true, // use SSL
            auth: {
                user: credentials.smtp.user,
                pass: credentials.smtp.pass
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
    }

    exports.sendMail = sendMail;

    module.exports = exports;
})();