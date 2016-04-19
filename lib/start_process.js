(function(){
	"use strict";

	var exports = {};

	//includes 
	var Q = require('q'),
		//fs = require('fs'),
		util = require('../bin/util.js'),
		get = require('../bin/get.js'),
		save = require('./save_data.js'),
		init = require('../bin/init.js');

	// asignments

	// public methods
	function startProcess(category){
		var deferred = Q.defer();

		util.setCategory(category);

		_init();

		util.logger.log("info", "Process Started", {category: category});

		if (util.program.init){
			util.logger.log("info", "creating tables", {category: category});
			init.createTables().then(() => {
				util.logger.log("info", "getting raw file for the first time");

				deferred.resolve(util.getRequest(category));
			});
		} else {

			_getData().then(data => {
				if (data.length){
					util.logger.log("warn", "Raw File Exists - skipping");
					deferred.resolve(data);
				} else {
					util.logger.log("verbose", "no raw file");
					deferred.resolve(util.getRequest(category));
				}
			});
			
		}

		return deferred.promise;
	}

	// private methods
	function _init(){
		util.init();
		util.logger.log("info", "System Details", {"config": util.getConfigValue('aws')}) ;
		_reset();
	}

	function _reset(){
		save.setDiffSaved(false);
	}

	function _getData(){

		var todayKey = util.getTodaysKey(),
			rawTable = util.getRawTable(),
			keys = [{date: todayKey}];

		return get.getData(keys, rawTable).then(data => {
			var items = (data[0] && data[0].items) ? data[0].items : [];
			return items;
		});
	}

	// exports
	exports.startProcess = startProcess;

	module.exports = exports;
	
}());