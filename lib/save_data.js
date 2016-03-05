(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q'),
		util = require('../bin/util.js'),
		save = require('../bin/save.js');

	// public methods
	function saveData(items){
		var deferred = Q.defer();
		if (!util.program.nosave){
			var key = util.getTodaysKey(),
				params = {
					TableName: util.getRawTable(),
					Item: {date: key, items: items},
					ExpressionAttributeNames: {"#date": "date"},
					ConditionExpression: 'attribute_not_exists(#date)'
				};
			deferred.resolve(_saveData(params, key, items,  "Saving Raw"));
		} else {
			util.logger.log("warn", "In NO-SAVE mode. Not saving raw data.");
			deferred.resolve(items);
		}

		return deferred.promise;
	}

	function saveDiff(diff){
		var deferred = Q.defer();
		console.info("saving diff");
		//console.info(diff);
		if (!util.program.nosave){
			var key = util.getTodaysKey(),
			params = {
				TableName: util.getDiffTable(),
				Item: {date: key, items: diff}
			};
			deferred.resolve(_saveData(params, key, diff, "Saving Diff"));
		} else {
			util.logger.log("warn", "In NO-SAVE mode. Not saving diff.");
			deferred.resolve(diff);
			
		}

		return deferred.promise;
	}

	function saveStore(diff){
		var deferred = Q.defer();

		if (!util.program.nosave){
			deferred.resolve("saved store: " + diff);
		} else {
			deferred.resolve("NO DATA STORE SAVED :" + diff);
		}

		return deferred.promise;
	}

	function _saveData(params, key, items, logMessage){
		util.logger.log("info", logMessage, {itemCount: items.length, table: params.TableName, key: key});
		return save.saveData(params, key, items);
	}

	// exports
	exports.saveData = saveData;
	exports.saveDiff = saveDiff;
	exports.saveStore = saveStore;

	module.exports = exports;
}());