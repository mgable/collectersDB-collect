(function(){
	"use strict";

	var exports = {};

	// includes
	var Q = require('q'),
		url = require('url'),
		cheerio = require('cheerio'),
		_ = require('underscore'),
		util = require('./util.js'),
		get = require('./bin/get.js'),
		fetch = require('./fetch.js');

	// assignments
	var additionalData = Q.defer(),
		results = [];

	function getThumbnailData(diff){
		var dateRE = /\w{3,4}$/;

		diff.forEach(function(item){
			var src = {};
			src.original = item.src;

			var suffix = src.original.match(dateRE)[0],
				filename = _getFileName(item.id, suffix);

			src.local = _makeLocalImagePath(util.getTodaysKey(), item.id, filename);
			item.src = src;
		});

		util.logger.log("info", "Fetched Thumbnail Data", {itemCount: diff.length});
		return diff;
	}

	function fetchAdditionalData(diff){
		_reset();
		_process(diff);
		return additionalData.promise;
	}

	// private methods
	function _reset(){
		additionalData = Q.defer();
		results = [];
	}

	function _getFileName(id, suffix){
		return   "t." + suffix;
	}

	function _makeLocalImagePath(dateStr, id, filename){
		return util.makePathFromDateString(dateStr) + "/" + id + "/" + filename;
	}

	function _process(items){
		if (items.length){
			var item = items.shift();
			_getOriginalPage(item).then(function(item){
				if (item && item.source && item.source.originalUrl){
					return _getAdditionalData(item.source.originalUrl, item).then(function(item){ //success
						if(item.images.original.length) {
							results.push(item);
						} else {
							if (item.images.fail) {
								util.logger.log('error', 'Failed to fetch additional data (no additional images) - abort', {itemID: item.id, link: item.source.originalUrl});
							} else {
								item.images.fail = true;
								util.logger.log('warn', 'Failed to fetch additional data (no additional images) - retry', {itemID: item.id, link: item.source.originalUrl});
								items.push(item);
							}
						}
						_process(items);
					},
						function(item){ // fail
							if (item.fail){
								util.logger.log("error", "Failed to get additional data - abort", {item: item});
							} else {
								util.logger.log("warn", "Failed to get additional data - retry", {item: item});
								item.fail = true;
								items.push(item);
							}

							_process(items);
						}
					);
				} else {
					if(item.failed) {
						util.logger.log("error", "Failed to fetch additional data (invalid link) - abort", {itemID: item.id} );
					} else {
						util.logger.log("warn", "Failed to fetch additional data (invalid link) - retry", {itemID: item.id} );
						item.failed = true;
						items.push(item);
					}
					_process(items);
				}
			},
				function(item){
					if (item.fail){
						util.logger.error("error", "Failed to get additional data - abort", {item: item});
					} else {
						util.logger.log("warn", "Failed to get additional data - retry", {item: item});
						item.fail = true;
						items.push(item);
					}
					_process(items);
				}
			);
		} else {
			additionalData.resolve(results);
		}
	}

	function _getOriginalPage(item){
		return fetch.fetchData(util.makeOptions(_getCompletedItemUrl(item.link))).then(
			function (data){ // success
				return _getOriginalItemUrl(data, item);
			},
			function (error){ // fail
				return item;
			}
		);
	}

	function _getCompletedItemUrl(urlstr){
		var urlObj = (url.parse(urlstr, true));
		return urlObj.query.mpre;
	}

	function _getOriginalItemUrl(data, item){
		util.logger.log("verbose", "getting original link", {itemID: item.id, link: item.link});
		if (data){
			var $ = cheerio.load(data);

			get.thumbnail($, item);
			get.listedIn($, item);
			get.originalLink($, item);

			return item;

		} else {
			util.logger.log("error", "No data", {itemID: item.id, link: item.link});
			return item;
		}
	}

	function _getAdditionalData(completedLink, item){
		var deferred = Q.defer();
		fetch.fetchData(util.makeOptions(completedLink)).then(function (originalPage){
			var $ = cheerio.load(originalPage),
				additionalImages = _collectAdditionalImageUrls($);

			get.reserveNotMet($, item);
			return deferred.resolve(_getAdditionalImageData(item, additionalImages));
		},
			function(error){
				return item;
			}
		);

		return deferred.promise;
	}

	function _collectAdditionalImageUrls($){
		var results = [];

		$(".lst.icon").first().find("li img").each(function(i,v){
			results.push(v.attribs.src);
		});

		if (!results.length && $('#icImg').attr("src")){
			results.push($('#icImg').attr("src"));
		}

		return _.compact(results);
	}

	function _getAdditionalImageData(item, additionalImages){
		item.images = {};
		item.images.original = additionalImages || [];
		item.images.local = [];

		additionalImages.forEach(function(v,index){
			var filename = "i_" + index + ".jpg";
			item.images.local.push(_makeLocalImagePath(util.getTodaysKey(), item.id, filename));
		});

		return item;
	}
	
	// exports
	exports.getThumbnailData = getThumbnailData;
	exports.fetchAdditionalData = fetchAdditionalData;

	module.exports = exports;
}());