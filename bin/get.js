(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q'),
		util = require('./util.js');

	//asignments
	var results = [],
		count = 0,
		dynamoClient,
		params,
		deferred = Q.defer();


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
		    	util.logger.log("error", "could not get data", {err, keys, table});
		    	deferred.reject(err);
			} else {
				util.logger.log("verbose", "get data was a success");
				deferred.resolve(data.Responses[table]);
			}
		});

		return deferred.promise;
	}

	function getItem(table, key){
		_reset();
		dynamoClient = util.getDynamoClient();

		params = {
			TableName: table,
			Key: key,
			ConsistentRead: false, // optional (true | false)
			ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
		};

		dynamoClient.get(params, function(err, data) {
			if (err) {
				util.logger.log("error", "there was an error getting an item", {err, table, key});
				deferred.reject(err);
			} else { 
				util.logger.log("info", "got item", {table, key});
				deferred.resolve(data);
			}
		});

		return deferred.promise;
	}


	function getBulkData(table, key){
		_reset();
		dynamoClient = util.getDynamoClient();

		params = {
			TableName: table,
			FilterExpression: "#date = :date",
		    ExpressionAttributeValues: {":date": key},
		    ExpressionAttributeNames: {"#date":"date"},
			ConsistentRead: false, // optional (true | false)
			ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
		};


		_getBulkData(table, null, key);

		return deferred.promise;
	}

	function getBulkDataAll(table){
		_reset();
		dynamoClient = util.getDynamoClient();

		params = {
			TableName: table,
			ConsistentRead: false, // optional (true | false)
			ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
		};


		_getBulkData(table, null, null);

		return deferred.promise;
	}

	// private methods
	function _reset(){
		results = [];
		count = 0;
		deferred = Q.defer();
	}

	function _getBulkData(table, startKey, key){
		if (startKey){
			params.ExclusiveStartKey = startKey;
		}

		dynamoClient.scan(params, function(err, data) {
			if (err) {
				console.info(err); // an error occurred
				deferred.reject(err);
			} else {
				results = results.concat(data.Items);
				count += data.Count;
				if (data.LastEvaluatedKey){	
					_getBulkData(table, data.LastEvaluatedKey, key);
				} else {
					deferred.resolve(results);
				}
			} 
		});
	}

	// exports
	exports.getData = getData;
	exports.getItem = getItem;
	exports.getBulkData = getBulkData;
	exports.getBulkDataAll = getBulkDataAll;

	module.exports = exports;
}());