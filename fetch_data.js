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
		var key = util.getDateString(),
			table = util.getRawDirectory();


		console.info(table, key)

		util.saveToDynamo(key, table, data); //key, table, data
	}

	init();
})();