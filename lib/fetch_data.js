(function(){
	"use strict";

	var exports = {};

	//includes - theirs
	var Q = require('q'),
		_ = require('underscore');

	//includes - mine
	var util = require('../bin/util.js'),
		fetch = require('../bin/fetch.js'),
		data = require('../bin/data.js');

	// asignments

	// public methods
	function fetchData(page, data){
		var deferred = Q.defer();

		if (_.isArray(page)){
			// items from DB, this process has run
			deferred.resolve(page);
			return deferred.promise;
		} else if (_.isObject(page)){
			// a page to fetch
			util.logger.log("info", "Fetching Raw Data");
			return fetch.fetchData(page, data);
		}
	}

	function fetchAdditionData(diff){
		var deferred = Q.defer();

		if(_hasImageData(_.last(diff))){
			util.logger.log("warn", "Diff has additional data - skipping fetch additinal data");
			deferred.resolve(diff);
			return deferred.promise;
		} else {
			var items = data.getThumbnailData(diff);

			return data.fetchAdditionalData(items).then(function(promises){
				return Q.all(promises).then(function(data){
					util.logger.log("info", "Fetched Additional Data", {itemCount: data.length});
					return data;
				});
			});
		}
	}

	function fetchImages(diff){
		var deferred = Q.defer(),
			imagePath = util.getImagePath(),
			original = diff.slice(0);

		if (!util.program.noimages){
			deferred.resolve("fetching images: " + diff);

			util.logger.log("verbose", "Fetching Images");
			fetch.thumbnails(diff, imagePath).then(function(data){
				util.logger.log("verbose", "Fetched Thumbnails");
				fetch.additionalImages(data, imagePath).then(function(/*data*/){
					util.logger.log("info", "Fetched Additional Images");
					deferred.resolve(original);
				});
			});

		} else {
			util.logger.log("warn", "No-images flag set - not fetching images");
			deferred.resolve(diff);
		}

		return deferred.promise;
	}

	// private methods
	function _hasImageData(item){
		return (item.src.original && item.images) ? true : false;
	}

	// exports
	exports.fetchData = fetchData;
	exports.fetchAdditionData = fetchAdditionData;
	exports.fetchImages = fetchImages;

	// process

	module.exports = exports;
}());