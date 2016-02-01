"use strict";

/*
	use this tool to send a new index file to elasticsearch
*/

(function(){
	// includes
	var make = require('../lib/make.js'),
		fs = require('fs');

	// assignments
	var items = JSON.parse(fs.readFileSync('./advertising_tins.json', 'utf8'));

	// the process
	make.makeIndex(items, null, true).then(function(data){
		console.info("done!!!");
	});

})();