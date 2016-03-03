(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q');

	// public methods
	function makeDiff(data){
		var deferred = Q.defer();

		console.info("make diff: " + data);
		deferred.resolve("make diff: " + data);

		return deferred.promise;
	}

	// exports
	exports.makeDiff = makeDiff;

	module.exports = exports;
}());