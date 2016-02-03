"use strict";

(function(){
	var exports = {};

	// includes
	var Q = require("q"),
		cheerio = require('cheerio'),
		util = require('./util.js'),
		_ = require('underscore');

		// extends date prototype
		require('datejs');

	// assignements
	var _make = {};
	_make.float = _makeFloat;
	_make.date = _makeDate;
	_make.integer = _makeInteger;
	_make.string = _makeString;

	// public methods
	function parse(data){
		var deferred = Q.defer();
		if (_isParsed(data)){
			console.info("existing raw file - no parsing necessary!!!");
			deferred.resolve(data);
		} else {
			util.logger.log("parsing raw data");
			var	$ = cheerio.load(data),
				results = $("a").map(function(a,b){return _remap(b);}).get(),
				filteredResults = results.filter(function(item){ if (item){return item;}});

			deferred.resolve(filteredResults);
		}

		return deferred.promise;
	}

	// private methods
	function _isParsed(data){
		return (_.isArray(data)) ? true : false;
	}

	function _remap(data){
		var obj = {};
		obj.title = _removeDoubleEscape(data.children[1].data); //title
		obj.link = _decodeLink(data.attribs.href); //link to item
		obj.id = util.generateHashCode(obj.link);
		obj.meta = _makeSaleData(_removeDoubleEscape(data.attribs.x)); //selling price / time of sale / bids / watchers
		obj.src = _decodeLink(data.children[0].attribs.src); // image src

		obj.meta.date = {
			"formatted": _getDate(obj.meta.date.replace(/^\-/,'').toLowerCase()).toISOString(),
			"origin": obj.meta.date
		};

		if (!obj.src || !obj.title || !obj.link) {
			return false;
		}

		return obj;
	}

	function _decodeLink(link){
		return _removeDoubleEscape(decodeURIComponent(link).replace(/\\(.)/g,"$1")).replace(/\"/g,"");
	}

	function _removeDoubleEscape(link){
		return link.replace(/\\(.)/g,"$1");
	}

	function _makeSaleData(line){
		var obj = {}, 
		 	attributes = [{name: "price", type: "float"},{name: "date", type: "string"}, {name: "bids", "type": "integer"},{name: "watchers", type: "integer"}];

		line.replace(/[^\/]*/g, function(data){
			if (data){
				var attribute = attributes.shift();			
				obj[attribute.name] = _make[attribute.type](data);
		 	}
		});
		 
		 return obj;
	}

	function _makeFloat(num){
		return Math.round(parseFloat(num.replace(/,/,"")) * 100);
	}

	function _makeDate(date){
		return new Date(date);
	}

	function _makeInteger(num){
		return parseInt(num, 10);
	}

	function _makeString(str){
		return str.toString();
	}

	function _getDate(which){
		try {
			return eval("Date.today().last()." + which + "()"); // jshint ignore:line
		}catch(e){
			return Date.today();
		}
	}

	exports.parse = parse;

	module.exports = exports;
})();