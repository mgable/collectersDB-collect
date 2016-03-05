(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q'),
		diff = require('../bin/diff.js');

	// public methods
	function makeDiff(items){
		var deferred = Q.defer();

		deferred.resolve(diff.makeDiff(items));

		return deferred.promise;
	}

	// exports
	exports.makeDiff = makeDiff;

	module.exports = exports;
}());