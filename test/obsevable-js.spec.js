/**
 * Jasmine test specification for Observable-JS
 */ 
describe('Observable-JS', function(){
	
	var clock = {
		count	: 0,
		tick	: function(){
			this.count++;
		}
	};
	
	it('Tests creating an observable object', function(){
		Observable.create(clock);
		expect(clock.subscribe).toBeDefined();
		expect(clock.unsubscribe).toBeDefined();
		expect(clock.signal).toBeDefined();
	});

	it('Tests subscribing to an observable object', function(){
		var count = 0;
		var listener = clock.subscribe('tick');
		listener.onNext = function(tick){
			count = tick.count;
		};
		
		clock.signal(Observable.NEXT, 'tick', { count : clock.count });
		
		expect(count).toEqual(clock.count);

	});

});
