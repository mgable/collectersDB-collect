"use strict";

(function(){
	var exports = {};

	// includes
	var Q = require('q'),
		AWS = require('aws-sdk'),
		http_aws_es = require('http-aws-es'),
		elasticSearch = require('elasticsearch'),
		_ = require('underscore'),
		//fs = require('fs'),
		util = require('./util.js');

	// assignments
	var myCredentials = new AWS.SharedIniFileCredentials({profile: 'mgable'}),
		client = _makeESClient(util.getSearchHostPath()),
		deferred = Q.defer(),
		totalItems = 0;

		console.info(myCredentials);



	//public methods
	function makeIndex(diff, index, complete, host){
		var index = index || util.getSearchHostIndex();

		if (host){
			client = _makeESClient(host);
		}
		
		if (complete){
			util.logger.log("warn", "Deleting Index: %s", index);
			_deleteIndex(index, function(){
				_indexExists(index, diff, _log);
			});
		} else {
			totalItems = diff.length;
			_indexExists(index, diff, _log);
		}

		util.logger.log("info", "Indexing Elasticsearch", {itemCount: diff.length, index: index, complete: complete});
		return deferred.promise;
	}

	// private methods
	function _makeESClient(host){
		return new elasticSearch.Client({
			connectionClass: http_aws_es,
			host: host,
			log: 'trace',
			amazonES: {
				region: "us-west-1",
				credentials: myCredentials
			}
		});
	}

	function _catIndex(){
		return client.cat.indices({});
	}

	function _formatIndex(index, type, items){
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

	function _indexExists(index, items, cb){
		client.indices.exists({index: index}, function(error, exists){
			var type = util.getIndexType();
			if (exists === true){
				_isOkToWrite(index, type, util.getDateString()).then(function(ok){
					if (ok){
						_bulkImport(index, type, items, cb);
					} else {
						util.logger.log("error", "Already Indexed", {index: index, type: type, });
					}
				});
			} else {
				util.logger.log("warn", "index does not exist", {index: index, type: type});
				_createIndex(index, type, items, cb);
			}
		});
	}

	function _createIndex(index, type, items, cb){
		client.indices.create({index: index}, function(){
			_mapIndex(index, type, util.getMapping(), function(){
				_bulkImport(index, type, items, cb);
			});
		});
	}

	function _isOkToWrite(index, category, key){
		return _searchIndex(util.getSearchHostIndex(), _getQuery(key, 'date'), category).then(function(response){
			console.info("total hits is " + response.hits.total);
			return response.hits.total > 0 ? false : true;
		});
	}

	function _getQuery(term, field){
		return {
			"query": {
				"multi_match": {
					"query": term,
					"fields": [field]
				}
			}
		};
	}

	function _searchIndex(index, body, type){
		var deferred = Q.defer();
		client.search({
			index: index,
			body: body,
			type: type
		}, function (error, response) {
			console.info("got response");
			if (error){
				deferred.reject(error);
			} else {
				deferred.resolve(response);
			}
		});

		return deferred.promise;
	}

	function _deleteIndex(index, cb){
		client.indices.delete({index: index }, cb);
	}

	function _bulkImport(index, type, items, cb){
		if (items.length){
			var lot = items.splice(0,500);
			client.bulk({index: index, body: _formatIndex(index, type, lot)}, cb);

			setTimeout(function(){
				_bulkImport(index, type, items, cb);
			}, 4000);
		} else {
			util.logger.log("info", "Bulk Import Completed", {index: index, type: type, itemCount: totalItems});
			deferred.resolve(items);
		}
	}

	function _mapIndex(index, type, mapping, cb){
		client.indices.putMapping({index: index, type: type, body: mapping}, cb);
	}

	function _log(error, data){
		if (data){
			util.logger.log("info", "Created Index", {cat: _catIndex()});
		} else if (error){
			util.logger.log("error", error, {filename:__filename, method: "cd"});
		}
	}

	exports.makeIndex = makeIndex;

	module.exports = exports;
})();