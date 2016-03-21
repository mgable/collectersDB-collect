(function(){
	"use strict";

	// includes
	var init = require('../bin/init.js'),
		//configuration = require('../lib/configuration.js'),
		util = require('../bin/util.js'),
		fs = require('fs');

	// assignments
	var configuration = JSON.parse(fs.readFileSync("../../boss/public/data/data.json", "UTF-8"));
	configuration.source.categories = [{"name": "fiesta","id": 650}];

	// the process
	//configuration.init().then(function(config){
		
		util.setConfig(configuration).then(function(){
			init.createTables().then(function(data){
				console.info("done!!!");
				console.info(data);
			});
		});

	//});
}());