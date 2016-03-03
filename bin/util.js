(function(){
	"use strict";

	var exports = {};

	// includes
	var program = require('commander'),
		Q = require('q'),
		AWS = require('aws-sdk'),
		url = require('url'),
		logger = require('./log.js'),
		config = require('../config/config.js');

	// program configuration
	program
		.version('0.0.1')
		.option('-t, --test', 'test mode')
		.option('-m, --noimages', 'do not download images')
		.option('-i, --init', 'initalize new indexes')
		.option('-x, --nosave', 'do not save or index') // not implemented
		.parse(process.argv);

	// public methods
	function getConfiguation(){
		var deferred = Q.defer();

		deferred.resolve(["advertising_tins"]);

		return deferred.promise;
	}

	// private methods
	function _init(){

		//logger.addLogFile(getDateString()); //'./logs/201601.log'

		if (program.test){
			logger.log("warn", "Running in TEST MODE!!!");
		}
	}

	//exports
	exports.program = program;
	exports.getConfiguation = getConfiguation;

	module.exports = exports;

	// process
	_init();

}());