/*
	use this tool to send a new index file to elasticsearch
*/

(function(){
	"use strict"

	// includes
	var make = require('../lib/make_index.js'),
		configuration = require('../lib/configuration.js'),
		util = require('../bin/util.js'),
		get = require('../bin/get.js'),
		fs = require('fs');

	// assignments

	// the process
	configuration.init().then(function(config){
		util.setConfig(config).then(function(){
			var todayKey = util.getYesterdaysKey(),
				table = util.getRawTable();

				console.info(todayKey);
				console.info(table);

			get.getBulkData(table, todayKey).then(function(diff){
				fs.writeFileSync(table + "_" + todayKey + ".json", JSON.stringify(diff));
			});
		});
	});

})();