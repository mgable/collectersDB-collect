(function(){
	"use strict";

	var exports = {};

	//includes 
	var Q = require('q'),
		util = require('../bin/util.js'),
		report = require('../bin/report.js');

	// public methods
	function finishProcess(diff){
		var deferred = Q.defer();

		util.logger.log("info", "End Process");
		util.logger.report().then(function(data){
			console.info("0");
			report.makeReport(data);
			console.info("1");
			deferred.resolve(diff);
			console.info("*********END*************");
		});

		return deferred.promise;
	}

	// exports
	exports.finishProcess = finishProcess;

	module.exports = exports;
}());