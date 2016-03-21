(function(){
	"use strict";

	var exports = {};

	// includes
	var _ = require('underscore'),
		util = require('../util.js');

	// public methods
	function thumbnail($, item){
		// get thumbnail data
		var thumbnail = $("#icImg");

		if (thumbnail && thumbnail[0] && thumbnail[0].attribs && thumbnail[0].attribs.src) {
			item.src.original = _makeSmallerImageUrl(thumbnail[0].attribs.src);
		} else {
			util.logger.log("error", "Can not find thumbnail src", {itemID: item.id, link: item.link});
		}
	}

	function listedIn($, item){
		// get listedIn
		var listedInEl = $("#vi-VR-brumb-lnkLst table tr");

		if (listedInEl && listedInEl.length){
			item.source = item.source || {};
			item.source.listedIn  = _.map(listedInEl, function(item){
				var results = "";

				$("ul li", item).each(function(i,e){
					results += $(e).text();
				});
				return results.replace(/\>/g, " > ");
			});

		} else {
			util.logger.log("error", "Can not find listedIn" , {itemID: item.id, link: item.link});
		}
	}

	function originalLink($, item){
		// get original link
		var originalItemLink = $("a:contains('See original listing')");

		if (originalItemLink && originalItemLink[0] && originalItemLink[0].attribs && originalItemLink[0].attribs.href) {
			item.source = item.source || {};
			item.source.originalUrl =  $("a:contains('See original listing')")[0].attribs.href
		} else {
			util.logger.log("error", "Can not find original link", {itemID: item.id, link: item.link});
		}
	}

	// private methods
	function _makeSmallerImageUrl(url){
		return url.replace(/\d{3}\.jpg$/, util.getConfigValue("output").images.thumbnail + ".jpg");
	}

	// exports
	exports.thumbnail = thumbnail;
	exports.listedIn = listedIn;
	exports.originalLink = originalLink;

	module.exports = exports;
}());