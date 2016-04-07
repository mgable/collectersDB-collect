(function(){
	"use strict";

	var exports = {};

	//includes 
	var Q = require('q'),
		util = require('../bin/util.js'),
		report = require('../bin/report.js'),
		del = require('../bin/delete.js'),
		util = require('../bin/util.js');

	// public methods
	function finishProcess(diff){
		var deferred = Q.defer(),
			 key = util.getYesterdaysKey(),
			table = util.getDiffTable();

		del.remove(table, key).then(function(){
			util.logger.log("info", "End Process");
			util.logger.report().then(function(data){
				report.makeReport(data);
				deferred.resolve(diff);
				console.info("*********END*************");
			});
		});
		
		return deferred.promise;
	}

	// private methods
	function _delete(){
		var key = util.getYesterdaysKey(),
			table = util.getDiffTable();

		return del.remove(table, key);
	}


	// exports
	exports.finishProcess = finishProcess;

	module.exports = exports;
}());