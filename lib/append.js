"use strict";

(function(){
	var exports = {};

	var Q = require("q");

	function appendItems(data){
		var deferred = Q.defer();
		console.info("appending data to  elastic search");
		//console.info(data);
		deferred.resolve(data);

		return deferred.promise;
	}

	exports.appendItems = appendItems;

	module.exports = exports;
})();