(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q'),
		util = require('../bin/util.js');

	// public methods
	function makeIndex(diff){
		var deferred = Q.defer();

		if (!util.program.nosave){
			deferred.resolve("make index: " + diff);
		} else {
			deferred.resolve("NOT MAKING INDEX:" + diff);
		}

		return deferred.promise;
	}

	//exports
	exports.makeIndex = makeIndex;

	module.exports = exports;
}());