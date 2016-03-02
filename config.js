"use strict";

(function(){
	var sys_config = require('./sys_config.js');

	var category = {name: "advertising_tins", id: 1175},
		categories = [category],
		domain = 'www.collectorsweekly.com',
		pageUrlTemplate = '/ajax/category-auctions.php?id= *** config.category.id *** &sort=completed&limit=1000&offset=0',
<<<<<<< HEAD
=======
		dataRoot = "/Users/markgable/Sites/data/TEST-collectorsDB/",
		local = {},
>>>>>>> 7cc7870d2f9958f66e66df217a1dd5b06116a12d
		aws = {},
		contentType = {
			"json": "application/json; charset=UTF-8",
			"jpg": "image/jpeg"
		};

	aws.bucket = "a-collectors-db";
	aws.region = "us-west-2";
    aws.dynamo = {endpoint: "http://localhost:8000"};

	module.exports = {
		category: category,
		categories: categories,
		sys_config: sys_config,
		domain: domain,
		pageUrlTemplate: pageUrlTemplate,
		aws: aws,
		contentType: contentType
	};

})();