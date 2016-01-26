"use strict";
(function(){
	var _ = require("underscore"),
		Q = require("q"),
		util = require('./util.js'),
		fetch = require('./fetch_image_data.js');
		require('datejs');

	var	dateStr = process.argv[2] || util.getDateString(); // an optional date string e.g. '20151213' to retrieve historical data

	init(dateStr);

	function init(dateStr){
		getDataFromDynamo(dateStr);
	}

	function getDataFromDynamo(key){
		var todayKey = util.getDateString(),
			yesterdayKey = getYesterdaysKey(todayKey),
			rawTable = util.getRawTable(),
			diffTable = util.getDiffTable(),
			keys = [ {date: yesterdayKey},{date: todayKey}];

		util.getFromDynamo(keys, rawTable).then(function(data){
			var yesterday = data.Responses[rawTable][0].items,
				today = data.Responses[rawTable][1].items,
				diffItems = diff(today, yesterday);

			fetchImageData(diffItems, key).then(function(data){
				save(key, diffTable, data);
			});

		});
	}

	function fetchImageData(newest, key){
		// getting thunbnail data
		var imagePath = util.getImagePath(key),
			items = fetch.getThumbnailData(key, imagePath, newest);
		//getting additional images data
		return fetch.fetchAdditionalImageData(key, imagePath, items).then(function(data){
			console.info("done receiving data");
			return Q.all(data).then(function(data){
				console.info("TOTALLY DONE!!!!");
				return data;
			});
		});
	}

	function getYesterdaysKey(filename){
		if (!filename) {
			return util.getDateString(Date.today().add(-1).days()); 
		} else {

			var dateArray = filename.match(/(\d{4})(\d{2})(\d{2})/).splice(1).map(function(v){return parseInt(v,10);});
			dateArray.unshift(null);

			var	uncorrectedDate = new (Function.prototype.bind.apply(Date, dateArray)), // jshint ignore:line
				correctedDate = uncorrectedDate.last().month().add(-1).days(),
				yesterdaysDateStr = util.getDateString(correctedDate);

			return yesterdaysDateStr;
		}
	}

	function diff(today, yesterday){
		var results = [];
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

		util.logger.log("diff - There are " + results.length + " new items added for " + dateStr);
		return results;
	}

	function save(key, table, data){
		util.saveToDynamo(key, table, data); //key, table, data
	}
})();