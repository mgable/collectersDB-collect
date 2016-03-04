(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q'),
		AWS = require('aws-sdk'),
		util = require('./util.js');


	//public methods
	function getData(keys, table){
		var docClient = _getDocClient(),
			deferred = Q.defer(),
			RequestItems = {};
		
		RequestItems[table] = {Keys: keys, ConsistentRead: false};

		var params = {
		    RequestItems: RequestItems,
		    ReturnConsumedCapacity: 'NONE'
		};
		
		docClient.batchGet(params, function(err, data) {
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

	// private methods
	function _getDocClient(){
		var localConfig = util.getConfigValue("aws");
		// AWS configuration
		AWS.config.update({
			region: localConfig.dynamo.region,
			endpoint: localConfig.dynamo.endpoint
		});

		var credentials = new AWS.SharedIniFileCredentials({profile: localConfig.profile});
		AWS.config.credentials = credentials;

		return new AWS.DynamoDB.DocumentClient();
	}

	// exports
	exports.getData = getData;

	module.exports = exports;
}());