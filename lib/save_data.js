(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q'),
		util = require('../bin/util.js'),
		save = require('../bin/save.js');

	//asignments
	var diffSaved = false;

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

	function setDiffSaved(toWhat){
		diffSaved = toWhat;
	}

	function saveDiff(diff){
		var deferred = Q.defer();

		if (!util.program.nosave && !diffSaved){
			util.logger.log("info", "saving diff");
			save.saveBulkData(diff, util.getDiffTable()).then(function(){
				deferred.resolve(diff);
			});
		} else {
			util.logger.log("warn", "In NO-SAVE mode. Not saving diff.");
			deferred.resolve(diff);
			
		}

		return deferred.promise;
	}

	function saveStore(diff){
		var deferred = Q.defer();

		if (!util.program.nosave){
			util.logger.log("info", "saving store");
			save.saveBulkData(diff, util.getStoreTable()).then(function(){
				deferred.resolve(diff);
			});
		} else {
			util.logger.log("warn", "In NO-SAVE mode. Not saving store.");
			deferred.resolve(diff);
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
	exports.setDiffSaved = setDiffSaved;

	module.exports = exports;
}());