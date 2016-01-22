"use strict";
(function() {
	var util = require('./util.js'),
		storeFilePath = util.getStoreFilePath(),
		storeFileName = util.getFileName(),
		storeFile = storeFilePath + storeFileName;

	getStoreFile(storeFile).then(function(items){
		save(makeIndex(items));
	});

	function getStoreFile(storeFile){
		return util.getDataFromS3(storeFile).then(parse);
	}

	function parse(data){
		var results = JSON.parse(data.toString());
		return results;
	}

	function makeIndex(line){
		var results = '';

		if (typeof line === "object"){
			line.forEach(function(value, index){
				var str = JSON.stringify({"index":{"_id": (index + 1)}});
				results += str + "\n" + JSON.stringify(value) + "\n";
			});

			return results;
		}

		return line;
	}

	function save(data){
		var path = util.getFormattedFilePath(),
			formattedFileName = util.getFileName("formatted.json"),
			file = path + formattedFileName;

		util.save(formattedFileName, path, file, data, util.config.contentType.json); //filename, path, file, data, contentType
		util.logger.log("saving bulk import file: " + file);
	}
})();