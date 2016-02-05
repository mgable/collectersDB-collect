"use strict";

(function(){
	var exports = {};

	// includes
	var report = require('../bin/report.js'),
		util = require('./util.js');

	function finish(/* items */){
		//util.logger.addLogFile(util.getDateString());
		util.logger.log("info", "End Process");
		util.logger.report().then(function(data){
			report.makeReport(data);
		});
	}

	exports.finish = finish;

	module.exports = exports;
}());