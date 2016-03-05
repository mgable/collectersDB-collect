(function(){
	"use strict";

	var exports = {};

	// includes - their's
	var program = require('commander'),
		Q = require('q'),
		AWS = require('aws-sdk'),
		url = require('url');
		// datejs extends date prototype
		require('datejs');

	// includes - mine
	var	logger = require('./log.js'),
		sysConfig = require('../config/config.js'),
		fetch = require('./fetch.js');

	// assignments
	var config,
		currentCategory,
		rawTable,
		diffTable,
		storeTable,
		imageDirectory,
		searchHostIndex

	// program configuration
	program
		.version('0.0.1')
		.option('-t, --test', 'test mode')
		.option('-m, --noimages', 'do not download images')
		.option('-i, --init', 'initalize new indexes')
		.option('-x, --nosave', 'do not save or index')
		.option('-p, --program', 'program mode')
		.parse(process.argv);

	// public methods
	function getCategories(){
		var deferred = Q.defer();

		deferred.resolve(config.source.categories);

		return deferred.promise;
	}

	function init(){
		logger.addLogFile(_getDateString()); //'./logs/201601.log'
	}

	function getConfigValue(value){
		return config[value];
	}

	function getSysConfigValue(value){
		return sysConfig[value];
	}

	function makeOptions(urlstr, contentType){
		var urlObj = (url.parse(_addProtocal(urlstr)));

		var	options = {
			host: urlObj.hostname,
			port: urlObj.port || 80,
			path: urlObj.path,
			method: 'GET',
			agent: false,
			contentType: contentType || getSysConfigValue("contentTypes").html
		};

		return options;
	}

	function setConfig(_config){
		var deferred = Q.defer();

		config = _config;
		deferred.resolve(config);
		_makeDirectories();

		return deferred.promise;
	}

	function getRequest(category){
		// set the category for system wide retreival
		currentCategory = category;
		return makeOptions(getConfigValue("source").domain + _getPageTemplate(category.id), getSysConfigValue("contentTypes").json);
	}

	function getTodaysKey(){
		return parseInt(_getDateString(), 10);
	}

	function getYesterdaysKey(){
		return parseInt(_getDateString(Date.today().add(-1).days()), 10);
	}

	function getRawTable(){
		return _getRoot() + rawTable;
	}

	function getDiffTable(){
		return _getRoot() + diffTable;
	}

	function generateHashCode(s){
		return Math.abs(s.split("").reduce(function(a,b){a = ((a << 5) - a) + b.charCodeAt(0);return a & a;}, 0)); // jshint ignore:line
	}

	function getDynamoClient(){
		var localConfig = getConfigValue("aws");
		
		// AWS configuration
		AWS.config.update({
			region: localConfig.dynamo.region,
			endpoint: localConfig.dynamo.endpoint
		});

		var credentials = new AWS.SharedIniFileCredentials({profile: localConfig.profile});
		AWS.config.credentials = credentials;

		return new AWS.DynamoDB.DocumentClient();
	}

	// private methods
	function _init(){
		if (program.test){
			logger.log("warn", "Running in TEST mode.");
		}

		if (program.noimages){
			logger.log("warn", "Running in NO SAVE IMAGES mode.");
		}

		if (program.nosave){
			logger.log("warn", "Running in NO SAVE mode.");
		}

		if (program.init){
			logger.log("warn", "Running in INIT mode");
		}

		if (program.program){
			logger.log("warn", "Running in PROGRAM mode");
		}
	}

	function _getPageTemplate(id){
		return getConfigValue("source").pageUrlTemplate.replace(/( \*{3}) config\.category\.id (\*{3} )/, id);
	}

	function _getDateString(d){
		var date = d || new Date();
		return date.getFullYear().toString() + _pad(date.getMonth()+1) + _pad(date.getDate());
	}

	function _pad(date){
		return ("00" + date).slice(-2);
	}

	function _getRoot(){
		var root = currentCategory && currentCategory.name ? currentCategory.name : config.source.categories[0].name;
		return root;
	}

	function _makeDirectories(){
		var c = config.output.directories,
			testPrefix = "test";

		rawTable = program.test ? "_" + testPrefix  + c.rawTable : c.rawTable;
		storeTable = program.test ? "_" + testPrefix + c.storeTable : c.storeTable;
		diffTable = program.test ? "_" + testPrefix + c.diffTable : c.diffTable;
		imageDirectory = program.test ? "_" +  testPrefix + c.imageDirectory : c.imageDirectory;
		searchHostIndex = program.test ? "-" +  testPrefix + config.aws.ES.index : config.aws.ES.index;
	}

	function _addProtocal(url){
		if (/^http\:\/\//.test(url)){
			return url;
		} else {
			return "http://" + url;
		}
	}

	//exports
	exports.program = program;
	exports.setConfig = setConfig;
	exports.makeOptions = makeOptions;
	exports.getCategories = getCategories;
	exports.init = init;
	exports.logger = logger;
	exports.getConfigValue = getConfigValue;
	exports.getSysConfigValue = getSysConfigValue;
	exports.getTodaysKey = getTodaysKey;
	exports.getYesterdaysKey = getYesterdaysKey;
	exports.getRawTable = getRawTable;
	exports.getDiffTable = getDiffTable;
	exports.getRequest = getRequest;
	exports.generateHashCode = generateHashCode;
	exports.getDynamoClient = getDynamoClient;

	module.exports = exports;

	// process
	_init();

}());