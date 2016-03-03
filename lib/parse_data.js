(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require("q");

	// public methods
	function parseData(data){
		var deferred = Q.defer();
		console.info("parsing data: " + data);
		deferred.resolve("parsing data: " + data);

		return deferred.promise;
	}

	// exports
	exports.parseData = parseData;

	module.exports = exports;
}());