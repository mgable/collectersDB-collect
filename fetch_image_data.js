"use strict";

(function(){

	var Q = require("q"),
		cheerio = require('cheerio'),
		url = require('url'),
		util = require('./util.js'),
		AdditionalImages = Q.defer(), 
		results = [];

	function getCompletedItemUrl(urlstr){
		var urlObj = (url.parse(urlstr, true));
		return urlObj.query.mpre;
	}

	function makeLargerImageUrl(url){
		return url.replace(/(?!s\-l)64/, "400");
	}

	function getFileName(id, suffix){
		return   "t." + suffix;
	}

	function getAdditionalImageData(item, additionalImages, imagePath, dateStr){
		item.images = {};
		item.images.original = additionalImages;
		item.images.local = [];

		additionalImages.forEach(function(v,index){
			var filename = "i_" + index + ".jpg";
			item.images.local.push(util.makeLocalImagePath(dateStr, item.id, filename));
		});

		return item;
	}

	function collectAdditionalImages(data){
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


	function getCompletedItemLink(data, link){
		try{
			var $ = cheerio.load(data);
			return $("a:contains('See original listing')")[0].attribs.href;
		}catch(e){
			util.logger.log("ERROR - Can not find completed link for: " + link, 'error');
			return false;
		}
	}

	function getThumbnailData(dateStr, imagePath, items){
		var dateRE = /\w{3,4}$/;

		items.forEach(function(item){
			var src = {};
			src.original = item.src;

			var suffix = src.original.match(dateRE)[0],
				filename = getFileName(item.id, suffix);

			src.local =  util.makeLocalImagePath(dateStr, item.id, filename);
			item.src = src;

		});

		return items;
	}

	function fetchAdditionalImageData(dateStr, imagePath, items){
		_process(dateStr, imagePath, items);
		return AdditionalImages.promise;
	}

	function _process(dateStr, imagePath, items){
		if (items.length){
			var item = items.shift();
			return getCompletedPage(item).then(function(link){
				return getAdditionalImages(link, dateStr, imagePath, item).then(function(item){
					results.push(item);
					_process(dateStr, imagePath, items);
				});
			});
		} else {
			return AdditionalImages.resolve(results);
		}
	}

	function getCompletedPage(item){
		return util.fetchPage(util.makeOptions(getCompletedItemUrl(item.link))).then(function (data){
			return getCompletedItemLink(data, item.link);
		});
	}

	function getAdditionalImages(completedLink, dateStr, imagePath, item){
		var deferred = Q.defer();
		util.fetchPage(util.makeOptions(completedLink)).then(function (data){
			var additionalImages = collectAdditionalImages(data);
			return deferred.resolve(getAdditionalImageData(item, additionalImages, imagePath, dateStr));
		});

		return deferred.promise;
	}

	module.exports = {
		getThumbnailData: getThumbnailData, 
		fetchAdditionalImageData: fetchAdditionalImageData,
		makeLargerImageUrl: makeLargerImageUrl
	};
})();
