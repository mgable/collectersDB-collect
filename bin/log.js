"use strict";
(function(){
	var exports = {};

	// includes
	var winston = require('winston'),
		Q = require('q');

	// assignments
	winston.level = 'debug';

	// public methods
	function addLogFile(filename){
		console.info("adding log file " + filename);
		var infoFile = __dirname + '/../logs/' + filename + "-info.log",
			errorFile = __dirname + '/../logs/' + filename + "-error.log",
			verboseFile  = __dirname + '/../logs/' + filename + "-verbose.log";

		winston.add(winston.transports.File, { filename: errorFile, name:"error_file", level: 'error'});
		winston.add(winston.transports.File, { filename: infoFile, name:"info_file", level: 'info'});
		winston.add(winston.transports.File, { filename: verboseFile, name:"verbose_file", level: 'verbose'});
	}

	function log(type, message, meta){
		winston.log(type, message, meta || {});
	}

	function report(){
		var deferred = Q.defer(),
			options = {
			from:   new Date - (24 * 60 * 60 * 1000) * 2,
			until:  new Date,
			limit:  10000,
			start:  0,
			order:  'asc',
			//fields: ['message', 'meta']
		};

		winston.query(options, function (err, result) {
			if (err) {
				console.info("error");
				deferred.reject(err);
			} else {
				deferred.resolve(_parse(result));
			}
		});

		return deferred.promise;
	}

	//private methods
	function _parse(report){
		return report;
	}

	exports.addLogFile = addLogFile;
	exports.report = report;
	exports.log = log;

	module.exports = exports;
})();