(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q');

	// public methods
	function saveData(data){
		var deferred = Q.defer();

		console.info("saved data: " + data);
		deferred.resolve("saved data: " + data);

		return deferred.promise;
	}

	function saveDiff(data){
		var deferred = Q.defer();

		console.info("saved diff : " + data);
		deferred.resolve("saved diff: " + data);

		return deferred.promise;
	}

	function saveStore(diff){
		var deferred = Q.defer();

		console.info("saved store : " + diff);
		deferred.resolve("saved store: " + diff);

		return deferred.promise;
	}

	// exports
	exports.saveData = saveData;
	exports.saveDiff = saveDiff;
	exports.saveStore = saveStore;

	module.exports = exports;
}());