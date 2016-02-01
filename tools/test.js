var program = require('commander');

	// program configuration
	program
		.version('0.0.1')
		.option('-t, --test', 'test mode')
		.option('-i, --noimages', 'do not download images')
		.parse(process.argv);

console.info(program);