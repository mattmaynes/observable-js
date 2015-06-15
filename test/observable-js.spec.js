/**
 * Jasmine test specification for Observable-JS
 */ 
describe('Observable-JS', function(){
	
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
		expect(clock.unsubscribe()).toBeTruthy();
	});

	it('Tests expected errors from an observer', function(){
		var source = Observable.create({}, ['data']);
		var delegate = {};

		expect(function(){return source.subscribe('fail');}).toThrow();
		expect(function(){return source.subscribe(123);}).toThrow();
		
		// By removing the subscribers from the source it is not considered
		// a source object any more
		var sigs = source['_signals'];
		delete source['_signals'];
		
		expect(function(){return source.subscribe('data');}).toThrow();
		source['_signals'] = sigs;
		expect(source.subscribe('data', delegate)).toEqual(delegate);

	});

});
