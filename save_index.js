"use strict";
(function() {
	var util = require('./util.js'),
		storeFilePath = util.getStoreFilePath(),
		storeFileName = util.getFileName(),
		storeFile = storeFilePath + storeFileName,
		document = util.getFileContents(storeFile);

	save(parse(document));

	function parse(line){
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

		util.save(formattedFileName, path, file, data ); //filename, path, file, data, contentType
		util.logger.log("saving bulk import file: " + file);
	}
})();