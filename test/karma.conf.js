/**
 * Test Configuration for Observable-JS
 */
module.exports = function(config){
	config.set({
		basePath	: '../',
		plugins		: ['karma-jasmine', 'karma-nested-reporter', 'karma-phantomjs-launcher'],
		browsers	: ['PhantomJS'],
		reporters	: ['progress', 'nested'],
		frameworks	: ['jasmine'],
		port		: 9876,
		files		: ['src/*.js', 'test/*.spec.js']
	});
};
