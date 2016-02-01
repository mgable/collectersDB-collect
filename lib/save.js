"use strict";

(function(){
	var exports = {};

	// includes
	var Q = require('q'),
		_ = require('underscore'),
		util = require('./util.js');

	// assignments
	var	storeTable,
		errors = [],
		unprocessItems = [],
		unprocessTries = 0,
		counter = 0,
		totalItems = 0,
		size = 25,
		storeDeferred = Q.defer(),
		diff,
		startingDelay = 3000,
		delay = startingDelay,
		increment = 500,
		requestItems = {},
		params = {};

	params.RequestItems = requestItems;
	params.ReturnConsumedCapacity = 'NONE'; // optional (NONE | TOTAL | INDEXES)
	params.ReturnItemCollectionMetrics = 'NONE'; // optional (NONE | SIZE)

	// public methods
	function saveStore(data, table){
		diff = data;
		totalItems = diff.length;
		storeTable = table || util.getStoreTable();
		requestItems[storeTable] = [];
		console.info("saving to store %s items", diff.length);
		_saveToDynamo(_formatData(diff));

		return storeDeferred.promise;
	}

	function saveRaw(items){
		var deferred = Q.defer(),
			key = parseInt(util.getDateString(new Date()),10),
			params = {
				TableName: util.getRawTable(),
				Item: {date: key, items: items},
				ExpressionAttributeNames: {"#date": "date"},
				ConditionExpression: 'attribute_not_exists(#date)'
			};

		util.docClient.put(params, function(err /*, data*/) {
			if (err) {
				if (err.message === "The conditional request failed"){
					console.error("Looks like the raw file has been written for today, - skipping");
				} else {
					console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
					util.logger.log(err.message, 'error');
				}
			} else {
				console.log("PutItem succeeded:");
				util.logger.log("SAVED - raw file: " + key);
			}

			deferred.resolve(items);
		});

		return deferred.promise;
	}

	// private methods
	function _saveToDynamo(results){
		if (results.length){
			console.info("calling loading data: %s", ++counter); /* jshint ignore:line*/
			requestItems[storeTable] = results.splice(0,size);
			util.docClient.batchWrite(params, function(err, data) {
				if (err) {
					console.info(err); // an error occurred
					errors.push(err);
				} else {
					if(data.UnprocessedItems[storeTable] && data.UnprocessedItems[storeTable].length){
						unprocessItems = unprocessItems.concat(data.UnprocessedItems[storeTable]);
						console.info("unprocessed items " + data.UnprocessedItems[storeTable].length); // successful response
						console.info("total unprocessed items " + unprocessItems.length);
						delay += increment;
					} else {
						delay = startingDelay;
					}
					console.info("success: " + data); // successful response
				}

				setTimeout(function(){
					console.info("the delay was " + delay);
					_saveToDynamo(results);
				},delay);
			});
		} else {
			if(unprocessItems.length && (unprocessTries++ < 10)){
				console.info("We have " + unprocessItems.length + " unprocessItems");
				console.info("WAITING " + delay/1000 + " seconds");
				console.info("this has been the " + unprocessTries + " times through the loop");
				setTimeout(function(){
					console.info("starting again");
					console.info("the delay was " + delay);
					_saveToDynamo(unprocessItems.splice(0));
				},delay += increment);
			} else {
				console.info("DONE!!!!!!!");
				console.info("total items is " + totalItems);
				console.info("counter is " + counter);
				console.info("errors");
				console.info(errors);
				storeDeferred.resolve(diff);
			}
		}
	}

	function _formatData(items){
		console.info("formatting itmes " + items.length);
		var results = [];
		items.forEach(function(item) {

			if (item){
				var key = parseInt(util.getDateString(new Date(item.meta.date.formatted)),10),
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

	exports.saveStore = saveStore;
	exports.saveRaw = saveRaw;

	module.exports = exports;
})();