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
			report.makeReport(data);
		});

		deferred.resolve(diff);

		return deferred.promise;
	}

	// exports
	exports.finishProcess = finishProcess;

	module.exports = exports;
}());