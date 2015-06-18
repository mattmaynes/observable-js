/**
 * Test Configuration for Observable-JS
 */
module.exports = function(config){
	'use strict';

	config.set({
		// The project root path. All file paths are relative to this path
		basePath		: '../',
		files			: ['test/patch/*.js', 'src/*.js', 'test/*.spec.js'],
		plugins			: [
			'karma-jasmine', 
			'karma-coverage',
			'karma-nested-reporter', 
			'karma-phantomjs-launcher'
		],
		browsers		: ['PhantomJS'],
		reporters		: [ 
			'nested', 
			'coverage'
		],
		coverageReporter: {
			dir: 'build/reports/coverage',
			reporters: [
				{ type : 'text' },
				{ type : 'lcov', file : 'lcov.info'}
			]
		},
		frameworks		: ['jasmine'],
		port			: 9876,
		singleRun		: true,
		preprocessors	: { 'src/*.js': 'coverage'}
	});
};
