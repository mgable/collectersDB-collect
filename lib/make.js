"use strict";

(function(){
	var exports = {};

	var Q = require("q"),
		fetch = require('./fetch.js'),
		util = require('./util.js');

	var url = util.getSearchHostPath() + "advertising_tins/_count",
		startIndex;

	makeIndex();

	function makeIndex(diff){
		//var deferred = Q.defer();
		
		//console.info(data);
//var url = "http://search-mgable-es-ht4qtiycv6v543iujwxk6q5n3u.us-west-2.es.amazonaws.com/collectorsdb/advertising_tins/_count"
//var url = "http://localhost:9200/collectorsdb/advertising_tins/_count";

//console.info("makeIndex " + url);
		var a = fetch.fetchPage(url, function(data){
			var data = JSON.parse(data)
			startIndex = parseInt(data.count,10);
			console.info(startIndex);
		})
	}

	exports.makeIndex = makeIndex;

	module.exports = exports;
})();