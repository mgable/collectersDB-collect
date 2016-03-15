(function(){
  "use strict";

  var exports = {};

  var fs = require('fs'),
      fetch = require('../bin/fetch.js'),
      Configuration = require('../lib/configuration.js'),
      util = require('../bin/util.js'),
      source = "./fiesta_test_store.json",
      diff = JSON.parse(fs.readFileSync(source, 'utf8'));


Configuration.init().then(function(config){
    util.setConfig(config).then(function(){
      var imagePath = util.getImagePath();
      fetch.thumbnails(diff, imagePath).then(function(data){
        console.info("done!!!");
        console.info(data.length);
      });
    });
  });

  module.exports = exports;
}());