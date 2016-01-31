"use strict";

(function(){
	var exports = {};

	exports.category = {name: 'advertising_tins', id: 1175};
	exports.categories = [exports.category];
	exports.domain = 'www.collectorsweekly.com';
	exports.searchHost = 'https://search-mgable-es-ht4qtiycv6v543iujwxk6q5n3u.us-west-2.es.amazonaws.com/';
	exports.pageUrlTemplate = '/ajax/category-auctions.php?id= *** config.category.id *** &sort=completed&limit=1000&offset=0';
	exports.contentType = {
		'json': 'application/json; charset=UTF-8',
		'jpg': 'image/jpeg'
	};
	exports.aws = {};
	exports.aws.bucket = 'a-collectors-db';
	exports.aws.region = 'us-west-2';
	exports.aws.dynamo = {endpoint: 'http://localhost:8000'};
	exports.system = "aws";
	exports.mode = false;
	exports.diffTable = "_diffs";
	exports.rawTable = "_raw";
	exports.storeTable = "_store";
	exports.imageDirectory = "store/images/";

	module.exports = exports;
})();