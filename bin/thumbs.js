"use strict";

(function(){
	var exports = {};

	var Q = require('q'),
		upload = require('./upload.js');

	var filesReceived = 0,
		totalItems,
		items,
		deferred = Q.defer();

	function fetchImages(data, imagePath){
		// download thumbnails
		items = data;

		totalItems = items.length;

		items.forEach(function(item){
			var filename = item.src.local.replace(/^\d{4}\/\d{2}\/\d{2}\//, "");

			upload.S3(item.src.original, imagePath, filename, thumbNailCallback);
		});

		console.info("fetched " + totalItems + " thumbnails for " + imagePath);
		//util.logger.log("fetched " + totalItems + " thumbnails for " + imagePath);

		return deferred.promise;
	}

	function thumbNailCallback(/* uri, imagePath, filename */){
		console.info("getting callback " + (filesReceived + 1) + " out of " + totalItems);
		if (++filesReceived === totalItems){
			console.info("done getting " + totalItems + " thubmnails!");
			//additionalImagesCallback();
			deferred.resolve(items);
		}
	}

	exports.fetchImages = fetchImages;

	module.exports = exports;
})();