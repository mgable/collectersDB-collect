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
		.option('-m, --noimages', 'do not download images') // not implemented
		.option('-i, --init', 'initalize')
		.parse(process.argv);

	var mode;
	// if (program.test){
		program.test = true;
		console.info("TEST MODE - XXXXXXXXXXXXXXXXXX!!!!!!!!!!");
		mode = "_test";
	// }

	// assignments
	var currentCategory,
		rawTable = program.test ? mode  + config.rawTable : config.rawTable,
		storeTable =  program.test ? mode  + config.storeTable : config.storeTable,
		diffTable = program.test ? mode  + config.diffTable : config.diffTable,
		imageDirectory = config.imageDirectory,
		docClient = _getDocClient();

	// public methods
	function getRequest(category){
		// set the category for system wide retreival
		currentCategory = category;
		return _getRequestObject(config.domain, category.id, config.contentType.json);
	}

	function getSearchHostIndex(){
		return config.searchHostIndex;
	}

	function getMapping(){
		var obj = {},
			type = getIndexType();

		obj[type] = config.mappings;
		return obj;
	}

	function getCategories(){
		return config.categories;
	}

	function getIndexType(){
		return _getRoot();
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
				console.info(data);
				deferred.resolve(data.Responses[table]);
			}
		});

		return deferred.promise;
	}

	function getRawTable(){
		return _getRoot() + rawTable;
	}

	function getDiffTable(){
		return _getRoot() + diffTable;
	}

	function getS3Bucket(){
		return config.aws.bucket;
	}

	function getContentType(type){
		return config.contentType[type];
	}

	function getImagePath(){
		return _getRoot() + "/" + imageDirectory +  makePathFromDateString(getDateString()) + "/";
	}

	function getStoreTable(){
		return _getRoot() + storeTable;
	}

	function makePathFromDateString(dateStr){
		var date = dateStr.match(/(\d{4})(\d{2})(\d{2})/);
		date.shift();
		return date.join("/");
	}

	function getSearchHostPath(){
		return _getSearchHost();
	}


	function makeOptions(urlstr){
		var urlObj = (url.parse(urlstr));

		var	options = {
			host: urlObj.host,
			port: urlObj.port || 80,
			path: urlObj.path,
			method: 'GET',
			agent: false
		};

		return options;
	}

	// private methods
	function _getDocClient(){
		// AWS configuration
		AWS.config.update({
			region: config.aws.region,
			endpoint: config.aws.dynamo.endpoint
		});

		var credentials = new AWS.SharedIniFileCredentials({profile: 'mgable'});
		AWS.config.credentials = credentials;

		return new AWS.DynamoDB.DocumentClient();
	}

	function _getRoot(){
		var root = currentCategory && currentCategory.name ? currentCategory.name : config.categories[0].name;
		return root;
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

	function _getSearchHost(){
		return config.searchHost;
	}

	// exports
	exports.getRequest = getRequest;
	exports.getCategories = getCategories;
	exports.generateHashCode = generateHashCode;
	exports.getDateString = getDateString;
	exports.getData = getData;
	exports.getRawTable = getRawTable;
	exports.getDiffTable = getDiffTable;
	exports.getStoreTable = getStoreTable;
	exports.makePathFromDateString = makePathFromDateString;
	exports.makeOptions = makeOptions;
	exports.program = program;
	exports.logger = logger;
	exports.docClient = docClient;
	exports.getS3Bucket = getS3Bucket;
	exports.getContentType = getContentType;
	exports.getImagePath = getImagePath;
	exports.getSearchHostPath = getSearchHostPath;
	exports.getSearchHostIndex = getSearchHostIndex;
	exports.getIndexType = getIndexType;
	exports.getMapping = getMapping;
	exports.program = program;

	module.exports = exports;
})();