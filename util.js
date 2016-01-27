/* jshint shadow: true */

"use strict";

(function(){
	var AWS = require('aws-sdk'),
		fs  = require("fs"),
		nodefs = require("node-fs"),
		Q = require("q"),
		http = require("http"),
		url = require('url'),
		logger = require('./logging.js'),
		config = require('./config.js'),
		today = new Date(), 
		diffTable = config.sys_config.diffTable || "_diffs",
		rawTable = config.sys_config.rawTable || "_raw",
		storeTable = config.sys_config.storeTable || "_store",
		indexDirectory = config.sys_config.indexDirectory || "formatted/",
		imageDirectory = config.sys_config.imageDirectory || "store/images/",
		category = config.category,
		categoryName = category.name,
		categoryDirectory = categoryName,
		util = {};

	// AWS Dynamo setup
	
	
	// end setup

	function fetchPage(options){
		util.logger.log("fetching: " + options.path);

		var deferred = Q.defer(),
			container = "",
			req = http.request(options, function(res) {

				res.setEncoding('utf8');

				res.on('data', function (chunk) {
					container += chunk;
				});

				res.on('end', function(){
					return deferred.resolve(container);
				});

				res.on('error', function(err){
					util.logger.log(err, 'error');
				});
			});

		req.on('error', function(err) {
			util.logger.log(err, 'error');
			return deferred.reject(err);
		});

		// write data to request body
		req.write('data\n');
		req.end();

		return deferred.promise;
	}

	function generateUID() {
		return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4); // jshint ignore:line
	}

	function generateHashCode(s){
		return Math.abs(s.split("").reduce(function(a,b){a = ((a << 5) - a) + b.charCodeAt(0);return a & a}, 0));
	}

	function getFileName(suffix){
		var suffix =  suffix || "json";
		return categoryName + "." + suffix;
	}

	function getRequestObject(){
		return {
			host: config.domain,
			port: 80,
			path: getPageTemplate(config.category.id),
			method: 'POST',
			contentType: config.contentType.json
		};
	}

	function makeLocalImagePath(dateStr, id, filename){
		return makePathFromDateString(dateStr) + "/" + id + "/" + filename;
	}

	function getRawTable(){
		return getRoot() + rawTable;
	}

	function getStoreTable(){
		return getRoot() + storeTable;
	}

	function getImagePath(fileOverwrite){
		return getRoot() + "/" + imageDirectory +  makePathFromDateString(fileOverwrite || getDateString()) + "/";
	}

	function getDiffTable(){
		return getRoot() + diffTable;
	}

	function getIndexPath(){
		return "./" + indexDirectory;
		//return getRoot() 
	}

	function getRoot(){
		return categoryDirectory;
	}

	function makePathFromDateString(dateStr){
		var date = dateStr.match(/(\d{4})(\d{2})(\d{2})/);
		date.shift();
		return date.join("/");
	}

	function getDateString(d){
		var date = d || today;
		return date.getFullYear().toString() + pad(date.getMonth()+1) + pad(date.getDate());
	} 

	function pad(date){
		return ("00" + date).slice(-2);
	}

	function getFileContents(filename){
		if (!filename) {return false;}
			
		if (fileExists(filename)){
			var contents = fs.readFileSync(filename).toString();
			return contents ? JSON.parse(contents): false;
		} else {
			return false;
		}
	}

	function save(filename, path, file, data, contentType){ //filename, path, file, data, config.contentType.json
		//saveLocal(filename, path, file, data, contentType);
		saveToS3(filename, path, file, data, contentType);
	}


	function saveLocal(filename, path, file, data){
		makeDirectories(path); 
		fs.writeFileSync(file, data);
		logger.log("saving: " + file);
	}

	function getFromDynamo(keys, table){
		var deferred = Q.defer(),
			RequestItems = {};
		
		AWS.config.update({
		    region: config.aws.region,
		    endpoint: config.aws.dynamo.endpoint
		});

		var docClient = new AWS.DynamoDB.DocumentClient();

		console.info("getting from dynamo");
		
		RequestItems[table] = {Keys: keys, ConsistentRead: false};

		var params = {
		    RequestItems: RequestItems,
		    ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
		};
		
		docClient.batchGet(params, function(err, data) {
		    if (err) {
		    	//console.info(err); // an error occurred
		    	return deferred.reject(err);
			} else {
				//console.info(data); // successful response
				return deferred.resolve(data);
			}
		});

		return deferred.promise;
	}

	function saveToDynamo(key, table, data){
		AWS.config.update({
		    region: config.aws.region,
		    endpoint: config.aws.dynamo.endpoint
		});

		var docClient = new AWS.DynamoDB.DocumentClient();
		var params = {
			TableName: table,
			Item: {date: key, items: data},
			ExpressionAttributeNames:{"#date":"date"},
			ConditionExpression: 'attribute_not_exists(#date)'
		};

		docClient.put(params, function(err/*, data*/) {
			if (err) {
				var errorMsg = JSON.stringify(err, null, 2);
				console.error("Unable to add item. Error JSON:", errorMsg);
				util.logger.log("unable to save: " + table + ":" + key , 'error');
				util.logger.log("unable to save to data: " + errorMsg, 'error');
			} else {
				console.log("PutItem succeeded:");
				util.logger.log("saving to key: " + key);
				util.logger.log("saving to dynamo table: " + table);
			}
		});
	}

	function saveToS3(filename, path, file, data, contentType){
		console.info("saving to S3");
		var credentials = new AWS.SharedIniFileCredentials({profile: 'mgable'});
		AWS.config.credentials = credentials;

		var s3bucket = new AWS.S3({ params: {Bucket: config.aws.bucket}});
	
		s3bucket.upload({"Key": file, "Body": data, "ContentType": contentType}, function(err, data) { // jshint ignore:line
			if (err) {
				util.logger.log("ERROR - S3: " + file + ": " + err, 'error');
			} else {
				util.logger.log("saving - S3: " + file);
			}
		});
	}

	function getDataFromS3(uri){
		var deferred = Q.defer(),
			credentials = new AWS.SharedIniFileCredentials({profile: 'mgable'});
			AWS.config.credentials = credentials;

		var s3bucket = new AWS.S3({ params: {Bucket: config.aws.bucket}});

		console.info("getting S3 data from " + uri);

		s3bucket.getObject({"Key": uri,  ResponseContentType: config.contentType.json}, function(err, data) { // jshint ignore:line
			if (err) {
				util.logger.log("ERROR - S3: " + uri + ": " + err, 'error');
				return deferred.reject(err);
			} else {
				util.logger.log("getting - S3: " + uri);
				return deferred.resolve(data.Body.toString());
			}
		});

		return deferred.promise;

	}

	function fileExists(filePath){
	    try {
	        return fs.statSync(filePath).isFile();
	    } catch (err) {
	        return false;
	    }
	}

	function makeDirectories(path){
		nodefs.mkdirSync(path, "41777", true);
	}

	function readDirectory(path){
		return fs.readdirSync(path);
	}

	function getPageTemplate(id){
		return config.pageUrlTemplate.replace(/( \*{3}) config\.category\.id (\*{3} )/, id);
	}

	function makeOptions(urlstr){
		var urlObj = (url.parse(urlstr));

		var	options = {
			host: urlObj.host,
			port: 80,
			path: urlObj.path,
			method: 'GET',
			agent: false
		};

		return options;
	}

	util.saveLocal = saveLocal;
	util.saveToDynamo = saveToDynamo;
	util.getFromDynamo = getFromDynamo;
	util.getDataFromS3 = getDataFromS3;
	util.getIndexPath = getIndexPath;
	util.fetchPage = fetchPage;
	util.fileExists = fileExists;
	util.readDirectory = readDirectory;
	util.makeOptions = makeOptions;
	util.getDateString = getDateString;
	util.getFileContents = getFileContents;
	util.getFileName = getFileName;
	util.getRawTable = getRawTable;
	util.getStoreTable = getStoreTable;
	util.getDiffTable = getDiffTable;
	util.getImagePath = getImagePath;
	util.getRequestObject = getRequestObject;
	util.logger = logger;
	util.save = save;
	util.generateUID = generateUID;
	util.generateHashCode = generateHashCode;
	util.makeLocalImagePath = makeLocalImagePath;
	util.makeDirectories = makeDirectories;
	util.config = config;

	module.exports = util;

})();