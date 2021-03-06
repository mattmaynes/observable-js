/* global Observable */

/**
 * Jasmine test specification for Observable-JS
 */
describe('Observable-JS', function(){
    'use strict';

    var clock;

    beforeEach(function(){
        clock = {
            count	: 0,
            tick	: function(){
                return ++this.count;
            }
        };

        Observable.create(clock);
    });

    describe('Subscription', function () {
        it('Tests creating an observable object', function(){
            expect(clock.subscribe).toBeDefined();
            expect(clock.unsubscribe).toBeDefined();
            expect(clock.signal).toBeDefined();
        });

        it('Tests creating an observable object with keys', function(){
            var foo = {}, bar = {};
            Observable.create(foo, ['a', 'b', 'c']);

            expect(foo._signals).toEqual({
                a : {},
                b : {},
                c : {}
            });

            Observable.create(bar, { a : { async : true }, b : {} });
            expect(bar._signals).toEqual({
                a : { async : true },
                b : {}
            });

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

        it('Tests subscribing to different events with the same observer', function(){
            var count = 0;
            var listener = clock.subscribe('tick');
            listener.onNext = function(tick){
                count = tick.count;
            };

            clock.subscribe('tock', listener);

            clock.signal(Observable.NEXT, 'tick', { count : clock.tick() });
            expect(count).toEqual(clock.count);
            clock.signal(Observable.NEXT, 'tock', { count : 100 });
            expect(count).toEqual(100);
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


        it('Tests unsubscribing all observers from an observable', function(){
            clock.subscribe('tick');
            clock.unsubscribeAll();
            expect(clock._subs).toEqual({});
        });

        it('Adds a signal and subscribes to it', function () {
            var listener = {
                onNext: function() {}
            };

            spyOn(listener, 'onNext');

            clock.addSignal('tick');
            clock.subscribe('tick', listener);
            clock.signal(Observable.NEXT, 'tick');
            expect(listener.onNext).toHaveBeenCalled();
        });
    });

    describe('Signals', function () {
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

        it('Tests adding a new signal to an object', function(){
            var source = Observable.create();
            var signal = source.addSignal('data');
            signal.async = true;

            expect(source._signals.data.async).toBe(true);

            expect(function(){return source.addSignal(123);}).toThrow();


            delete source._subs;
            expect(function(){return source.addSignal('hello');}).toThrow();
            delete source._signals;
            expect(function(){return source.addSignal('goodbye');}).toThrow();
        });

        it('Tests removing a signal from an object', function(){
            var source = Observable.create();
            source.addSignal('data');

            expect(source._signals.data).toBeDefined();
            expect(source.removeSignal('data')).toBeTruthy();
            expect(source._signals.data).toBeUndefined();

        });

        it('Tests async signals', function(done){
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
                done();
            }, 300);
        });

        it('Tests subscribing using a function', function(){
            var source = Observable.create({}, ['data']);
            var data = 'abc123';
            source.subscribe('data', function(){
                expect(data).toBe(data);
            });

            source.signal(Observable.NEXT, 'data', data);
        });

   });

    describe('Forwarding', function () {
        var broker, observer;

        beforeEach(function () {
            broker = {};

            observer = {
                onNext      : function () {},
                onError     : function () {},
                onComplete  : function () {}
            };

            Observable.create(broker);

        });

        it('Tests forwarding a single onNext event', function () {
            spyOn(observer, 'onNext');

            Observable.forward(clock, broker, 'tick');
            broker.subscribe('tick', observer);

            clock.signal(Observable.NEXT, 'tick');
            expect(observer.onNext).toHaveBeenCalled();
        });

        it('Tests forwarding a single event on all streams', function () {
            spyOn(observer, 'onNext');
            spyOn(observer, 'onError');
            spyOn(observer, 'onComplete');

            Observable.forward(clock, broker, 'tick');
            broker.subscribe('tick', observer);

            clock.signal(Observable.ERROR, 'tick');
            clock.signal(Observable.COMPLETE, 'tick');
            expect(observer.onError).toHaveBeenCalled();
            expect(observer.onComplete).toHaveBeenCalled();
            expect(observer.onNext).not.toHaveBeenCalled();
        });

        it('Tests forwarding all of the signals', function () {
            spyOn(observer, 'onNext');
            spyOn(observer, 'onComplete');

            clock.addSignal('tick');
            clock.addSignal('tock');

            Observable.forwardAll(clock, broker);
            broker.subscribe('tick', observer);
            broker.subscribe('tock', observer);

            clock.signal(Observable.NEXT, 'tick');
            expect(observer.onNext).toHaveBeenCalled();

            clock.signal(Observable.COMPLETE, 'tock');
            expect(observer.onComplete).toHaveBeenCalled();
        });

        it('Tests transform functions', function () {
            spyOn(observer, 'onNext');

            Observable.forward(clock, broker, 'tick', function (x) { return x + 1; });
            broker.subscribe('tick', observer);

            clock.signal(Observable.NEXT, 'tick', 1);
            expect(observer.onNext).toHaveBeenCalledWith(2, broker);
        });


        it('Tests forwarding to a different stream', function () {
            spyOn(observer, 'onNext');

            Observable.forward(clock, broker, { from : 'tick', to : 'tock' });
            broker.subscribe('tock', observer);

            clock.signal(Observable.NEXT, 'tick', observer);
            expect(observer.onNext).toHaveBeenCalled();
        });

    });
});
