"use strict";

/*
	use this tool to send a new index file to elasticsearch
*/

(function(){
	// includes
	var make = require('../lib/make.js'),
		fs = require('fs');

	// assignments
	var items = JSON.parse(fs.readFileSync(__dirname + '/advertising_tins_store.json', 'utf8')),
		host = "http://search-collectors-db-k6k76eedtz272dx3t5eqsmo2wq.us-west-1.es.amazonaws.com/",
		index = "collectorsdb";

	// the process
	make.makeIndex(items, index, true, host).then(function(data){
		console.info("done!!!");
	});

})();