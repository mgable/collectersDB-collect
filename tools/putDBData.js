"use strict";
/*
	use this tool to import a json file into DynamoDB
*/
(function(){

	// includes
	var program = require('commander'),
		fs = require('fs'),
		_ = require("underscore"),
		//save = require('../bin/save.js'),
		save = require('../lib/save_data.js'),
		util = require('../bin/util.js'),
		Configuration = require('../lib/configuration.js');

	// program configuration
	program
		.version('0.0.1')
		.option('-t, --test', 'test mode')
		.parse(process.argv);

	// assignments
	var source = program.args[0] || './advertising_tin_raw_2016316.json',
		table = program.args[1] || 'advertising_tins_test_raw',
		items = JSON.parse(fs.readFileSync(source, 'utf8'));

	// the process
	Configuration.init().then(function(config){
		util.setConfig(config).then(function(){
			// save.saveBulkData(items, table).then(function(){
			// 	console.info("done!!!!");
			// 	deferred.resolve(diff);
			// })

			save.saveData(items).then(function(){
				console.info("done!!");
			});
		});
	});
	
})();