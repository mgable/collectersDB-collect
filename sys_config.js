"use strict";

(function(){
	var system = "aws",
		mode = false,
		diffDirectory = "_diffs",
		rawDirectory = "_raw",
		storeDirectory = "store/",
		indexDirectory  = "index/";

	function getDirectory(mode, directory){
		return ((mode) ? mode + "/"  : "") + directory;
	}

	module.exports = {
		system: system,
		diffDirectory: getDirectory(mode, diffDirectory),
		rawDirectory: getDirectory(mode, rawDirectory),
		storeDirectory: getDirectory(mode, storeDirectory),
		indexDirectory: getDirectory(mode, indexDirectory)
	};
})();