"use strict";

(function(){
	var program = require('commander'),
		_ = require('underscore'),
		Q = require("q"),
		util = require("./util.js");

	program
		.version('0.0.1')
		.option('-f, --full', 'make full index')
		.parse(process.argv);

	var	storeFilePath = util.getStoreFilePath(),
		storeFileName = util.getFileName(),
		storeFile = storeFilePath + storeFileName,
		diffFilePath = util.getDiffPath(),
		diffFile = diffFilePath + storeFileName,
		index = []; // only used when making full index

	init();

	function init(){
		var promises = [];

		if (program.full){
			fullIndex().then(function(files){
				files.forEach(function(file){
					promises.push(util.getDataFromS3(file).then(parse).then(addToStore));
				});

				Q.allSettled(promises).then(function(){save(index)})
			});

		} else {
			getDataFromS3();
		}
	}

	function getDataFromS3(){
		var diffPromise = util.getDataFromS3(diffFile).then(parse),
			storePromise = util.getDataFromS3(storeFile).then(parse);

		Q.allSettled([diffPromise, storePromise]).then(function(data){
			var diff = data[0].value,
			store = data[1].value || [];

			save(simpleIndex(diff, store));
			
		});
	}

	function parse(data){
		var results = JSON.parse(data.toString());
		return results;
	}
	
	function save(data){
		util.save(storeFileName, storeFilePath, storeFile, JSON.stringify(data), util.config.contentType.json); //filename, path, file, data, contentType
	}

	function simpleIndex(store, diff){
		util.logger.log("making simple index");
		return store.concat(diff);
	}

	function addToStore(data){
		index = index.concat(data);
	}

	function fullIndex(){
		util.logger.log("making full index");
		var results = [],
			diffDirectory = util.getDiffDirectory();

		return util.readS3Bucket({Bucket: util.config.aws.bucket, Prefix: diffDirectory}).then(function(data){
			var files = (_.pluck(data.Contents, "Key"));
			return files;
		});
	}
})();