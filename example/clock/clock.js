/*
The MIT License (MIT)

Copyright (c) 2015 Matthew Maynes & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Observable = require('../../src/observable.js');

var Clock = function(){
	'use strict';
	var obs;

	/**
	 * The maximum number of ticks to emit before stopping
	 * @type {number}
	 */
	this._maxTicks = 10;
	
	// Make this object observable
	obs = Observable.create(this);

	// Add a tick signal for every heartbeat this clock will emit
	obs.addSignal('tick', { async : true });
};


/**
 * Starts this clock ticking. Each tick is a second apart
 *
 * @param [maxTicks] {number} The maximum number of ticks [default: 10]
 */
Clock.prototype.start = function(maxTicks){
	'use strict';
	var nTicks = maxTicks || this._maxTicks;
	
	for(var i = 0; i <= nTicks; i++){
		if(i === nTicks){
			setTimeout(this.signal.bind(this, Observable.COMPLETE, 'tick'), 1000 * (i+1));
		}
		else{
			setTimeout(this._tick.bind(this, i), 1000 * (i + 1));
		}
	}
};

/**
 * Emits a tick to all subscribers with the current tick count
 *
 * @param current {number} The current tick
 * @private
 */
Clock.prototype._tick = function(current){
	'use strict';
	this.signal(Observable.NEXT, 'tick', { tick : current, time : new Date().getTime() });
};


module.exports = Clock;
