"use strict";

(function(){
	var exports = {};

	// includes
	var Q = require("q"),
		_ = require('underscore'),
		parser = require('../bin/parse.js'),
		util = require('../bin/util.js');

	// public methods
	function parseData(data){
		var deferred = Q.defer();
		if (_isParsed(data)){
			util.logger.log("warn", "existing raw file: no parsing necessary - skipping");
			deferred.resolve(data);
		} else {
			util.logger.log("info", "Parsing Data");
			deferred.resolve(parser.parse(data));
		}

		return deferred.promise;
	}

	// private methods
	function _isParsed(data){
		return (_.isArray(data)) ? true : false;
	}

	// exports
	exports.parseData = parseData;

	module.exports = exports;
}());