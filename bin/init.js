(function(){
	"use strict";

	var exports = {};

	// includes
	var AWS = require("aws-sdk"),
		Q = require('q'),
		util = require('./util.js');

	// assignments
	var deferred = Q.defer(),
		dynamodb;

	// public methods
	function createTables(){
		var config = util.getConfigValue("output"),
			category = util.program.args[0] || util.getIndexType(),
			rawTableName = category + config.directories.rawTable,
			diffTableName = category + config.directories.diffTable,
			storeTableName = category + config.directories.storeTable,
			tables = [{"name":rawTableName, "type": "raw"}, {"name": diffTableName, "type": "store"}, {"name": storeTableName, "type": "store"}];

		if (util.program.test){
			var mode = "_test",
				testRawTableName = category + mode + config.directories.rawTable,
				testDiffTableName = category + mode + config.directories.diffTable,
				testStoreTableName = category + mode + config.directories.storeTable;

			tables.push({"name": testRawTableName, "type": "raw"});
			tables.push({"name": testDiffTableName, "type": "store"});
			tables.push({"name": testStoreTableName, "type": "store"});
		}

		_process(tables);

		deferred = Q.defer();

		return deferred.promise;
	}

	// private methods
	function _init(){
		var localConfig = util.getConfigValue("aws");
		
		// AWS configuration
		AWS.config.update({
			region: localConfig.dynamo.region,
			endpoint: localConfig.dynamo.endpoint
		});

		var credentials = new AWS.SharedIniFileCredentials({profile: localConfig.profile});
		AWS.config.credentials = credentials;

		dynamodb = new AWS.DynamoDB();
	}

	function _process(tables){
		if (tables.length){
			var table = tables.pop();
			_createTable(table, tables).then(_process);
		} else {
			deferred.resolve("done!!!");
		}
	}

	function _createTable(options, tables) {
		var params = _getParams(options.type),
			deferred = Q.defer();

		params.TableName = options.name;

		if (!dynamodb) {
			_init();
		}


		dynamodb.createTable(params, function(err, data) {
			if (err) {
				console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
			} else {
				console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
			}
			deferred.resolve(tables);
		});

		return deferred.promise;
	}

	function _getParams(type){
		var params =  {
			ProvisionedThroughput: {       
				ReadCapacityUnits: 10, 
				WriteCapacityUnits: 10
			}
		};

		if (type === "store"){
			params.KeySchema = [
				{ AttributeName: "link", KeyType: "HASH"},  //Partition key
				{ AttributeName: "date", KeyType: "RANGE" }  //Sort key
			];
			params.AttributeDefinitions = [
				{ AttributeName: "link", AttributeType: "S" },
				{ AttributeName: "date", AttributeType: "N" }
			];
		} else {
			params.KeySchema = [
				{ AttributeName: "date", KeyType: "HASH"},  //Partition key
			];
			params.AttributeDefinitions = [
				{ AttributeName: "date", AttributeType: "N" }
			];
		}



		return params;
	}

	// exports
	exports.createTables = createTables;

	module.exports = exports;
}());