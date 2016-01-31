"use strict";

(function(){
	// includes
	var util = require('./lib/util.js'),
		fetch = require('./lib/fetch.js'),
		parser = require('./lib/parser.js'),
		diff = require('./lib/diff.js'),
		save = require('./lib/save.js'),
		make = require('./lib/make.js'),
		
		// definitions
		fetchPage = fetch.fetchPage,
		parse = parser.parse,
		makeDiff = diff.makeDiff,
		fetchImageData = fetch.fetchImageData,
		saveStore = save.saveStore,
		saveRaw = save.saveRaw,
		fetchImages = fetch.fetchImages,
		makeIndex = make.makeIndex,
		getRequest = util.getRequest,

		//assignments
		categories = util.getCategories();

	// the process
	categories.forEach(function(category){
		fetchPage(getRequest(category)).then(parse).then(saveRaw).then(makeDiff).then(fetchImageData).then(saveStore).then(fetchImages); //.then(makeIndex);
	});

})();