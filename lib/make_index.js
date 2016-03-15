(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q'),
		AWS = require('aws-sdk'),
		http_aws_es = require('http-aws-es'),
		elasticSearch = require('elasticsearch'),
		_ = require('underscore'),
		util = require('../bin/util.js');


	// assignments
	var deferred = Q.defer(),
		totalItems,
		diff,
		client;


	// public methods
	function makeIndex(_diff, index, host, type, complete){
		var index = index || util.getSearchHostIndex(),
			host = host ||  util.getSearchHost();

		client = _makeESClient(host);
		diff = _diff;

		if (!util.program.nosave){
			if (complete){
				util.logger.log("warn", "Deleting Index: %s", index);
				_deleteIndex(index, function(){
					_indexExists(index, diff, _log, type);
				});
			} else {
				totalItems = diff.length;
				_indexExists(index, diff, _log, type);
				util.logger.log("info", "Indexing Elasticsearch", {itemCount: totalItems, index: index, complete: complete});
			}
		} else {
			util.logger.log("warn", "In NO-SAVE mode. Not saving Index.")
			deferred.resolve(diff);
		}

		return deferred.promise;
	}

	// private methods
	function _makeESClient(host){
		var config = util.getConfigValue('aws'),
			credentials = new AWS.SharedIniFileCredentials({profile: config.profile});

		if (config.location && config.location == "local"){
			return new elasticSearch.Client({
				host: host || config.ES.endpoint,
				log: 'trace'
			});
		} 

		return new elasticSearch.Client({
			connectionClass: http_aws_es,
			host: host || config.ES.endpoint,
			log: 'trace',
			amazonES: {
				region: config.ES.region,
				credentials: credentials
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
				item.id = item.id.toString();
				item.suggest = {"input": _makeSuggestField(item)};
				results.push(str);
				results.push(item);
			});
			return results;
		}

		return items;
	}

	function _makeSuggestField(item){
		var config = util.getConfigValue("output"),
			stopWords = _.union(config.stopWords.category, config.stopWords.global),
			terms = _.compact(item.title.toLowerCase().split(/\W/)),
			suggest = _.reject(terms, function(term){
				if (term.length === 1) {
					return true;
				}

				return stopWords.indexOf(term) > -1 ? true : false;
			});

			return suggest;
	}

	function _indexExists(index, items, cb, type){
		var type = type || util.getIndexType();

		client.indices.exists({index: index}, function(error, exists){
			if (exists === true){
				_isOkToWrite(index, type, util.getTodaysKey()).then(function(ok){
					if (ok){
						_bulkImport(index, type, items, cb);
					} else {
						util.logger.log("error", "Already Indexed", {index: index, type: type});
						deferred.resolve(diff);
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
			util.logger.log("verbose", "ok to write", {hits: response.hits.total});
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
			deferred.resolve(diff);
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

	//exports
	exports.makeIndex = makeIndex;

	module.exports = exports;
}());