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

});
