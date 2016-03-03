(function(){
	"use strict";

	var exports = {};

	// includes - their's
	var program = require('commander'),
		Q = require('q'),
		AWS = require('aws-sdk'),
		url = require('url');

	// includes - mine
	var	logger = require('./log.js'),
		sysConfig = require('../config/config.js'),
		fetch = require('./fetch.js');

	// assignments
	var config;

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
		return _getConfiguation();
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

	function _getConfiguation(){
		return fetch.fetch(_makeOptions(sysConfig.boss), logger).then(function(_config){
			config = (JSON.parse(_config));
			return config;
		});
	}

	function _makeOptions(urlstr){
		var urlObj = (url.parse(urlstr));

		var	options = {
			host: urlObj.hostname,
			port: urlObj.port || 80,
			path: urlObj.path,
			method: 'GET',
			agent: false
		};

		return options;
	}

	function _getDateString(d){
		var date = d || new Date();
		return date.getFullYear().toString() + _pad(date.getMonth()+1) + _pad(date.getDate());
	}

	function _pad(date){
		return ("00" + date).slice(-2);
	}

	//exports
	exports.program = program;
	exports.getCategories = getCategories;
	exports.init = init;
	exports.logger = logger;

	module.exports = exports;

	// process
	_init();

}());