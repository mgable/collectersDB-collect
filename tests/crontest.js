"use strict";
(function(){
	var util = require('../lib/util.js');

	util.logger.addLogFile(__dirname + '/../logs/test.log')

	util.logger.log("test message");
	util.logger.log("test error", "error");
})();