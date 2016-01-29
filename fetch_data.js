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
		var key = parseInt(util.getDateString(),10),
			table = util.getRawTable();

		util.saveToDynamo(key, table, data); //key, table, data
	}

	init();
})();