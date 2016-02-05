"use strict";
(function(){
	var exports = {};

	// includes
	var mail = require('./mail.js'),
		util = require('../lib/util.js');


	function makeReport(data){
		_sendReport(data);
	}

	function _sendReport(report){
		mail.sendMail(report);
	}

	exports.makeReport = makeReport;

	module.exports = exports;
})();