(function(){
	"use strict";

	var exports = {};

	//includes
	var Q = require('q'),
		fs = require('fs'),
		util = require('../bin/util.js'),
		fetch = require('../bin/fetch.js');

	// public methods
	function init(){
		var deferred = Q.defer(),
			file = util.program.File;

		if (file){
			util.logger.log("info", "reading configuration from file", {file});
			let config = fs.readFileSync(file, "UTF-8");
			deferred.resolve(JSON.parse(config));
		} else {
			util.logger.log("info", "getting remote configuation");
			_getRemoteConfiguation().then(function(response){
				deferred.resolve(response);
			});
		}

		return deferred.promise;
	}

	// private methods
	function _getRemoteConfiguation(){
		return fetch.fetchData(util.makeOptions(util.getSysConfigValue('boss'), util.getSysConfigValue("contentTypes").json)).then(_config => JSON.parse(_config));
	}

	// exports
	exports.init = init;

	module.exports = exports;
}());
