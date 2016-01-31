"use strict";

(function(){
	var exports = {};

	// includes
	var program = require('commander'),
		Q = require('q'),
		AWS = require('aws-sdk'),
		url = require('url'),
		config = require('../config/config.js'),
		logger = require('./log.js');

	// program configuration
	program
		.version('0.0.1')
		.option('-t, --test', 'test mode')
		.parse(process.argv);

	var mode;
	//if (program.test){
		program.test = true;
		console.info("TEST MODE - XXXXXXXXXXXXXXXXXX!!!!!!!!!!");
		mode = "_test";
	//}

	// AWS configuration
	AWS.config.update({
	    region: config.aws.region,
	    endpoint: config.aws.dynamo.endpoint
	});

	// assignments
	var currentCategory,
		rawTable = program.test ? mode  + config.rawTable : config.rawTable,
		storeTable =  program.test ? mode  + config.storeTable : config.storeTable,

		docClient = new AWS.DynamoDB.DocumentClient();

	// public methods
	function getRequest(category){
		// set the category for system wide retreival
		currentCategory = category;
		return _getRequestObject(config.domain, category.id, config.contentType.json);
	}

	function getCategories(){
		return config.categories;
	}

	function generateHashCode(s){
		return Math.abs(s.split("").reduce(function(a,b){a = ((a << 5) - a) + b.charCodeAt(0);return a & a;}, 0)); // jshint ignore:line
	}

	function getDateString(d){
		var date = d || new Date();
		return date.getFullYear().toString() + _pad(date.getMonth()+1) + _pad(date.getDate());
	}

	function getData(keys, table){
		var deferred = Q.defer(),
			RequestItems = {};
		
		console.info("getting from dynamo");
		
		RequestItems[table] = {Keys: keys, ConsistentRead: false};

		var params = {
		    RequestItems: RequestItems,
		    ReturnConsumedCapacity: 'NONE'
		};
		
		docClient.batchGet(params, function(err, data) {
		    if (err) {
		    	console.info(err); // an error occurred
		    	deferred.reject(err);
			} else {
				console.info("get data was a success");
				deferred.resolve(data.Responses[table]);
			}
		});

		return deferred.promise;
	}

	function getRawTable(){
		return _getRoot() + rawTable;
	}

	function getStoreTable(){
		return _getRoot() + storeTable;
	}

	function makePathFromDateString(dateStr){
		var date = dateStr.match(/(\d{4})(\d{2})(\d{2})/);
		date.shift();
		return date.join("/");
	}

	function makeOptions(urlstr){
		var urlObj = (url.parse(urlstr));

		var	options = {
			host: urlObj.host,
			port: 80,
			path: urlObj.path,
			method: 'GET',
			agent: false
		};

		return options;
	}

	// private methods
	function _getRoot(){
		return currentCategory.name;
	}

	function _pad(date){
		return ("00" + date).slice(-2);
	}

	function _getRequestObject(domain, id, contentType){
		return {
			host: domain,
			port: 80,
			path: _getPageTemplate(id),
			method: 'POST',
			contentType: contentType
		};
	}
	function _getPageTemplate(id){
		return config.pageUrlTemplate.replace(/( \*{3}) config\.category\.id (\*{3} )/, id);
	}

	// exports
	exports.getRequest = getRequest;
	exports.getCategories = getCategories;
	exports.generateHashCode = generateHashCode;
	exports.getDateString = getDateString;
	exports.getData = getData;
	exports.getRawTable = getRawTable;
	exports.getStoreTable = getStoreTable;
	exports.makePathFromDateString = makePathFromDateString;
	exports.makeOptions = makeOptions;
	exports.program = program;
	exports.logger = logger;
	exports.docClient = docClient;

	module.exports = exports;
})();