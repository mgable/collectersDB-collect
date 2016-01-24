"use strict";

(function(){

	var Q = require("q"),
		fs = require('fs'),
		request = require('request'),
		cheerio = require('cheerio'),
		url = require('url'),
		util = require('./util.js'),
		AdditionalImages = Q.defer(), 
		results = [],
		AWS = require('aws-sdk'),
		credentials = new AWS.SharedIniFileCredentials({profile: 'mgable'});

	AWS.config.credentials = credentials;
	var s3Stream = require('s3-upload-stream')(new AWS.S3());

	function download(uri, imagePath, filename, callback){
		downloadToS3(uri, imagePath, filename, callback);
	}

	function downloadToLocal(uri, imagePath, filename, callback){
		var callback = callback || _.noop; // jshint ignore:line

		console.info("downloading: " + uri + " : " + imagePath + filename);
		request.head(uri, function(err /*, res, body*/){
			if (err){
				util.logger.log("ERROR - downloading image: " + uri + " : " + imagePath + filename, 'error');
			} 
			request(uri).pipe(fs.createWriteStream(imagePath + filename)).on('close', 
				function(){callback(uri, imagePath, filename);}).on('error', function(err){
				util.logger.log("ERROR IN PIPE:" + err, 'error');
				callback(uri, imagePath, filename);
			});
		});
	}


	function downloadToS3(uri, imagePath, filename, callback){
		var callback = callback || _.noop; // jshint ignore:line

		console.info("downloading: " + uri + " : " + imagePath + filename);

		request.head(uri, function(){
	
			imagePath = imagePath.replace(/(http.*\.com\/)/,"");

			var upload = s3Stream.upload({
				"Bucket": util.config.aws.bucket,
				"Key": imagePath + filename,
				"ContentType": util.config.contentType.jpg
			});

			upload.on('error', function (error) {
				console.log(error);
			});

			upload.on('uploaded', function (details) {
				//console.log(details);
				console.info("done!!!!");
				callback(uri, imagePath, filename);
			});

		 	request(uri).pipe(upload).on('close', function(){console.info("pipe close callback");callback(uri, imagePath, filename);}).on('error', function(err){
				util.logger.log(err, 'error');
			});
		});
	}


	

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
		makeLargerImageUrl: makeLargerImageUrl,
		download : download
	};
})();
