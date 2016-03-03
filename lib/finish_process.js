(function(){
	"use strict";

	var exports = {};

	//includes 
	var Q = require('q'),
		util = require('../bin/util.js');

	// asignments

	// public methods
	function finishProcess(diff){
		var deferred = Q.defer();

		deferred.resolve("finishProcess: " + diff);

		console.info("finishProcess: " + diff);

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