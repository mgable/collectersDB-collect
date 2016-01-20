"use strict";

(function(){
	var system = "local",
		mode = "test",
		diffDirectory = "diffs/",
		rawDirectory = "raw/",
		storeDirectory = "store/";

	function getDiffDirectory(mode){
		return ((mode) ? mode + "/"  : "") + diffDirectory;
	}

	function getRawDirectory(mode){
		return ((mode) ? mode + "/"  : "") + rawDirectory;
	}

	function getStoreDirectory(mode){
		return ((mode) ? mode + "/"  : "") + storeDirectory;
	}


	module.exports = {
		system: system,
		diffDirectory: getDiffDirectory(mode),
		rawDirectory: getRawDirectory(mode),
		storeDirectory: getStoreDirectory(mode)
	};
})();