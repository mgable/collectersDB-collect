"use strict";

(function(){
	var exports = {};

	// includes
	var Q = require('q'),
		util = require('../lib/util.js'),
		upload = require('./upload.js');

	// assignments
	var totalAdditionalImages = 0,
		deferred = Q.defer();

	// public methods
	function fetchImages(diff, imagePath){
		if(diff.length){
			var item = diff.shift();

			util.logger.log("info", "Fetching Images", {itemID:item.id, imageCount:item.images.original.length});

			totalAdditionalImages += item.images.original.length;
			additionalImagesCallback(item, imagePath).then(function(){fetchImages(diff, imagePath);});

		 } else {
		 	util.logger.log("info", "Fetch Images Completed");
		 	deferred.resolve();
		 }

		 return deferred.promise;
	}

	function additionalImagesCallback(item, imagePath){
		var deferred = Q.defer(),
			count = 0;

		item.images.original.forEach(function(image, index){
			var filename = item.images.local[index].replace(/^\d{4}\/\d{2}\/\d{2}\//, ""),
				largerImageUrl = _makeLargerImageUrl(image);

			upload.S3(largerImageUrl, imagePath, filename, function(){
				if (++count === item.images.original.length){
					util.logger.log("info", "Fetched All Images", {itemID:item.id, imageCount:item.images.original.length});
					deferred.resolve();
				}
			});

		});

		return deferred.promise;
	}

	// private methods
	function _makeLargerImageUrl(url){
		return url.replace(/(?!s\-l)64/, "400");
	}

	exports.fetchImages = fetchImages;

	module.exports = exports;
})();