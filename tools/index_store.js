"use strict";
/*
	use this tool to import a json file into DynamoDB
*/
(function(){

	// includes
	var program = require('commander'),
		save = require('../lib/save.js'),
		fs = require('fs'),
		_ = require("underscore");

	// program configuration
	program
		.version('0.0.1')
		.option('-t, --test', 'test mode')
		.parse(process.argv);

	// assignments
	var source = program.args[0] || './advertising_tins_store.json',
		table = program.args[1] || 'advertising_tins_store',
		items = JSON.parse(fs.readFileSync(source, 'utf8'));

	// the process
	save.saveStore(items, table).then(function(data){
		console.info("done");
	})

})();