(function(){
  "use strict";

  var exports = {};

  var fs = require('fs'),
      fetch = require('../lib/fetch_data.js'),
      Configuration = require('../lib/configuration.js'),
      util = require('../bin/util.js'),
      source = "./fiesta_diffs_20160329.json",
      diff = JSON.parse(fs.readFileSync(source, 'utf8'));


Configuration.init().then(function(config){
    util.setConfig(config).then(function(){
      fetch.fetchImages(diff).then(function(data){
        console.info("done!!!");
        console.info(data.length);
      });
    });
  });

  module.exports = exports;
}());