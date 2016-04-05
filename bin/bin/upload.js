"use strict";

(function(){
	var exports = {};

	// includes
	var request = require('request').defaults({ encoding: null }),
		s3UploadStream = require('s3-upload-stream'),
		util = require('../util.js'),
		AWS = require('aws-sdk');

	var fs = require("fs"),
		nodefs = require("node-fs");

	// assignments
	var credentials,
		s3Stream;


	// public methods
	function S3(uri, imagePath, filename, callback){
		var callback = callback || function(){}; // jshint ignore:line

		if(! credentials) {_init();}

		request.head(uri, function(err, res, body){

			if (err){
				console.error("XXXXXXX");
				console.error (err);
				util.logger.log("error", "AN error", {error: err});
			}

			if (res && res.headers && res.headers['content-length']){
				var fileSize = parseInt(res.headers['content-length'],10);
				util.logger.log('verbose', {filename: filename, uri: uri, imagesSize: fileSize});
				if (fileSize < 300){
					util.logger.log('error', "image size error", {filename: filename, uri: uri, imagesSize: fileSize});
				}
			}

			if (true){
				var imagePath = "/Users/markgable/Sites/data/";
				filename = filename.replace("/", "-");
				request(uri).pipe(fs.createWriteStream(imagePath + filename)).on('close', callback).on('error', function(err){
					util.logger.log("error", "imagedownload error", {error:err, imagePath: imagePath, filename: filename});
				});
			} else {
			
				var upload = s3Stream.upload({
					"Bucket": util.getS3Bucket(),
					"Key": imagePath + filename,
					"ContentType": util.getSysConfigValue('contentTypes').jpg
				});

				upload.on('error', function (error) {
					util.logger.log('error', error, {filename: __filename, method: "S3 - upload"});
					callback(uri, imagePath, filename, error);
				});

				upload.on('uploaded', function () {
					callback(uri, imagePath, filename);
				});

			 	request(uri).pipe(upload)
			 		.on('close', function(){callback(uri, imagePath, filename);})
			 		.on('error', function(error){
						util.logger.log('error', error, {filename: __filename, method: "S3 - rquest(uri)"});
						callback(uri, imagePath, filename, error);
				});
			}
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

	function _makeDirectories(path){
		nodefs.mkdirSync(path, "41777", true);
		return path + "/";
	}

	// exports
	exports.S3 = S3;

	module.exports = exports;
})();