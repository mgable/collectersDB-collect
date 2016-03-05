(function(){
	"use strict";

	var exports = {};

	//includes
	var Q = require('q'),
		util = require('./util.js');


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

	//exports
	exports.saveData = saveData;

	module.exports = exports;
}());