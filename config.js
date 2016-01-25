"use strict";

(function(){
	var sys_config = require('./sys_config.js');

	var category = {name: "advertising_tins", id: 1175},
		categories = [category],
		domain = 'www.collectorsweekly.com',
		pageUrlTemplate = '/ajax/category-auctions.php?id= *** config.category.id *** &sort=completed&limit=1000&offset=0',
		dataRoot = "/Users/markgable/Sites/data/collectorsDB/",
		local = {},
		aws = {},
		contentType = {
			"json": "application/json; charset=UTF-8",
			"jpg": "image/jpeg"
		};
	
	local.dataRoot = dataRoot;
	aws.bucket = "collectors-db";


	module.exports = {
		category: category,
		categories: categories,
		sys_config: sys_config,
		domain: domain,
		pageUrlTemplate: pageUrlTemplate,
		local: local,
		aws: aws,
		contentType: contentType
	};

})();