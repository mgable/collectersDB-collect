"use strict";

/*
	use this tool to send a new index file to elasticsearch
*/

(function(){
	// includes
	var make = require('../lib/make.js'),
		fs = require('fs');

	// assignments
	var items = JSON.parse(fs.readFileSync(__dirname + '/TEST.data.json', 'utf8')),
		index = "collectorsdb";

	// the process
	make.makeIndex(items, index, true).then(function(data){
		console.info("done!!!");
	});

})();