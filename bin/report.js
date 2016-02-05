"use strict";
(function(){
	var exports = {};

	// includes
	var mail = require('./mail.js'),
		util = require('../lib/util.js');

	function sendReport(data){
		mail.sendMail(JSON.stringify(data));
	}

	exports.sendReport = sendReport;

	module.exports = exports;
})();