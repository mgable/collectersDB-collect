"use strict";

(function(){
	var exports = {};

	// includes
	var Q = require('q'),
		http = require('http'),
		cheerio = require('cheerio'),
		url = require('url'),
		util = require('./util.js'),
		thumbs = require('../bin/thumbs.js'),
		additionalImages = require('../bin/additionalImages.js');

	// assignments
	var additionalImageData = Q.defer(),
		results = [];

	// public methods
	function fetchPage(page, data){
		var deferred = Q.defer(),	
			container = "";

			var req = http.request(page, function(res) {
				res.setEncoding('utf8');

				res.on('data', function (chunk) {
					container += chunk;
				});

				res.on('end', function(){
					deferred.resolve(container);
					//TODO: util.logger.log("fetching: " + page);
					//console.info("fetched: " +  container);
				});

				res.on('error', function(error){
					deferred.reject(error);
					//TODO: util.logger.log(error, 'error');
					console.error(error);
					console.error("ERROR - could not fetch: " + page);
				});
			});

		req.on('error', function(err) {
			//TODO: util.logger.log(err, 'error');
			deferred.reject(err);
		});

		// write data to request body
		if(data){
			req.write( data + '\n');
		}
		req.end();

		return deferred.promise;
	}

	function fetchImageData(diff){
		console.info("fetchImageData ");
		var items = _getThumbnailData(diff);

		return _fetchAdditionalImageData(items).then(function(promises){
			console.info("done receiving data");
			return Q.all(promises).then(function(data){
				console.info("TOTALLY DONE!!!!");
				return data;
			});
		});
	}

	function fetchImages(diff){
		var deferred = Q.defer(),
			imagePath = util.getImagePath(),
			original = diff.slice(0);

		thumbs.fetchImages(diff, imagePath).then(function(data){
			console.info("got thumbnails");
			additionalImages.fetchImages(data, imagePath).then(function(/* data */){
				console.info("got addtional imnages");
				deferred.resolve(original);
			});
		});

		return deferred.promise;
	}

	// private methods
	function _getAdditionalImageData(item, additionalImages){
		item.images = {};
		item.images.original = additionalImages;
		item.images.local = [];

		additionalImages.forEach(function(v,index){
			var filename = "i_" + index + ".jpg";
			item.images.local.push(_makeLocalImagePath(util.getDateString(), item.id, filename));
		});

		return item;
	}

	function _fetchAdditionalImageData(items){
		console.info("starting process with " + items.length + " items");
		_process(items);
		return additionalImageData.promise;
	}

	function _getAdditionalImages(completedLink, item){
		var deferred = Q.defer();
		fetchPage(util.makeOptions(completedLink)).then(function (originalPage){
			var additionalImages = _collectAdditionalImages(originalPage);
			return deferred.resolve(_getAdditionalImageData(item, additionalImages));
		});

		return deferred.promise;
	}

	function _getCompletedPage(item){
		return fetchPage(util.makeOptions(_getCompletedItemUrl(item.link))).then(function (data){
			return _getCompletedItemLink(data, item.link);
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
					util.logger.log("ERROR- fetching additional images for: " + item.id, 'error');
					console.info(item.date, item,link);
					items.push(item);
					_process(items);
				}
			});
		} else {
			return additionalImageData.resolve(results);
		}
	}

	function _getCompletedItemLink(data, link){
		console.info("getting completed link");
		try{
			var $ = cheerio.load(data);
			return $("a:contains('See original listing')")[0].attribs.href;
		}catch(e){
			util.logger.log("ERROR - Can not find completed link for: " + link, 'error');
			console.info("ERROR - Can not find completed link for: " + link);
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