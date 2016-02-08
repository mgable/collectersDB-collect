"use strict";
(function(){
	var exports = {};

	// includes
	var _ = require("underscore"),
		mail = require('./mail.js'),
		util = require('../lib/util.js'),
		startTime,
		endTime,
		dataStore;


	function makeReport(data){
		var results = "";

		if (data.error_file && data.error_file.length){
			results = _reportErrors(data.error_file);
		}

		if (data.info_file && data.info_file.length){
			dataStore = data.info_file;
			results += _reportWarnings(_.filter(data.info_file, {"level":"warn"}));
			results += _reportSystemDetails(_findMessage("System Details"));
			results += _reportJobDetails(_findMessage("Process Started"));
			results += _report("Fetching Raw Data");
			results += _report("Parsing Data");
			results += _reportSave("Saving Raw");
			results += _report("Starting Diff");
			results += _reportSave("Create diff file");
			results += _reportSave("Saving Diff");
			results += _report("Fetched Thumbnail Data");
			results += _report("Fetched Additional Image Data");
			results += _reportSave("Saving Diff");
			results += _reportSave("Saving Store");
			results += _report("Completed upload to Dynamo");
			results += _reportSave("Indexing Elasticsearch");
			results += _report("Bulk Import Completed");
			results += _reportCompleted(_findMessage( "End Process"),"End Process");
		}

		_sendReport(results);
	}

	function _findMessage(message){
		return _.find(dataStore, {"message": message});
	}

	function _reportSave(message){
		var report = _findMessage(message);
		return "<h3>" + message + " </h3>" + _format([_.omit(report, 'message')]);
	}

	function _report(message){
		var report = _findMessage(message),
			ok  = report ? "ok" : "NOT FOUND";
		return "<h3>" + message + ": "  + ok + "</h3>";
	}

	function _sendReport(report){
		mail.sendMail(report);
	}

	function _reportJobDetails(report){
		startTime = report.timestamp;
		return "<h3>Job Details: </h3>" + _format([report]);
	}

	function _reportCompleted(report){
		endTime = report.timestamp;
		return "<h3>End Process: " + endTime + "<br/>Total Time: " + msToTime(new Date(endTime) - new Date(startTime)) + "</h3>";
	}

	function _reportSystemDetails(report){
		return  "<h3>System Details: </h3>" + _format([report]);
	}

	function _reportWarnings(warnings){
		return "<h3>Warnings: " + warnings.length + "</h3>" + _format(warnings);
	}

	function _reportErrors(errors){
		return "<h3>Errors: <span style='color:red'> " + errors.length + "</span></h3>" + _format(errors);
	}

	function msToTime(s) {
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;

		return hrs + ':' + mins + ':' + secs; // + '.' + ms;
	}

	function _format(errors){
		var str = "";
		errors.forEach(function(error){
			var error = _.omit(error, 'level');
			for (var prop in error){
				str += "<div style='padding:0 0 0 20px'>" + prop + ": " + error[prop] + "</div>";
			}
			str += "<br/>";
		});

		return str;
	}

	exports.makeReport = makeReport;

	module.exports = exports;
})();