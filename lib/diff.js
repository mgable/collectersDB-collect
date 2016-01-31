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
		
		console.info("makediff");
		console.info("Today's length is " + todaysRawData.length);
		
		_getData(dateStr).then(function(yesterdaysRawData){
			return _diff(todaysRawData, _.initial(todaysRawData) /* yesterdaysRawData */);
		}).then(function(diff){
			console.info("I have the diff");
			console.info("the diff is %s items", diff.length);
			deferred.resolve(diff);
		});

		return deferred.promise;
	}

	// private methods
	function _getData(){
		var yesterdayKey = parseInt(_getYesterdaysKey(),10),
			rawTable = util.getRawTable(),
			keys = [{date: yesterdayKey}];

		return util.getData(keys, rawTable).then(function(data){ //util.getFromDynamo
			return data[0].items;
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

		//TODO util.logger.log("diff - There are " + results.length + " new items added for " + dateStr);
		deferred.resolve(results);

		return deferred.promise;
	}

	exports.makeDiff = makeDiff;

	module.exports = exports;
})();