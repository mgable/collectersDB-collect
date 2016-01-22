"use strict";

(function(){
	var program = require('commander'),
		_ = require('underscore'),
		Q = require("q"),
		util = require("./util.js");

	program
		.version('0.0.1')
		.option('-f, --full', 'make full index')
		.parse(process.argv);

	var	storeFilePath = util.getStoreFilePath(),
		storeFileName = util.getFileName(),
		storeFile = storeFilePath + storeFileName,
		// store = util.getFileContents(storeFile) || [],
		diffFilePath = util.getDiffPath(),
		diffFile = diffFilePath + storeFileName,
		// diff = util.getFileContents(diffFile) || [],
		diff = [],
		store = [];


	getData()

	function getData(){
		getDataFromS3();
	}

	function getDataFromS3(){
		var diffPromise = util.getDataFromS3(diffFile).then(parse),
			storePromise = util.getDataFromS3(storeFile).then(parse);

		Q.allSettled([diffPromise, storePromise]).then(function(data){
			diff = data[0].value,
			store = data[1].value || [];

			save(makeIndex());
		});
	}

	function parse(data){
		var results = JSON.parse(data.toString());
		return results;
	}

	function makeIndex(){
		return (program.full) ? fullIndex() : simpleIndex();
	}
	
	function save(data){
		util.save(storeFileName, storeFilePath, storeFile, JSON.stringify(data), util.config.contentType.json); //filename, path, file, data, contentType
	}

	function simpleIndex(){
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