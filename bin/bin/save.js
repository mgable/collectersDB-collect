(function(){
	"use strict";

	var exports = {};

	//includes
	var Q = require('q'),
		util = require('../util.js');

	// assignments
	var	storeTable,
		errors = [],
		unprocessItems = [],
		unprocessTries = 0,
		counter = 0,
		totalItems = 0,
		storeDeferred, // = Q.defer(),
		items,
		requestItems = {},
		dynamoClient,
		params = {};

	var size,
		startingDelay,
		increment,
		delay,
		startingDelay;

	params.RequestItems = requestItems;
	params.ReturnConsumedCapacity = 'NONE'; // optional (NONE | TOTAL | INDEXES)
	params.ReturnItemCollectionMetrics = 'NONE'; // optional (NONE | SIZE)

	// public methods
	function saveToDynamo(diff, promise){
		items = diff.slice(0);
		totalItems = diff.length;
		storeTable = util.getStoreTable();
		requestItems[storeTable] = [];

		storeDeferred = promise;

		var config = util.getConfigValue("aws");
		dynamoClient  = util.getDynamoClient(),
		size = config.dynamo.settings.size || 25,
		startingDelay = config.dynamo.settings.startingDelay || 3000,
		increment = config.dynamo.settings.increment || 500,
		delay = startingDelay;

		_saveToDynamo(diff);
	}

	// private methods
	function _saveToDynamo(results){
		if (results.length){
			util.logger.log("verbose", "calling loading data: %s", ++counter); /* jshint ignore:line*/
			requestItems[storeTable] = results.splice(0, size);
			dynamoClient.batchWrite(params, function(err, data) {
				if (err) {
					util.logger.log("error", err); // an error occurred
					errors.push(err);
				} else {
					if(data.UnprocessedItems[storeTable] && data.UnprocessedItems[storeTable].length){
						unprocessItems = unprocessItems.concat(data.UnprocessedItems[storeTable]);
						util.logger.log("verbose", "unprocessed items " + data.UnprocessedItems[storeTable].length); // successful response
						util.logger.log("verbose", "total unprocessed items " + unprocessItems.length);
						delay += increment;
					} else {
						delay = startingDelay;
					}
					util.logger.log("verbose", "success", data);
				}

				setTimeout(function(){
					util.logger.log("verbose", "delay", {"delay": delay})
					_saveToDynamo(results);
				},delay);
			});
		} else {
			if(unprocessItems.length && (unprocessTries++ < 10)){
				util.logger.log("verbose", "We have " + unprocessItems.length + " unprocessItems");
				util.logger.log("verbose", "WAITING " + delay/1000 + " seconds");
				util.logger.log("verbose", "this has been the " + unprocessTries + " times through the loop");
				setTimeout(function(){
					util.logger.log("verbose", "starting again");
					util.logger.log("verbose", "the delay was " + delay);
					_saveToDynamo(unprocessItems.splice(0));
				},delay += increment);
			} else {
				util.logger.log("info", "Completed upload to Dynamo", {itemCount: totalItems});
				if (errors.length){
					util.logger.log("error", errors, {filename: __filename, method: "_saveToDynamo"});
				}
				storeDeferred.resolve(items);
			}
		}
	}

	// exports
	exports.saveToDynamo = saveToDynamo;

	module.exports = exports;
}());