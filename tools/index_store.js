"use strict";
/*
	use this tool to import a json file into DynamoDB
*/
(function(){

	// includes
	var program = require('commander'),
		fs = require('fs'),
		_ = require("underscore"),
		save = require('../bin/save.js'),
		util = require('../bin/util.js'),
		Configuration = require('../lib/configuration.js');

	// program configuration
	program
		.version('0.0.1')
		.option('-t, --test', 'test mode')
		.parse(process.argv);

	// assignments
	var source = program.args[0] || './fiesta_test_store.json',
		table = program.args[1] || 'fiesta_store',
		items = JSON.parse(fs.readFileSync(source, 'utf8'));

	// the process
	Configuration.init().then(function(config){
		util.setConfig(config).then(function(){
			save.saveBulkData(items, table).then(function(){
				console.info("done!!!!");
				deferred.resolve(diff);
			})
		});
	});
	
})();