"use strict";

(function(){
	var exports = {};

	// includes
	var Q = require("q"),
		_ = require("underscore"),
		save = require('./save.js'),
		util = require('./util.js');

		// extends date prototype
		require('datejs');

	// public methods
	function makeDiff(todaysRawData){
		util.logger.log("info", "Starting Diff", {rawItemCount: todaysRawData.length});
		var deferred = Q.defer(),
			todayKey = parseInt(util.getDateString(),10),
			diffTable = util.getDiffTable(),
			keys = [{date: todayKey}];

		_getData(diffTable, keys).then(function(data){
			if (data){// there is a diff file
				deferred.resolve(data);
				util.logger.log("warn", "Existing Diff file - Skipping");
			} else { // no diff file
				console.info("no saved diff file for today");
				var yesterdayKey = parseInt(_getYesterdaysKey(),10),
					rawTable = util.getRawTable(),
					keys = [{date: yesterdayKey}];
				 _getData(rawTable, keys).then(function(yesterdaysRawData){
				 	console.info("got yesterdays raw data");
				 	if(!yesterdaysRawData){ // no raw data from yesterday
				 		console.error("no raw file from yesterday");
				 		if (util.program.init){ // if init flag is set pass in an empty array to start store
				 			util.logger.log("info", "Creating new index");
				 			return _diff(todaysRawData, []);
				 		} else {
				 			util.logger.log("error", "Can not find yesterdays raw data", {file: __filename, method: "makeDiff", todayKey: todayKey});
				 			deferred.reject(false);
				 		}
				 	} else {
						return _diff(todaysRawData, yesterdaysRawData ); // _.initial(todaysRawData, 50)
					}
				}).then(function(diff){
					if(diff){
						save.saveDiff(diff);
						deferred.resolve(diff);
					} else {
						deferred.reject(false);
					}
				});
			}
		});
		
		return deferred.promise;
	}

	// private methods
	function _getData(table, keys){
		return util.getData(keys, table).then(function(data){
			return (data[0] && data[0].items) ? data[0].items : false;
		});
	}

	function _getYesterdaysKey(){
		return util.getDateString(Date.today().add(-1).days());
	}

	function _diff(today, yesterday){
		var deferred = Q.defer(),
			results = [];
		top:
		for (var a = 0; a < today.length; a++){
			var current = today[a];
			for (var b = 0; b < yesterday.length; b++){
				var compare = yesterday[b];
				if (_.isEqual(current.link, compare.link)){
					yesterday.splice(b,1);
					continue top;
				}
			}
			results.push(current);
		}

		util.logger.log("info", "Create diff file", {itemCount: results.length, key: util.getDateString()});
		deferred.resolve(results);

		return deferred.promise;
	}

	exports.makeDiff = makeDiff;

	module.exports = exports;
})();