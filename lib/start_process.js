(function(){
	"use strict";

	var exports = {};

	//includes 
	var Q = require('q'),
		util = require('../bin/util.js');

	// asignments

	// public methods
	function startProcess(category){
		var deferred = Q.defer();
		console.info("starting process on " + category);

		deferred.resolve("startProcess: " + category);

		return deferred.promise;
	}

	// private methods
	function _init(){}

	// exports
	exports.startProcess = startProcess;

	module.exports = exports;

	// process
	_init();
	
}());