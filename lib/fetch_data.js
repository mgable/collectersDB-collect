(function(){
	"use strict";

	var exports = {};

	//includes - theirs
	var Q = require('q'),
		_ = require('underscore');

	//includes - mine
	var util = require('../bin/util.js'),
		fetch = require('../bin/fetch.js');

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

	function fetchImageData(diff){
		var deferred = Q.defer();

		deferred.resolve("fetching image data: " + diff);

		return deferred.promise;
	}

	function fetchImages(diff){
		var deferred = Q.defer();

		if (!util.program.noimages){
			deferred.resolve("fetching images: " + diff);
		} else {
			deferred.resolve("NOT DOWNLOADING IMAGES: " + diff);
		}

		return deferred.promise;
	}

	// private methods

	// exports
	exports.fetchData = fetchData;
	exports.fetchImageData = fetchImageData;
	exports.fetchImages = fetchImages;

	// process

	module.exports = exports;
}());