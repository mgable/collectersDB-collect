"use strict";
/*
	use this tool to import a json file into DynamoDB
*/
(function(){

	// includes
	var program = require('commander'),
		fs = require('fs'),
		_ = require("underscore"),
		//save = require('../bin/save.js'), // bulk data save
		save = require('../lib/save_data.js'), // raw save
		util = require('../bin/util.js'),
		Configuration = require('../lib/configuration.js');

	// program configuration
	program
		.version('0.0.1')
		.option('-t, --test', 'test mode')
		.parse(process.argv);

	// assignments
	var source = './fiesta_raw_20160406.json',
		table = 'fiesta_raw',
		items = JSON.parse(fs.readFileSync(source, 'utf8'));

	// the process
	Configuration.init().then(function(config){
		util.setConfig(config).then(function(){
			// save.saveBulkData(items, table).then(function(){
			// 	console.info("done!!!!");
			// 	deferred.resolve(diff);
			// });
			var key = util.getYesterdaysKey();

			console.info(key);

			save.saveData(items, key).then(function(){
				console.info("done!!");
			});
		});
	});
	
})();