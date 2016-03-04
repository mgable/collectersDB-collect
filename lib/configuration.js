(function(){
	"use strict";

	var exports = {};

	//includes
	var util = require('../bin/util.js'),
		fetch = require('../bin/fetch.js');

	// public methods
	function init(){
		return _getRemoteConfiguation();
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
