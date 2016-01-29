"use strict";

(function(){
	var AWS = require('aws-sdk'),
		program = require('commander'),
		_ = require('underscore'),
		Q = require("q"),
		util = require("./util.js");

	program
		.version('0.0.1')
		.option('-f, --full', 'make full index')
		.parse(process.argv);

	var	storeTable = util.getStoreTable(),
		errors = [],
		requestItems = {},
		params = {},
		counter = 0,
		totalItems = 0,
		size = 25;

	requestItems[storeTable] = [];
	params.RequestItems = requestItems;
	params.ReturnConsumedCapacity = 'NONE'; // optional (NONE | TOTAL | INDEXES)
	params.ReturnItemCollectionMetrics = 'NONE'; // optional (NONE | SIZE)

	AWS.config.update({
		region: util.config.aws.region,
		endpoint: util.config.aws.dynamo.endpoint
	});

	var docClient = new AWS.DynamoDB.DocumentClient();

	init();

	function init(){
		// the meat of the matter
		getData().then(format).then(save);
	}

	function getData(){
		var todayKey = parseInt(util.getDateString(),10),
			keys = [{date: todayKey}],
			diffTable = util.getDiffTable();

		return util.getFromDynamo(keys, diffTable).then(function(data){
			console.info("got diff file");
			var newItems = data.Responses[diffTable][0].items;

			return newItems;
		});
	}

	function format(items){
		var results = [],
			deferred = Q.defer();

		items.forEach(function(item) {
			var key = parseInt(util.getDateString(new Date(item.meta.date.formatted)),10),
				param = {
					PutRequest: {
						Item: _.extend(item, {date: key})
					}
			};
			results.push(param);
		});

		deferred.resolve(results);

		return deferred.promise; 
	}

	function save(results){
		if (results.length){
			console.info("calling loading data: " + ++counter); // jshint ignore:line
			requestItems[storeTable] = results.splice(0, size);

			docClient.batchWrite(params, function(err, data) {
				if (err) {
					var errorMsg = JSON.stringify(err, null, 2);
					console.error("Unable to add item. Error JSON:", errorMsg);
					util.logger.log("Unable to add item. Error JSON: " + errorMsg, 'error');
				} else {
					console.log("PutItem succeeded:" + data);
					util.logger.log("PutItem succeeded");
				}
				save(results);
			});
		} else {
			console.info("DONE!!!!!!!");
			console.info("total items is " + totalItems);
			console.info("counter is " + counter);
			console.info("errors");
			console.info(errors);
		}
	}
})();