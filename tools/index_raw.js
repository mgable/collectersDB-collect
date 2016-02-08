"use strict";

(function(){
	var exports = {};

	var util = require('../lib/util.js'),
		AWS = require('aws-sdk'),
		Q = require("q"),
		KEY = 20160206;

	getData(KEY).then(saveRaw);

	function getData(_key){

		var key = _key, //20160203, //
			rawTable = util.getRawTable(),
			keys = [{date: key}];

		return util.getData(keys, rawTable).then(function(data){
			var items = (data[0] && data[0].items) ? data[0].items : [];
			return items;
		});
	}

	function saveRaw(items){
		var key = KEY,
			params = {
				TableName: "advertising_tins_test_raw",
				Item: {date: key, items: items},
				ExpressionAttributeNames: {"#date": "date"},
				ConditionExpression: 'attribute_not_exists(#date)'
			};

		util.logger.log("info", "Saving Raw", {itemCount: items.length, table: params.TableName, key: key});
		return _putData(params, key, items);
	}

	// private methods
	function _putData(params, key, items){
		console.info("ssssssss");
		var deferred = Q.defer(),
			docClient = _getDocClient();

console.info("here!!!");
		docClient.put(params, function(err /*, data*/) {
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

	function _getDocClient(){
		// AWS configuration
		console.info("get doc client");
		AWS.config.update({
			region: 'us-west-1',
			endpoint: 'http://localhost:8000'
		});

		var credentials = new AWS.SharedIniFileCredentials({profile: 'mgable'});
		AWS.config.credentials = credentials;

		return new AWS.DynamoDB.DocumentClient();
	}

	module.exports = exports;
}());