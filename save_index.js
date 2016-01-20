"use strict";

(function(){
	var util = require("./util.js");

	var	storeFilePath = util.getStoreFilePath(),
		storeFileName = util.getFileName(),
		storeFile = storeFilePath + storeFileName,
		store = util.getFileContents(storeFile) || [],
		diffFilePath = util.getDiffPath(),
		diffFile = diffFilePath + storeFileName,
		diff = util.getFileContents(diffFile) || [],
		index = store.concat(diff);

	util.save(storeFileName, storeFilePath, storeFile, JSON.stringify(index)); //filename, path, file, data, contentType
})();