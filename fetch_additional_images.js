"use strict";

(function(){
	var util = require('./util.js'),
		fetch = require('./fetch_image_data.js'),
		Q = require("q"),
		imagePath = util.getImagePath(),
		todayKey = util.getDateString(),
		totalItems = 0,
		filesReceived = 0,
		totalAdditionalImages = 0,
		diff = [];

	getDataFromDynamo(todayKey).then(function(data){
		console.info("hello");
		console.info(typeof data);
		//diff = JSON.parse(data);
		//console.info(diff);
		totalItems = data.length;
		console.info("hey!" + totalItems);
		getThumbnailImages(data, imagePath);
	});


	function getDataFromDynamo(todayKey){
		var keys = [ {date: todayKey}],
			diffTable = util.getDiffTable();

		return util.getFromDynamo(keys, diffTable).then(function(data){
			console.info("got diff file");
			console.info(data);
			var newItems = data.Responses[diffTable][0].items;

			return newItems;
		});
	}

	function getThumbnailImages(items, imagePath){
		// download thumbnails
		items.forEach(function(item){
			//console.info(item);
			var filename = item.src.local.replace(/^\d{4}\/\d{2}\/\d{2}\//, "");

			fetch.download(item.src.original, imagePath, filename, thumbNailCallback);
		});

		util.logger.log("fetched " + totalItems + " thumbnails for " + todayKey);
	}

	function thumbNailCallback(uri, imagePath, filename){
		console.info("getting callback " + (filesReceived + 1) + " out of " + totalItems);
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
		 	util.logger.log("fetched " + totalAdditionalImages + " additional images for " + todayKey);
		 }
	}
})();