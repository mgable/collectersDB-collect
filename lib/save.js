"use strict";

(function(){
	var exports = {};

	var Q = require("q");

	function saveStore(data){
		var deferred = Q.defer();
		console.info("save: ");
		deferred.resolve(data);

		return deferred.promise;
	}

	exports.saveStore = saveStore;

	module.exports = exports;
})();