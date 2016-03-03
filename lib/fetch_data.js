(function(){
	"use strict";

	var exports = {};

	//includes 
	var Q = require('q'),
		util = require('../bin/util.js');

	// asignments

	// public methods
	function fetchData(page, data){
		var deferred = Q.defer();

		deferred.resolve("fetching data: " + page);

		return deferred.promise;
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