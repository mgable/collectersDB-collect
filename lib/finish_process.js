(function(){
	"use strict";

	var exports = {};

	//includes 
	var Q = require('q'),
		util = require('../bin/util.js');

	// asignments

	// public methods
	function finishProcess(category){
		var deferred = Q.defer();
		console.info("finish process on " + category);

		deferred.resolve("finishProcess: " + category);

		return deferred.promise;
	}

	// private methods
	function _init(){}

	// exports
	exports.finishProcess = finishProcess;

	module.exports = exports;

	// process
	_init();
	
}());