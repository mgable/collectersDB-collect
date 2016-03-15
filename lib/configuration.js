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
		var config = false;
		if (util.program.args[0]){
			config = fs.readFileSync(util.program.args[0], "UTF-8");
		}

		return _getRemoteConfiguation(config);
	}

	// private methods
	function _getRemoteConfiguation(config){
		if (config){
			var deferred = Q.defer();
			deferred.resolve(JSON.parse(config));
			return deferred.promise;
		};

		return fetch.fetchData(util.makeOptions(util.getSysConfigValue('boss'), util.getSysConfigValue("contentTypes").json)).then(function(_config){
			return (JSON.parse(_config));
		});
	}

	// exports
	exports.init = init;

	module.exports = exports;
}());
