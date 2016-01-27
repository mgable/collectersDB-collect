"use strict";
(function() {
	var util = require('./util.js'),
		AWS = require('aws-sdk'),
		Q = require("q"),
		storeFile = util.getStoreTable();

	var results = [], count = 0;
	var deferred = Q.defer();

	getStoreFile(storeFile).then(makeIndex).then(save);

	function getStoreFile(storeFile){
		return getDataFromDynamo(storeFile);
	}

	function makeIndex(line){
		var results = '';

		if (typeof line === "object"){
			line.forEach(function(value, index){
				var str = JSON.stringify({"index":{"_id": (index + 1)}});
				results += str + "\n" + JSON.stringify(value) + "\n";
			});

			return results;
		}

		return line;
	}

	function save(data){
		var path = util.getIndexPath(),
			formattedFileName = util.getFileName("formatted.json"),
			file = path + formattedFileName;

		console.info("the total count is " + count);

		util.saveLocal(formattedFileName, path, file, data, util.config.contentType.json); //filename, path, file, data, contentType
		util.logger.log("cotal count is: " + count);
		util.logger.log("saving bulk import file: " + file);
	}

	function getDataFromDynamo(table, startKey){
		var params = {
			TableName: table,
			ConsistentRead: false, // optional (true | false)
			ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
		};

		if (startKey){
			console.info("fetching more data");
			params.ExclusiveStartKey = startKey;
		}

		AWS.config.update({
		    region: util.config.aws.region,
		    endpoint: util.config.aws.dynamo.endpoint
		});

		var docClient = new AWS.DynamoDB.DocumentClient();

		docClient.scan(params, function(err, data) {
			if (err) {
				console.info(err); // an error occurred
				return deferred.reject(err);
			} else {
				results = results.concat(data.Items);
				count += data.Count;
				if (data.LastEvaluatedKey){	
					getDataFromDynamo(table, data.LastEvaluatedKey);
				} else {
					return deferred.resolve(results);
				}
			} 
		});

		return deferred.promise;
	}

})();