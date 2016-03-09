"use strict";

/*
	use this tool to send a new index file to elasticsearch
*/

(function(){
	// includes
	var make = require('../lib/make_index.js'),
		configuration = require('../lib/configuration.js'),
		util = require('../bin/util.js'),
		fs = require('fs');

	// assignments
	var items = JSON.parse(fs.readFileSync(__dirname + '/TEST.data.json', 'utf8')),
		host = "search-mgable-es-ht4qtiycv6v543iujwxk6q5n3u.us-west-2.es.amazonaws.com/",
		index = "test-collectorsdb";

	// the process
	configuration.init().then(function(config){
		util.setConfig(config).then(function(){
			make.makeIndex(items, index, host, true).then(function(data){
				console.info("done!!!");
			});
		});
	});

})();

//makeIndex(_diff, index, host, complete){