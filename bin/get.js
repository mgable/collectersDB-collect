(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q'),
		util = require('./util.js');

	//asignments
	var results = [],
		count = 0;


	//public methods
	function getData(keys, table){
		var dynamoClient = util.getDynamoClient(),
			deferred = Q.defer(),
			RequestItems = {};
		
		RequestItems[table] = {Keys: keys, ConsistentRead: false};

		var params = {
		    RequestItems: RequestItems,
		    ReturnConsumedCapacity: 'NONE'
		};
		
		dynamoClient.batchGet(params, function(err, data) {
		    if (err) {
		    	util.logger.log("error", "could not get data", err);
		    	deferred.reject(err);
			} else {
				util.logger.log("verbose", "get data was a success");
				deferred.resolve(data.Responses[table]);
			}
		});

		return deferred.promise;
	}

	function getBulkData(table, startKey){
		var dynamoClient = util.getDynamoClient(),
			deferred = Q.defer(),
			params = {
				TableName: table,
				ConsistentRead: false, // optional (true | false)
				ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
			}

		if (startKey){
			console.info("fetching more data");
			params.ExclusiveStartKey = startKey;
		}

		dynamoClient.scan(params, function(err, data) {
			if (err) {
				console.info(err); // an error occurred
				return deferred.reject(err);
			} else {
				results = results.concat(data.Items);
				count += data.Count;
				console.info("got %s items", count);
				if (data.LastEvaluatedKey){	
					getBulkData(table, data.LastEvaluatedKey);
				} else {
					return deferred.resolve(results);
				}
			} 
		});

		return deferred.promise;
	}

	// exports
	exports.getData = getData;
	exports.getBulkData = getBulkData;

	module.exports = exports;
}());