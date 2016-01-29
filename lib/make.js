"use strict";

(function(){
	var exports = {};

	var Q = require("q");

	function makeIndex(data){
		var deferred = Q.defer();
		console.info("makeIndex ");
		//console.info(data);
		deferred.resolve(data);

		return deferred.promise;
	}

	exports.makeIndex = makeIndex;

	module.exports = exports;
})();