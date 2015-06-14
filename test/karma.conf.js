/**
 * Test Configuration for Observable-JS
 */
module.exports = function(config){
	config.set({
		basePath	: '../',
		plugins		: ['karma-jasmine', 'karma-phantomjs-launcher'],
		browsers	: ['PhantomJS'],
		frameworks	: ['jasmine'],
		port		: 9876,
		files		: ['src/*.js', 'test/*.spec.js']
	});
};
