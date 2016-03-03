(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require("q");

	// public methods
	function parseData(data){
		var deferred = Q.defer();
		deferred.resolve("parsing data: " + data);

		return deferred.promise;
	}

	// exports
	exports.parseData = parseData;

	module.exports = exports;
}());