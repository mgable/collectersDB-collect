(function(){
	"use strict";

	var exports = {};

	//includes
	var Q = require('q'),
		_ = require('underscore'),
		util = require('./util.js'),
		save = require('./bin/save.js');


	// public methods
	function saveData(params, key, items){
		var deferred = Q.defer(),
			dynamoClient = util.getDynamoClient();

		dynamoClient.put(params, function(err /*, data*/) {
			if (err) {
				if (err.message === "The conditional request failed"){
					util.logger.log("warn", "Looks like the file has been written for today - skipping");
				} else {
					util.logger.log("error", "Unable to add item", err);
				}
			} else {
				util.logger.log("verbose", "Save Item", {table: params.TableName, key: key});
			}

			deferred.resolve(items);
		});

		return deferred.promise;
	}

	
	function saveBulkData(diff, table){
		var deferred = Q.defer();
		save.saveToDynamo(_formatData(diff), deferred, table);
		return deferred.promise;
	} 

	//private methods
	function _formatData(items){
		var results = [];
		items.forEach(function(item) {

			if (item){
				var key = util.getTodaysKey(),
					param = {
						PutRequest: {
							Item: _.extend(item, {date: key})
						}
				};
				results.push(param);
			}
		});

		return results;
	}
	

	//exports
	exports.saveData = saveData;
	exports.saveBulkData = saveBulkData;

	module.exports = exports;
}());