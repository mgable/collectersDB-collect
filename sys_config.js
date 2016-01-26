"use strict";

(function(){
	var system = "aws",
		mode = false,
		diffTable = "_diffs",
		rawTable = "_raw",
		storeTable = "_store",
		indexDirectory  = "formatted/",
		imageDirectory = "store/images/";

	function getDirectory(mode, directory){
		return ((mode) ? mode + "/"  : "") + directory;
	}

	module.exports = {
		system: system,
		diffTable: getDirectory(mode, diffTable),
		rawTable: getDirectory(mode, rawTable),
		storeDirectory: getDirectory(mode, storeTable),
		indexDirectory: getDirectory(mode, indexDirectory),
		imageDirectory: getDirectory(mode, imageDirectory)
	};
})();