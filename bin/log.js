"use strict";
(function(){
	var exports = {};

	// includes
	var winston = require('winston');

	// assignments
	winston.level = 'debug';

	// public methods
	function addLogFile(filename){
		console.info("adding log file " + filename);
		var infoFile = __dirname + '/../logs/' + filename + "-info.log",
			errorFile = __dirname + '/../logs/' + filename + "-error.log";

		winston.add(winston.transports.File, { filename: errorFile, name:"error file", level: 'error' });
		winston.add(winston.transports.File, { filename: infoFile, name:"info file", level: 'info' });
	}

	function log(type, message, meta){
		winston.log(type, message, meta || "");
	}

	exports.addLogFile = addLogFile;
	exports.log = log;

	module.exports = exports;
})();