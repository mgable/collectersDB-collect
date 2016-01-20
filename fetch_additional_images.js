"use strict";

(function(){
	var util = require('./util.js'),
		fetch = require('./fetch_image_data.js'),
		Q = require("q"),
		diffFilePath = util.getDiffPath(),
		fileName = util.getFileName(),
		diffFile = diffFilePath + fileName,
		diff = util.getFileContents(diffFile),
		imagePath = util.getImagePath(),
		totalItems = diff.length,
		filesReceived = 0,
		totalAdditionalImages = 0;

	util.makeDirectories(imagePath);

	getThumbnailImages(diff, imagePath);

	function getThumbnailImages(items, imagePath){
		// download thumbnails
		items.forEach(function(item){
			var itemImagePath = imagePath + item.id + "/",
				filename = item.src.local.replace(/^\d{4}\/\d{2}\/\d{2}\//, "");
			util.makeDirectories(itemImagePath);

			fetch.download(item.src.original, imagePath, filename, thumbNailCallback);
		});

		util.logger.log("fetched " + totalItems + " thumbnails for " + diffFile);
	}

	function thumbNailCallback(uri, imagePath, filename){
		console.info("getting callback " + (filesReceived + 1) + " out of " + diffFile.length);
		console.info(uri, imagePath, filename);
		if (++filesReceived === totalItems){
			console.info("done getting " + totalItems + " thubmnails!");
			additionalImagesCallback();
		}
	}

	function getAdditionalImages(item){
		var deferred = Q.defer(), count = 0;

		item.images.original.forEach(function(image, index){
			var filename = item.images.local[index].replace(/^\d{4}\/\d{2}\/\d{2}\//, ""),
				largerImageUrl = fetch.makeLargerImageUrl(image);

			fetch.download(largerImageUrl, imagePath, filename, function(){
				if (++count === item.images.original.length){
					console.info("Fetched all " + item.images.original.length + " images for " + item.id);
					deferred.resolve();
				}
			});

		});

		return deferred.promise;
	}

	function additionalImagesCallback(){
		if(diff.length){
			var item = diff.shift();

			console.info("getting " + item.images.original.length + " images for " + item.id);

			totalAdditionalImages += item.images.original.length;
			getAdditionalImages(item).then(function(){additionalImagesCallback();});

		 } else {
		 	console.info("TOTALLY DONE");
		 	util.logger.log("fetched " + totalAdditionalImages + " additional images for " + diffFile);
		 }
	}
})();