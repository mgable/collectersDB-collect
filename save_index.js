"use strict";

(function(){
	var program = require('commander'),
		_ = require('underscore'),
		util = require("./util.js");

	program
		.version('0.0.1')
		.option('-f, --full', 'make full index')
		.parse(process.argv);

	var	storeFilePath = util.getStoreFilePath(),
		storeFileName = util.getFileName(),
		storeFile = storeFilePath + storeFileName,
		store = util.getFileContents(storeFile) || [],
		diffFilePath = util.getDiffPath(),
		diffFile = diffFilePath + storeFileName,
		diff = util.getFileContents(diffFile) || [],
		index = makeIndex();

	saveIndex();

	function makeIndex(){
		return (program.full) ? fullIndex() : index();
	}
	
	function saveIndex(){
		util.save(storeFileName, storeFilePath, storeFile, JSON.stringify(index)); //filename, path, file, data, contentType
	}

	function index(){
		util.logger.log("making index");
		return store.concat(diff);
	}

	function fullIndex(){
		var results = [],
			diffDirectory = util.getDiffDirectory(),
			years = removeDotFiles(util.readDirectory(diffDirectory));


		// cycle through years
		years.forEach(function(year){
			var yearPath = diffDirectory + year + "/",
				months = removeDotFiles(util.readDirectory(yearPath));

			// cycle through months
			months.forEach(function(month){
				var monthPath = yearPath + month + "/",
					days = removeDotFiles(util.readDirectory(monthPath));

				// cycle through days
				days.forEach(function(day){
					var dayPath = monthPath + day + "/" + storeFileName;
					if (util.fileExists(dayPath)){
						var file = util.getFileContents(dayPath);
						results = results.concat(file);
					} 
				});
			});
		});

		util.logger.log("making FULL index");

		return results;
	}

	function removeDotFiles(data){
		return _.reject(data, function(name){ return /^\./.test(name);});
	}
})();