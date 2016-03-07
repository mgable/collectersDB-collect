"use strict";

(function(){
	var exports = {};

	// includes
	var request = require('request'),
		s3UploadStream = require('s3-upload-stream'),
		util = require('../util.js'),
		AWS = require('aws-sdk'),
		credentials,
		s3Stream;


	// public methods
	function S3(uri, imagePath, filename, callback){
		var callback = callback || function(){}; // jshint ignore:line

		_init();

		request.head(uri, function(){

			var upload = s3Stream.upload({
				"Bucket": util.getS3Bucket(),
				"Key": imagePath + filename,
				"ContentType": util.contentTypes('contentTypes').jpg
			});

			upload.on('error', function (error) {
				util.logger.log('error', error, {filename: __filename, method: "S3 - upload"});
			});

			upload.on('uploaded', function () {
				callback(uri, imagePath, filename);
			});

		 	request(uri).pipe(upload).on('close', function(){callback(uri, imagePath, filename);}).on('error', function(err){
				util.logger.log(err, 'error', {filename: __filename, method: "S3 - rquest(uri)"});
			});
		});
	}

	// private methods
	function _init(){
		// AWS configuration
		var config = util.getConfigValue("aws");
		credentials = new AWS.SharedIniFileCredentials({profile: config.profile});
		AWS.config.credentials = credentials;

		// undo config previously used for Dynamo
		AWS.config.update({
			region: config.S3.region,
			endpoint: config.S3.endpoint
		});

		s3Stream = s3UploadStream(new AWS.S3());
	}

	// exports
	exports.S3 = S3;

	module.exports = exports;
})();