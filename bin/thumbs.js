"use strict";

(function(){
	var exports = {};

	var Q = require('q'),
		util = require('../lib/util.js'),
		upload = require('./upload.js');

	var filesReceived = 0,
		totalItems,
		items,
		deferred = Q.defer();

	function fetchImages(data, imagePath){
		// set class variables
		items = data;
		totalItems = items.length;

		// download thumbnails
		items.forEach(function(item){
			var filename = item.src.local.replace(/^\d{4}\/\d{2}\/\d{2}\//, "");

			upload.S3(item.src.original, imagePath, filename, thumbNailCallback);
		});

		util.logger.log("info", "Fetching Thumbnails", {imageCount: totalItems, imagePath: imagePath});

		return deferred.promise;
	}

	function thumbNailCallback(/* uri, imagePath, filename */){
		console.info("getting callback " + (filesReceived + 1) + " out of " + totalItems);
		if (++filesReceived === totalItems){
			util.logger.log("info", "Fetched Thumbnails", {imageCount: totalItems});
			deferred.resolve(items);
		}
	}

	exports.fetchImages = fetchImages;

	module.exports = exports;
})();