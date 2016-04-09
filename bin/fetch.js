(function(){
	"use strict";

	var exports = {};

	//includes
	var http = require('http'),
		Q = require('q'),
		util = require('./util.js'),
		upload = require('./bin/upload.js');

	// assignments
	var filesReceived = 0,
		totalItems,
		items,
		diff,
		thumbnailDeferred = Q.defer(),
		additionalDeferred = Q.defer(),
		totalAdditionalImages = 0,
		re = /^\d{4}\/\d{2}\/\d{2}\//,
		imagePath;

	// public methods
	function fetchData(page, data){
		var deferred = Q.defer(),	
			container = "";

			var req = http.request(page, function(res) {
				res.setEncoding('utf8');

				res.on('data', function (chunk) {
					container += chunk;
				});

				res.on('end', function(){
					deferred.resolve(container);
				});

				res.on('error', function(error){
					util.logger.log("error", "Could Not Fetch Page: " + error, {filename: __filename, method: "fetch - res.on", page: page});
					deferred.reject(error);
				});
			});

		req.on('error', function(error) {
			util.logger.log("error", "Could Not Fetch Page: " + error, {filename: __filename, method: "fetch - req.on", page: page});
			deferred.reject(error);
		});

		// write data to request body
		if(data){
			req.write( data + '\n');
		}
		req.end();

		return deferred.promise;
	}

	function thumbnails(_diff, _imagePath){
		_reset();
		// set class variables
		items = _diff.slice(0);
		diff = _diff;
		totalItems = items.length;
		imagePath = _imagePath;

		// download thumbnails
		_fetchThumbnails(diff);

		util.logger.log("info", "Fetching Thumbnails", {imageCount: totalItems, imagePath: imagePath});

		return thumbnailDeferred.promise;
	}

	function additionalImages(diff, imagePath){
		if(diff.length){
			var item = diff.shift();

			util.logger.log("verbose", "Fetching Images", {itemID:item.id, imageCount:item.images.original.length});

			totalAdditionalImages += item.images.original.length;
			_additionalImagesCallback(item, imagePath).then(function(){additionalImages(diff, imagePath);});

		 } else {
		 	util.logger.log("info", "Fetch Images Completed");
		 	additionalDeferred.resolve(totalAdditionalImages);
		 }

		 return additionalDeferred.promise;
	}

	// private methods
	function _reset(){
		filesReceived = 0;
		thumbnailDeferred = Q.defer();
		additionalDeferred = Q.defer();
		totalAdditionalImages = 0;
	}

	function _fetchThumbnails(){

		if (diff.length){
			var item = diff.pop(),
				filename = item.src.local.replace(re, "");

			upload.S3(item.src.original, imagePath, filename, _thumbNailCallback);
		}
	}

	function _thumbNailCallback(){
		util.logger.log("verbose", "getting callback " + (filesReceived + 1) + " out of " + totalItems);
		if (++filesReceived === totalItems){
			util.logger.log("info", "Fetched Thumbnails", {imageCount: totalItems});
			thumbnailDeferred.resolve(items);
		} else {
			_fetchThumbnails();
		}
	}

	function _additionalImagesCallback(item, imagePath){
		var deferred = Q.defer(),
			count = 0;

		if(item.images.original && item.images.original.length){
			util.logger.log("verbose", "Fetching additional images", {itemID: item.id, images: item.images.original});
			item.images.original.forEach(function(image, index){
				var filename = item.images.local[index].replace(/^\d{4}\/\d{2}\/\d{2}\//, ""),
					largerImageUrl = _makeLargerImageUrl(image);

				upload.S3(largerImageUrl, imagePath, filename, function(){
					if (++count === item.images.original.length){
						util.logger.log("verbose", "Fetched All Images", {itemID:item.id, imageCount:item.images.original.length});
						deferred.resolve();
					}
				});

			});
		} else {
			util.logger.log('error', "no additional images", {itemID:item.id});
			deferred.resolve();
		}

		return deferred.promise;
	}

	// private methods
	function _makeLargerImageUrl(url){
		return url.replace(/s\-l64\.jpg$/, "s-l" + util.getConfigValue("output").images.additional + ".jpg");
	}

	//exports
	exports.fetchData = fetchData;
	exports.thumbnails = thumbnails;
	exports.additionalImages = additionalImages;

	module.exports = exports;
}());