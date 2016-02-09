"use strict";

(function(){
	var exports = {};

	// includes
	var Q = require('q'),
		http = require('http'),
		cheerio = require('cheerio'),
		url = require('url'),
		_ = require('underscore'),
		util = require('./util.js'),
		thumbs = require('../bin/thumbs.js'),
		additionalImages = require('../bin/additionalImages.js'),
		save = require('./save.js');

	// assignments
	var additionalImageData = Q.defer(),
		results = [];

	// public methods

	function fetchPage(page, data){
		var deferred = Q.defer();
		if (_.isArray(page)){
			// items from DB, this process has run
			deferred.resolve(page);
			return deferred.promise;
		} else if (_.isObject(page)){
			// a page to fetch
			util.logger.log("info", "Fetching Raw Data");
			return _fetchPage(page, data);
		}
	}

	function fetchImageData(diff){

		if(_hasImageData(_.last(diff))){
			util.logger.log("warn", "Diff has image data - skipping fetch image data");
			additionalImageData.resolve(diff);
			return additionalImageData.promise;
		} else {
			var items = _getThumbnailData(diff);
			util.logger.log("info", "Fetched Thumbnail Data", {itemCount: diff.length});

			return _fetchAdditionalImageData(items).then(function(promises){
				return Q.all(promises).then(function(data){
					util.logger.log("info", "Fetched Additional Image Data", {itemCount: data.length});
					save.saveDiff(data);
					return data;
				});
			});
		}
	}

	function fetchImages(diff){
		var deferred = Q.defer(),
			imagePath = util.getImagePath(),
			original = diff.slice(0);

		if (util.program.noimages){
			console.info("warn", "No-images flag set - not fetching images");
			deferred.resolve(diff);
		} else {
			util.logger.log("verbose", "Fetching Images");
			thumbs.fetchImages(diff, imagePath).then(function(data){
				util.logger.log("verbose", "Fetched Thumbnails");
				additionalImages.fetchImages(data, imagePath).then(function(/* data */){
					util.logger.log("info", "Fetched Additional Images");
					deferred.resolve(original);
				});
			});
		}

		return deferred.promise;
	}

	// private methods
	function _hasImageData(item){
		return (item.src.original && item.images) ? true : false;
	}

	function _fetchPage(page, data){
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
					util.logger.log("error", "Could Not Fetch Page: " + error, {filename: __filename, method: "_fetchPage - res.on", page: page});
					deferred.reject(error);
				});
			});

		req.on('error', function(error) {
			util.logger.log("error", "Could Not Fetch Page: " + error, {filename: __filename, method: "_fetchPage - req.on", page: page});
			deferred.reject(error);
		});

		// write data to request body
		if(data){
			req.write( data + '\n');
		}
		req.end();

		return deferred.promise;
	}
	function _getAdditionalImageData(item, additionalImages){
		item.images = {};
		item.images.original = additionalImages || [];
		item.images.local = [];

		additionalImages.forEach(function(v,index){
			var filename = "i_" + index + ".jpg";
			item.images.local.push(_makeLocalImagePath(util.getDateString(), item.id, filename));
		});

		return item;
	}

	function _fetchAdditionalImageData(items){
		_process(items);
		return additionalImageData.promise;
	}

	function _getAdditionalImages(completedLink, item){
		var deferred = Q.defer();
		_fetchPage(util.makeOptions(completedLink)).then(function (originalPage){
			var additionalImages = _collectAdditionalImages(originalPage);
			return deferred.resolve(_getAdditionalImageData(item, additionalImages));
		});

		return deferred.promise;
	}

	function _getCompletedPage(item){
		return _fetchPage(util.makeOptions(_getCompletedItemUrl(item.link))).then(function (data){
			return _getCompletedItemLink(data, item);
		});
	}

	function _process(items){
		if (items.length){
			var item = items.shift();
			return _getCompletedPage(item).then(function(link){
				if (link){
					return _getAdditionalImages(link, item).then(function(item){
						results.push(item);
						_process(items);
					});
				} else {
					if(item.failed) {
						util.logger.log("error", "Failed to fetch additional images - abort", {itemID: item.id} );
					} else {
						util.logger.log("warn", "Failed to fetch additional images - retry", {itemID: item.id} );
						item.failed = true;
						items.push(item);
					}
					_process(items);
				}
			});
		} else {
			return additionalImageData.resolve(results);
		}
	}

	function _getCompletedItemLink(data, item){
		util.logger.log("verbose", "getting completed link: " + item.link);
		try{
			var $ = cheerio.load(data),
				thumbnail = $("#icImg")[0].attribs.src; // thumbnail patch
			if (thumbnail) {
				item.src.original = thumbs.makeSmallerImageUrl(thumbnail);
			}
			return $("a:contains('See original listing')")[0].attribs.href;
		}catch(e){
			util.logger.log("error", "Can not find completed link", {link: item.link, data: JSON.stringify(data)});
			return false;
		}
	}

	function _collectAdditionalImages(data){
		var $ = cheerio.load(data),
			results = [];

		$(".lst.icon").first().find("li img").each(function(i,v){
			results.push(v.attribs.src);
		});

		if (!results.length){
			results.push($('#icImg').attr("src"));
		}

		return results;
	}

	function _getCompletedItemUrl(urlstr){
		var urlObj = (url.parse(urlstr, true));
		return urlObj.query.mpre;
	}

	function _getThumbnailData(items){
		var dateRE = /\w{3,4}$/;

		items.forEach(function(item){
			var src = {};
			src.original = item.src;

			var suffix = src.original.match(dateRE)[0],
				filename = _getFileName(item.id, suffix);

			src.local =  _makeLocalImagePath(util.getDateString(), item.id, filename);
			item.src = src;

		});

		return items;
	}

	function _makeLocalImagePath(dateStr, id, filename){
		return util.makePathFromDateString(dateStr) + "/" + id + "/" + filename;
	}

	function _getFileName(id, suffix){
		return   "t." + suffix;
	}

	exports.fetchPage = fetchPage;
	exports.fetchImageData = fetchImageData;
	exports.fetchImages = fetchImages;

	module.exports = exports;
})();