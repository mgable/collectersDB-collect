"use strict";

(function(){
	var exports = {};

	var request = require('request'),
		util = require('../lib/util.js'),
		AWS = require('aws-sdk'),
		credentials = new AWS.SharedIniFileCredentials({profile: 'mgable'});

	// AWS configuration
	AWS.config.credentials = credentials;

	// undo config previously used for Dynamo
	AWS.config.update({
		region: undefined,
		endpoint: undefined
	});

	var s3Stream = require('s3-upload-stream')(new AWS.S3());

	function S3(uri, imagePath, filename, callback){
		var callback = callback || function(){}; // jshint ignore:line

		request.head(uri, function(){

			var upload = s3Stream.upload({
				"Bucket": util.getS3Bucket(),
				"Key": imagePath + filename,
				"ContentType": util.getContentType('jpg')
			});

			upload.on('error', function (error) {
				console.log(error);
			});

			upload.on('uploaded', function () {
				//console.log(details);
				console.info("done!!!!");
				callback(uri, imagePath, filename);
			});

		 	request(uri).pipe(upload).on('close', function(){console.info("pipe close callback");callback(uri, imagePath, filename);}).on('error', function(err){
				util.logger.log(err, 'error');
			});
		});
	}

	exports.S3 = S3;

	module.exports = exports;
})();