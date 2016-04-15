(function(){
	"use strict";
	
	var exports = {};

	// includes
	var Q = require("q"),
		_ = require("underscore"),
		get = require('./get.js'),
		util = require('./util.js'),
		save = require('../lib/save_data.js');

	// public methods
	function makeDiff(items){
		util.logger.log("info", "Starting Diff", {itemCount: items.length});
		var deferred = Q.defer(),
			todayKey = util.getTodaysKey(),
			diffTable = util.getDiffTable();

		_getBulkData(diffTable, todayKey).then(function(data){
			if (data){// there is a diff file
				save.setDiffSaved(true);
				deferred.resolve(data);
				util.logger.log("warn", "Existing Diff file - Skipping");
			} else { // no diff file
				util.logger.log("verbose", "no saved diff file for today");
				var yesterdayKey = util.getYesterdaysKey(),
					rawTable = util.getRawTable(),
					keys = [{date: yesterdayKey}];
				 _getData(rawTable, keys).then(function(yesterdaysRawData){
				 	util.logger.log("verbose", "got yesterdays raw data");
				 	if(!yesterdaysRawData){ // no raw data from yesterday
				 		util.logger.log("verbose", "no raw file from yesterday");
				 		if (util.program.init){ // if init flag is set pass in an empty array to start store
				 			util.logger.log("info", "Creating new index");
				 			return items;
				 		} else {
				 			util.logger.log("error", "Can not find yesterdays raw data", {file: __filename, method: "makeDiff", todayKey: todayKey});
				 			util.logger.log("error", "No initialization flag so no new index");
				 			util.logger.log("error", "NOT CONTINUING");
				 			deferred.reject(false);
				 		}
				 	} else {
						return _diff(items, yesterdaysRawData ); // _.initial(items, 50)
					}
				}).then(function(diff){
					if(diff){
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
		return get.getData(keys, table).then(function(data){
			return (data[0] && data[0].items) ? data[0].items : false;
		});
	}

	function _getBulkData(table, keys){
		return get.getBulkData(table, keys).then(function(diff){
			return diff && diff.length ? diff : false;
		});
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

		util.logger.log("info", "Create diff file", {itemCount: results.length});
		deferred.resolve(results);

		return deferred.promise;
	}

	exports.makeDiff = makeDiff;

	module.exports = exports;
})();