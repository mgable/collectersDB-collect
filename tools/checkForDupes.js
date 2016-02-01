"use strict";
/*
	use this tool to check a json index file for duplicate entries
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
	var source = program.args[0] || '/Users/markgable/Sites/experiments/node-es/advertising_tins_store_20160201.json',
		items = JSON.parse(fs.readFileSync(source, 'utf8')),
		links = _.pluck(items, "link"),
		uniques = _.uniq(links)

	// the process
	console.info("items length is %s", items.length);
	console.info("links length is %s", links.length);
	console.info("uniques length is %s", uniques.length);


})();