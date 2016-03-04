(function(){
	"use strict";

	var exports = {};

	//includes
	var http = require('http'),
		Q = require('q'),
		util = require('./util.js');

	// public methods
	function fetchData(page, data){
		var deferred = Q.defer(),	
			container = "";

			var req = http.request(page, function(res) {
				res.setEncoding('utf8');

				res.on('data', function (chunk) {
					container += chunk;
				});

				res.on('end', function(){
					deferred.resolve(container);
				});

				res.on('error', function(error){
					util.logger.log("error", "Could Not Fetch Page: " + error, {filename: __filename, method: "fetch - res.on", page: page});
					deferred.reject(error);
				});
			});

		req.on('error', function(error) {
			util.logger.log("error", "Could Not Fetch Page: " + error, {filename: __filename, method: "fetch - req.on", page: page});
			deferred.reject(error);
		});

		// write data to request body
		if(data){
			req.write( data + '\n');
		}
		req.end();

		return deferred.promise;
	}

	//exports
	exports.fetchData = fetchData;

	module.exports = exports;
}());