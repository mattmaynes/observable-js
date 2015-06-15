/**
 * Test Configuration for Observable-JS
 */
module.exports = function(config){
	config.set({
		// The project root path. All file paths are relative to this path
		basePath		: '../',
		files			: ['src/*.js', 'test/*.spec.js'],
		plugins			: [
			'karma-jasmine', 
			'karma-coverage', 
			'karma-nested-reporter', 
			'karma-phantomjs-launcher'
		],
		browsers		: ['PhantomJS'],
		reporters		: [
			'progress', 
			'nested', 
			'coverage'
		],
		coverageReporter: {
			type : 'text-summary'
		},
		frameworks		: ['jasmine'],
		port			: 9876,
		singleRun		: true,
		preprocessors	: { 'src/*.js': 'coverage'}
	});
};
