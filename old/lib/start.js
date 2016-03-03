"use strict";

(function(){
	var exports = {};

	//includes 
	var Q = require('q'),
		util = require('./util.js');

	// all start process tasks
	_init();

	// public methods
	function startProcess(category){
		var deferred = Q.defer();

		_getData().then(function(data){
			if (data.length){
				util.logger.log("warn", "Raw File Exists - skipping");
				deferred.resolve(data);
			} else {
				console.info("no raw file");
				deferred.resolve(util.getRequest(category));
			}
		});
		
		util.logger.log("info", "Process Started", {category: category});
		return deferred.promise;
	}


	// private methods
	function _init(){
		util.init();
		util.logger.log("info", "System Details", {S3Bucket: util.getS3Bucket(), searchIndex: util.getSearchHostIndex(), dynamoEndpoint: util.getDynamoEndpoint(), searchIndexHost: util.getSearchHostPath()}) ;
	}

	function _getData(){

		var todayKey = parseInt(util.getDateString(),10), //20160203, //
			rawTable = util.getRawTable(),
			keys = [{date: todayKey}];

		return util.getData(keys, rawTable).then(function(data){
			var items = (data[0] && data[0].items) ? data[0].items : [];
			return items;
		});
	}

	exports.startProcess = startProcess;

	module.exports = exports;
})();