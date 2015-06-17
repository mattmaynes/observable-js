/* global Observable */

/**
 * Jasmine test specification for Observable-JS
 */ 
describe('Observable-JS', function(){
	'use strict';

	var clock = {
		count	: 0,
		tick	: function(){
			return ++this.count;
		}
	};
	
	it('Tests creating an observable object', function(){
		Observable.create(clock);
		expect(clock.subscribe).toBeDefined();
		expect(clock.unsubscribe).toBeDefined();
		expect(clock.signal).toBeDefined();
	});

	it('Tests subscribing to an observable object', function(){
		var count = 0, message = '';
		var listener = clock.subscribe('tick');
		listener.onNext = function(tick){
			count = tick.count;
		};
		listener.onError = function(error){
			message = error.message;
		};

		clock.signal(Observable.NEXT, 'tick', { count : clock.tick() });
		clock.signal(Observable.ERROR, 'tick', { message : 'Error!' });
		clock.signal(Observable.NEXT, 'tock', { message : 'Never Used'});
		expect(count).toEqual(clock.count);
		expect(message).toEqual('Error!');
	});

	it('Tests signaling using different streams', function(){
		var count = 0, message = '', complete = false;
		var	listener = clock.subscribe('tock', { 
			onNext: function(tick){ 
				count = tick.count; 
			}
		});
		listener.onError = function(error){
			message = error.message;
		};
		listener.onComplete = function(){
			complete = true;
		};

		clock.signal(Observable.NEXT, 'tock', { count : clock.tick() });
		clock.signal(Observable.ERROR, 'tock', { message : 'Error: Forgot how to count!' });
		clock.signal(Observable.COMPLETE, 'tock');

		expect(count).toEqual(clock.count);
		expect(message).toEqual('Error: Forgot how to count!');
		expect(complete).toBeTruthy();
	});

	it('Tests unsubscribing from an observer', function(){
		var count = 0;
		var listener = clock.subscribe('tick',{
			onNext: function(tick){
				count = tick.count;
			}
		});

		clock.unsubscribe(listener);
		clock.signal(Observable.NEXT, 'tick', { count : clock.tick() });
		expect(count).toBe(0);
	});

	it('Tests unsubscribing from an observer before subscribing', function(){
		expect(clock.unsubscribe({})).toBeFalsy();
		expect(clock.unsubscribe()).toBeFalsy();
		expect(clock.unsubscribe({ _signals: ['tick']})).toBeFalsy();
		expect(clock.unsubscribe({ _signals: ['none']})).toBeFalsy();
	});

	it('Tests expected errors from an observer', function(){
		var source = Observable.create({}, { data : {}});

		expect(function(){return source.subscribe('pass');}).not.toThrow();
		expect(function(){return source.subscribe(123);}).toThrow();		

	});

	it('Tests target validation before signaling', function(){
		var source = Observable.create({});
		delete source._subs;
		expect(function(){return source.signal(Observable.NEXT, 'data');}).toThrow();
		delete source._signals;
		expect(function(){return source.signal(Observable.NEXT, 'data');}).toThrow();
	});

	it('Tests async signals', function(){
		var source = Observable.create({}, { data : {async : true}});
		var expected = [], actual = [];
		var signal = function(x){
			source.signal(Observable.NEXT, 'data', {value : x});
		};

		source.subscribe('data', {
			onNext : function(data){
				actual.push(data.value);
			}
		});

		for(var i = 0; i < 100; i++){
			expected.push(i);
			setTimeout(signal.bind(null, i), i);
		}

		// Wait at least 300ms before checking the output so that all async events
		// have completed
		setTimeout(function(){
			expect(actual).toEqual(expected);
		}, 300);
	});

});
