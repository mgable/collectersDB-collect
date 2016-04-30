// currently not used
// (function(){
// 	"use strict";

// 	var exports = {};

// 	//includes
// 	var Q = require('q'),
// 		fs = require('fs'),
// 		util = require('../bin/util.js'),
// 		fetch = require('../bin/fetch.js');

// 	// public methods
// 	function init(wait){
// 		setTimeout(() => _getRemoteConfiguation().then(response => {
// 			if (response.wait) {
// 				init(response.wait);
// 			} else {
// 				fs.writeFileSync(__dirname + "/../logs/clientLog.txt", JSON.stringify(response));
// 			}
// 		}), wait);
// 	}

// 	// private methods
// 	function _getRemoteConfiguation(){
// 		return fetch.fetchData(util.makeOptions(util.getSysConfigValue('boss'), util.getSysConfigValue("contentTypes").json)).then(_config => JSON.parse(_config));
// 	}

// 	init(0);

// 	// exports
// 	exports.init = init;

// 	module.exports = exports;
// }());
