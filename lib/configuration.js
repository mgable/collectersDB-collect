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
			config;

		if (util.program.File){
			console.info(util.program.File);
			config = fs.readFileSync(util.program.File, "UTF-8");
			deferred.resolve(JSON.parse(config));
		} else {
			_getRemoteConfiguation().then(function(response){
				deferred.resolve(response);
			});
		}

		return deferred.promise;
	}

	// private methods
	function _getRemoteConfiguation(){
		return fetch.fetchData(util.makeOptions(util.getSysConfigValue('boss'), util.getSysConfigValue("contentTypes").json)).then(function(_config){
			return (JSON.parse(_config));
		});
	}

	// exports
	exports.init = init;

	module.exports = exports;
}());
