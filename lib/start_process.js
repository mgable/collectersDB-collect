(function(){
	"use strict";

	var exports = {};

	//includes 
	var Q = require('q'),
		util = require('../bin/util.js'),
		get = require('../bin/get.js');

	// asignments

	// public methods
	function startProcess(category){
		var deferred = Q.defer();

		_init();

		_getData().then(function(data){
			if (data.length){
				util.logger.log("warn", "Raw File Exists - skipping");
				deferred.resolve(data);
			} else {
				util.logger.log("verbose", "no raw file");
				console.info(category);
				console.info(util.getRequest(category));
				deferred.resolve(util.getRequest(category));
			}
		});
		
		util.logger.log("info", "Process Started", {category: category});
		return deferred.promise;
	}

	// private methods
	function _init(){
		util.logger.log("info", "System Details", {"config": util.getConfigValue('aws')}) ;
	}

	function _getData(){

		var todayKey = util.getTodaysKey(),
			rawTable = util.getRawTable(),
			keys = [{date: todayKey}];

		return get.getData(keys, rawTable).then(function(data){
			var items = (data[0] && data[0].items) ? data[0].items : [];
			return items;
		});
	}

	// exports
	exports.startProcess = startProcess;

	module.exports = exports;
	
}());