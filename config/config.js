(function(){
	"use strict";

	var exports = {};

	// assignments
	var boss = "http://54.67.31.82:3000/users",
		contentTypes = {
			"html": "text/html; charset=UTF-8",
			"json": "application/json; charset=UTF-8",
			"jpg": "image/jpeg"
		};

	// exports
	exports.boss = boss;
	exports.contentTypes = contentTypes;

	module.exports = exports;
}());