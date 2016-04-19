(function(){
"use strict";

function test(){
	console.info("this should be undefined");
	console.info(this)
}

//test();
})()

function test(){
	console.info("this should be the global object");
	console.info(this)
}

//test();


var test_again = () => {
	console.info("this is the global object");
	console.info(this)
}

test_again();