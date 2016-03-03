(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q'),
		util = require('../bin/util.js');

	// public methods
	function saveData(data){
		var deferred = Q.defer();

		if (!util.program.nosave){
			deferred.resolve("saved data: " + data);
		} else {
			deferred.resolve("NO DATA RAW SAVED: " + data);
		}

		return deferred.promise;
	}

	function saveDiff(data){
		var deferred = Q.defer();

		if (!util.program.nosave){
			deferred.resolve("saved diff: " + data);
		} else {
			deferred.resolve("NO DATA DIFF SAVED: " + data);
		}

		return deferred.promise;
	}

	function saveStore(diff){
		var deferred = Q.defer();

		if (!util.program.nosave){
			deferred.resolve("saved store: " + diff);
		} else {
			deferred.resolve("NO DATA STORE SAVED :" + diff);
		}

		return deferred.promise;
	}

	// exports
	exports.saveData = saveData;
	exports.saveDiff = saveDiff;
	exports.saveStore = saveStore;

	module.exports = exports;
}());