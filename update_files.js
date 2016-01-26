// "use strict";

// // THIS DOES NOT WORK!!!
// // ONLY HERE FOR EXAMPLES

// (function(){
// 	var program = require('commander'),
// 		fs = require('fs'),
// 		_ = require('underscore'),
// 		util = require("./util.js");

// 	program
// 		.version('0.0.1')
// 		.option('-f, --full', 'make full index')
// 		.parse(process.argv);

// 	var	storeFilePath = util.getStoreFilePath(),
// 		storeFileName = util.getFileName(),
// 		storeFile = storeFilePath + storeFileName,
// 		store = util.getFileContents(storeFile) || [],
// 		diffFilePath = util.getDiffPath(),
// 		diffFile = diffFilePath + storeFileName,
// 		diff = util.getFileContents(diffFile) || [];
// 		//index = makeIndex();

// 	//saveIndex();

// 	// function makeIndex(){
// 	// 	return (program.full) ? fullIndex() : simpleIndex();
// 	// }
	
// 	// function saveIndex(){
// 	// 	util.save(storeFileName, storeFilePath, storeFile, JSON.stringify(index)); //filename, path, file, data, contentType
// 	// }

// 	function simpleIndex(){
// 		util.logger.log("making index");
// 		return store.concat(diff);
// 	}

// 	function fullIndex(){
// 		var results = [],
// 			diffDirectory = util.getRawDirectory(),
// 			years = removeDotFiles(util.readDirectory(diffDirectory));


// 		// cycle through years
// 		years.forEach(function(year){
// 			var yearPath = diffDirectory + year + "/",
// 				yearSuffix = year,
// 				months = removeDotFiles(util.readDirectory(yearPath));

// 			// cycle through months
// 			months.forEach(function(month){
// 				var monthSuffix = yearSuffix + month;
// 				var monthPath = yearPath + month + "/",
// 					days = removeDotFiles(util.readDirectory(monthPath));

// 				// cycle through days
// 				days.forEach(function(day){
// 					var daySuffix = monthSuffix + day;
// 					var dayFileOld = monthPath + day + "/advertising_tins_" + daySuffix + ".json";
// 					var dayFileNew = monthPath + day + "/advertising_tins.json";
// 					if (util.fileExists(dayFileOld)){
// 						// console.info("ranaming " + dayFileOld );
// 						// console.info(dayFileNew);

// 						fs.renameSync(dayFileOld, dayFileNew);
// 						// var file = util.getFileContents(dayPath);
// 						// results = results.concat(file);
// 					} else {
// 						console.info("file " + dayFileOld + " does NOT exist");
// 					}
// 				});
// 			});
// 		});

// 		util.logger.log("making FULL index");

// 		return results;
// 	}

// 	function removeDotFiles(data){
// 		return _.reject(data, function(name){ return /^\./.test(name);});
// 	}
// })();