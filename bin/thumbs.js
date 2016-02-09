"use strict";

(function(){
	var exports = {};

	// includes
	var Q = require('q'),
		util = require('../lib/util.js'),
		upload = require('./upload.js');

	// assignments
	var filesReceived = 0,
		totalItems,
		items,
		deferred = Q.defer();

	// public methods
	function fetchImages(data, imagePath){
		// set class variables
		items = data;
		totalItems = items.length;

		// download thumbnails
		items.forEach(function(item){
			var filename = item.src.local.replace(/^\d{4}\/\d{2}\/\d{2}\//, "");

			upload.S3(item.src.original, imagePath, filename, _thumbNailCallback);
		});

		util.logger.log("info", "Fetching Thumbnails", {imageCount: totalItems, imagePath: imagePath});

		return deferred.promise;
	}

	function makeSmallerImageUrl(url){
		return url.replace(/(?!s\-l)\d{2,3}/, "140");
	}

	// private methods
	function _thumbNailCallback(/* uri, imagePath, filename */){
		console.info("getting callback " + (filesReceived + 1) + " out of " + totalItems);
		if (++filesReceived === totalItems){
			util.logger.log("info", "Fetched Thumbnails", {imageCount: totalItems});
			deferred.resolve(items);
		}
	}

	exports.makeSmallerImageUrl = makeSmallerImageUrl;
	exports.fetchImages = fetchImages;

	module.exports = exports;
})();