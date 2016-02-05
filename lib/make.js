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
		deferred = Q.defer(),
		totalItems = 0;

	function makeIndex(diff, index, complete){
		var index = index || util.getSearchHostIndex();
		
		if (complete){
			util.logger.log("warn", "Deleting Index: %s", index);
			deleteIndex(index, function(){
				indexExists(index, diff, cb);
			});
		} else {
			totalItems = diff.length;
			indexExists(index, diff, cb);
		}

		util.logger.log("info", "Indexing Elasticsearch", {itemCount: diff.length, index: index, complete: complete});
		return deferred.promise;
	}

	function catIndex(){
		return client.cat.indices({});
	}

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
				bulkImport(index, type, items, cb);
			} else {
				createIndex(index, type, items, cb);
				util.logger.log("warn", "index does not exist", {index: index, type: type});
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
			util.logger.log("info", "Bulk Import Completed", {index: index, type: type, itemCount: totalItems});
			deferred.resolve(items);
		}
	}

	function mapIndex(index, type, mapping, cb){
		client.indices.putMapping({index: index, type: type, body: mapping}, cb);
	}

	function cb(error, data){
		if (data){
			util.logger.log("info", "Created Index", catIndex());
		} else if (error){
			util.logger.log("error", error, {filename:__filename, method: "cd"});
		}
	}

	exports.makeIndex = makeIndex;

	module.exports = exports;
})();