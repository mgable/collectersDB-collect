"use strict";

(function(){
	var AWS = require('aws-sdk'),
		program = require('commander'),
		util = require("./util.js");

	program
		.version('0.0.1')
		.option('-f, --full', 'make full index')
		.parse(process.argv);

	var	storeTable = util.getStoreTable();

	init();

	function init(){
		getDataFromDynamo();
	}

	function getDataFromDynamo(){
		var todayKey = util.getDateString(),
			keys = [ {date: todayKey}],
			diffTable = util.getDiffTable();


		util.getFromDynamo(keys, diffTable).then(function(data){
			console.info("got diff file");
			var newItems = data.Responses[diffTable][0].items;

			save(storeTable, newItems);
		});
	}
	
	function save(table, items){
		AWS.config.update({
		    region: util.config.aws.region,
		    endpoint: util.config.aws.dynamo.endpoint
		});

		var docClient = new AWS.DynamoDB.DocumentClient();

		items.forEach(function(item) {
			var date = parseInt(util.getDateString(item.meta.date.formatted),10),
				params = {
					TableName: table,
					Item: {date: date, link:item.link, id:item.id, title:item.title, meta:item.meta, images: item.images, src: item.src},
					ExpressionAttributeNames:{"#date":"date"},
					ConditionExpression: 'attribute_not_exists(#date)'
				};

			docClient.put(params, function(err, data) {
				if (err) {
					var errorMsg = JSON.stringify(err, null, 2);
					console.error("Unable to add item. Error JSON:", errorMsg);
					util.logger.log("Unable to add item. Error JSON: " + errorMsg, 'error');
				} else {
					console.log("PutItem succeeded:" + data);
					util.logger.log("PutItem succeeded: ");
				}
			});
		});
	}
})();