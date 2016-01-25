"use strict";

(function(){
	var util = require('./util.js'),
		parser = require('./parser.js'),
		requestObject = util.getRequestObject();

	function init(){
		// the meat of the matter
		util.fetchPage(requestObject).then(function(data){_process(data);});
	}

	function _process(data){
		var document = parser.parse(data);
		save(document);
	}

	function save(data){
		var filename = util.getFileName(),
			path = util.getRawDataPath(),
			file = path + filename;

		util.save(filename, path, file, data, util.config.contentType.json);
	}

	init();
})();