"use strict";

(function(){
	var exports = {};

	// includes
	var Q = require('q'),
		elasticSearch = require('elasticsearch'),
		_ = require('underscore'),
		//fs = require('fs'),
		util = require('./util.js');

	// assignments
	var client = new elasticSearch.Client({
			host: util.getSearchHostPath(),
			log: 'trace'
		}),
		deferred = Q.defer();

	function makeIndex(diff, index, complete){
		var index = index || util.getSearchHostIndex();
		
		if (complete){
			console.info("deleting index %s", index);
			deleteIndex(index, function(){
				indexExists(index, diff, cb);
			});
		} else {
			indexExists(index, diff, cb);
		}

		util.logger.log("making index for elsaticsearch consisting of " + diff.length + " items");
		return deferred.promise;
	}

	// function catIndex(){
	// 	client.cat.indices({}, cb);
	// }

	function formatIndex(index, type, items){
		var results = [];

		if (_.isArray(items)){
			items.forEach(function(item){
				var str = {index: {_index: index, _type: type}};
				results.push(str);
				results.push(item);
			});
			return results;
		}

		return items;
	}

	function indexExists(index, items, cb){
		client.indices.exists({index: index}, function(error, exists){
			var type = util.getIndexType();
			if (exists === true){
				console.info("index exists");
				bulkImport(index, type, items, cb);
			} else {
				createIndex(index, type, items, cb);
				console.info("index does not exist");
			}
		});
	}

	function createIndex(index, type, items, cb){
		client.indices.create({index: index}, function(){
			mapIndex(index, type, util.getMapping(), function(){
				bulkImport(index, type, items, cb);
			});
		});
	}

	function deleteIndex(index, cb){
		client.indices.delete({index: index }, cb);
	}

	function bulkImport(index, type, items, cb){
		if (items.length){
			var lot = items.splice(0,500);
			client.bulk({index: index, body: formatIndex(index, type, lot)}, cb);

			setTimeout(function(){
				bulkImport(index, type, items, cb);
			}, 4000);
		} else {
			console.info("done!!!");
			deferred.resolve();
		}
	}

	function mapIndex(index, type, mapping, cb){
		client.indices.putMapping({index: index, type: type, body: mapping}, cb);
	}

	function cb(error, data){
		console.info("got data");
		console.info(error, data);
	}

	exports.makeIndex = makeIndex;

	module.exports = exports;
})();