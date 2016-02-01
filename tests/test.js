"use strict";
(function(){
	var data = [{"title":"Vintage Austin Powder Co. Rifle Gun Powder Green Bird Tin Cleveland Ohio","link":"http://roverXXXXX.ebay.com/rover/1/711-53200-19255-0/1?campid=5336393622&toolid=10013&customId=advertising/tins&mpre=http://www.ebay.com/itm/272112943015","id":70108148,"meta":{"price":54689,"date":{"formatted":"2016-01-27T00:00:00.000Z","origin":"-Wednesday"},"bids":12,"watchers":39},"src":"http://thumbs4.ebaystatic.com/m/mb17TEOSxTlsrEJPr5c2bWQ/140.jpg"},{"title":"Tin Sunny Brook Pure Rye Whiskey Match Holder And Strike H.d Beach Coshockton O.","link":"http://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=5336393622&toolid=10013&customId=advertising/tins&mpre=http://www.ebay.com/itm/301849905090","id":1125396731,"meta":{"price":50100,"date":{"formatted":"2016-01-23T00:00:00.000Z","origin":"-Saturday"},"bids":21,"watchers":70},"src":"http://thumbs3.ebaystatic.com/m/mi0CLvEXqXK_NP8oXAHuwHA/140.jpg"},{"title":"1890's Black Americana / African American Hair Tobacco Tin Pail Tin Lithograph","link":"http://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=5336393622&toolid=10013&customId=advertising/tins&mpre=http://www.ebay.com/itm/191785294757","id":365343018,"meta":{"price":50000,"date":{"formatted":"2016-01-24T00:00:00.000Z","origin":"-Sunday"},"bids":1,"watchers":5},"src":"http://thumbs2.ebaystatic.com/m/mik2HfcwQ7SjTkuc1dShZYQ/140.jpg"}]
	var fetch = require('../lib/fetch.js');



	fetch.fetchImageData(data).then(function(results){
		console.info("results are");
		console.info(JSON.stringify(results));
	})




})();