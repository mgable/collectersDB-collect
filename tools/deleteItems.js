/*
	use this tool to send a new index file to elasticsearch
*/

(function(){
	"use strict"

	// includes
	var del = require('../bin/delete.js'),
		configuration = require('../lib/configuration.js'),
		util = require('../bin/util.js');

	// assignments

	// the process
	configuration.init().then(function(config){
		util.setConfig(config).then(function(){

			//store file
			var key = util.getYesterdaysKey(),
				table = util.getDiffTable();

				console.info(key);
				console.info(table);

			del.remove(table, key);

		});
	});

})();