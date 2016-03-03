(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q');

	// public methods
	function makeIndex(diff){
		var deferred = Q.defer();

		console.info("make index: " + diff);
		deferred.resolve("make index: " + diff);

		return deferred.promise;
	}

	//exports
	exports.makeIndex = makeIndex;

	module.exports = exports;
}());