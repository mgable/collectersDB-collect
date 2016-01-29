"use strict";

(function(){
	var exports = {};

	// includes
	var Q = require("q"),
		_ = require("underscore"),
		util = require('./util.js');

		// extends date prototype
		require('datejs');

	// assignments
	var	dateStr = util.getDateString();

	// public methods
	function makeDiff(todaysRawData){
		var deferred = Q.defer();

		console.info(todaysRawData.length);

		console.info("makediff");

		_getData(dateStr).then(function(yesterdaysRawData){
			return _diff(todaysRawData, yesterdaysRawData);
		}).then(function(diff){
			deferred.resolve(diff);
		});

		return deferred.promise;
	}

	// private methods
	function _getData(key){
		var yesterdayKey = parseInt(_getYesterdaysKey(key),10),
			rawTable = util.getRawTable(),
			keys = [{date: yesterdayKey}];

		return util.getData(keys, rawTable).then(function(data){ //util.getFromDynamo
			return data[0].items;
		});
	}

	function _getYesterdaysKey(filename){
		var dateArray = filename.match(/(\d{4})(\d{2})(\d{2})/).splice(1).map(function(v){return parseInt(v,10);});
		dateArray.unshift(null);

		var	uncorrectedDate = new (Function.prototype.bind.apply(Date, dateArray)), // jshint ignore:line
			correctedDate = uncorrectedDate.last().month().add(-1).days(),
			yesterdaysDateStr = util.getDateString(correctedDate);

		return parseInt(yesterdaysDateStr,10);
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

		//TODO util.logger.log("diff - There are " + results.length + " new items added for " + dateStr);
		deferred.resolve(results);

		return deferred.promise;
	}

	exports.makeDiff = makeDiff;

	module.exports = exports;
})();