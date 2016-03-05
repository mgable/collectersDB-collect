(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q'),
		util = require('./util.js');


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
		    	util.logger.log("error", "could not get data", err)
		    	deferred.reject(err);
			} else {
				util.logger.log("verbose", "get data was a success")
				deferred.resolve(data.Responses[table]);
			}
		});

		return deferred.promise;
	}

	// exports
	exports.getData = getData;

	module.exports = exports;
}());