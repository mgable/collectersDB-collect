"use strict";
(function(){
	var winston = require('winston'),
		logger = {};

	winston.level = 'debug';

	function addLogFile(filename){
		console.info("adding log file " + filename);
		var infoFile = __dirname + '/../logs/' + filename + "-info.log",
			errorFile = __dirname + '/../logs/' + filename + "-error.log";

		winston.add(winston.transports.File, { filename: errorFile, name:"error file", level: 'error' });
		winston.add(winston.transports.File, { filename: infoFile, name:"info file", level: 'info' });
	}

	function log(message, type){
		var type = type || 'info'; // jshint ignore:line
		winston.log(type, message);
	}


	logger.addLogFile = addLogFile;
	logger.log = log;

	module.exports = logger;
})();