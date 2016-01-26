"use strict";
(function(){
	var _ = require("underscore"),
		Q = require("q"),
		util = require('./util.js'),
		fetch = require('./fetch_image_data.js');
		require('datejs');

	var	dateStr = process.argv[2] || util.getDateString(), // an optional date string e.g. '20151213' to retrieve historical data
		key = dateStr,
		// make all paths
		rawDataPath = util.getRawDataPath(dateStr), // path to raw data (today or historical)
		storeFilePath = util.getStoreFilePath(), //config.dataRoot + category + '/store/' ,
		storeFileName = util.getFileName(),
		storeFile =  storeFilePath + storeFileName,
		imagePath = util.getImagePath(dateStr), //storeFilePath + "/images/" +  dateStr,
		diffPath = util.getDiffPath(dateStr), //config.dataRoot + category + '/diffs/' + dateStr ,
		diffFile = diffPath + storeFileName;
		//util.logger.log("generating diffs: " + util.getPageTemplate(config.category.id));

	getData();

	function getData(){
		//getDataFromLocal();
		//getDataFromS3();
		getDataFromDynamo();
	}

	// function getDataFromLocal(){
	// 	// get data for today and yesterday
	// 	var todayPath = rawDataPath + storeFileName,
	// 		yesterdayPath = getYesterdayFileName(dateStr),
	// 		today = util.getFileContents(todayPath),
	// 		yesterday = util.getFileContents(yesterdayPath) || [],

	// 		// get existing information
	// 		store = util.getFileContents(storeFile) || [];

	// 	fetchImageData(diff(today, yesterday)).then(function(data){
	// 		save(store, data);
	// 	});
	// }

	function getDataFromDynamo(){

		var todayKey = util.getDateString(),
			yesterdayKey = getYesterdayFileName(todayKey),
			rawTable = util.getRawDirectory(),
			diffTable = util.getDiffDirectory(),
			keys = [ {date: yesterdayKey},{date: todayKey}];



		util.getFromDynamo(keys, rawTable).then(function(data){
			console.info("got both raw files");
			var yesterday = data.Responses[rawTable][0].items,
				today = data.Responses[rawTable][1].items,
				diffItems = diff(today, yesterday);
			console.info("there are " + diffItems.length + " new items");

			save(key, diffTable, diffItems);

			// fetchImageData(diffItems).then(function(data){
				
			// });

		});
	}

/* START- AWS S3 */
	// function getDataFromS3(){
	// 	var todayPath = rawDataPath + storeFileName,
	// 		yesterdayPath = getYesterdayFileName(dateStr);

	// 		// console.info(todayPath);
	// 		// console.info(yesterdayPath);
	// 		// console.info(storeFile);

	// 	var todayPromise = util.getDataFromS3(todayPath).then(parse),
	// 		yesterdayPromise = util.getDataFromS3(yesterdayPath).then(parse);

	// 	Q.allSettled([todayPromise, yesterdayPromise]).then(function(data){
	// 		var today = data[0].value,
	// 			yesterday = data[1].value || [];

	// 		fetchImageData(diff(today, yesterday)).then(function(data){
	// 			save(data);
	// 		});
	// 	});
	// }

	// function parse(data){
	// 	var results = JSON.parse(data.toString());
	// 	return results;
	// }

/* END- AWS S3 */

	function fetchImageData(newest){
		console.info(newest.length);
		// getting thunbnail data
		var items = fetch.getThumbnailData(dateStr, imagePath, newest);
		//getting additional images data
		return fetch.fetchAdditionalImageData(dateStr, imagePath, items).then(function(data){
			console.info("done receiving data");
			return Q.all(data).then(function(data){
				console.info("TOTALLY DONE!!!!");
				return data;
			});
		});
	}

	function getYesterdayFileName(filename){
		if (!filename) {
			var yesterday = util.getDateString(Date.today().add(-1).days());
			return util.getRawDataPath(yesterday) +  storeFileName;
		} else {

			var dateArray = filename.match(/(\d{4})(\d{2})(\d{2})/).splice(1).map(function(v){return parseInt(v,10);});
			dateArray.unshift(null);

			var	uncorrectedDate = new (Function.prototype.bind.apply(Date, dateArray)), // jshint ignore:line
				correctedDate = uncorrectedDate.last().month().add(-1).days(),
				dateStr = util.getDateString(correctedDate);

			return (dateStr);
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
		//util.save(storeFileName, diffPath, diffFile, JSON.stringify(data), util.config.contentType.json);
	}
})();