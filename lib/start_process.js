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

		if (util.program.create){
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

		var todayKey = util.getTodaysKey().toString(),
			rawTable = util.getRawTable(),
			key = {date: todayKey};

		return get.getItem(rawTable, key).then(data => {
				var items = (data && data.Item && data.Item.items) ? data.Item.items : [];
				return items;
			},
			(error) => {
				util.logger.log("error", "error reading raw file", {err, rawTable, key});
			}
		);
	}

	// exports
	exports.startProcess = startProcess;

	module.exports = exports;
	
}());