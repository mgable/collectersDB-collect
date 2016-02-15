"use strict";

(function(){

    var util = require('../lib/util.js'),
    fetch = require('../lib/fetch.js'),
    parser = require('../lib/parser.js'),
    diff = require('../lib/diff.js'),
    save = require('../lib/save.js'),
    make = require('../lib/make.js'),
    start = require('../lib/start.js'),
    finish = require('../lib/finish.js'),
    Q = require('q'),
    
    // definitions
    fetchImageData = fetch.fetchImageData,
    saveStore = save.saveStore,
    fetchImages = fetch.fetchImages,
    makeIndex = make.makeIndex,
    category = 'advertising_tins';

    util.getRequest(category);

  var diff = [{
      "id": 553434245,
      "link": "http://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=5336393622&toolid=10013&customId=advertising/tins&mpre=http://www.ebay.com/itm/281929922622",
      "meta": {
        "bids": 8,
        "date": {
          "formatted": "2016-02-15T00:00:00.000Z",
          "origin": "-11 hours ago"
        },
        "price": 20350,
        "watchers": 13
      },
      "src":  "http://i.ebayimg.com/images/g/X9EAAOSwG-1Wt-dY/s-l140.jpg",
      "title": "Vtg Unopened Spotlight Coffee Tin Can Sealed And Full Key On Bottom"
    }]


function startProcess(data){
  console.info("starting");
    var deferred = Q.defer();
    deferred.resolve(data);
    return deferred.promise;
  }

startProcess(diff)
    .then(fetchImageData)
    .then(saveStore)
    .then(fetchImages)
    .then(makeIndex);

}());