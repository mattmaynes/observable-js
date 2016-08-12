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

var Observable = (function () {
    'use strict';

    /**
     * This is the observable object. Observable follows a singleton pattern
     * so this object represents the public API of Observable. There are 3
     * defined event streams for each available signal.
     *
     * @type {object}
     */
    var self = {
        NEXT		: 'onNext',
        ERROR		: 'onError',
        COMPLETE	: 'onComplete'
    };

    /* public */

    /**
     * Forwards a signal from one target to another.
     *
     * @param origin    {Observable}    Observable origin to forward signals from
     * @param target    {Observable}    Observable target to attach delegates to
     * @param signal    {string}        ID of signal to forward
     * @param transform {function}      Transformation of stream data
     */
    self.forward = function (origin, target, signal, transform) {
        _checkTarget(origin);
        _checkTarget(target);
        signal = 'string' === typeof signal ? { from : signal, to : signal } : signal;

        origin.subscribe(signal.from, _forward(signal.to, target, transform));
        return target;
    };

    /**
     * Forwards all signals from the origin to the new target. The given transformation
     * function will be applied to all data that is signalled
     *
     * @param origin    {Observable}    Observable origin to forward signals from
     * @param target    {Observable}    Observable target to attach delegates to
     * @param transform {function}      Transformation of stream data
     */
    self.forwardAll = function (origin, target, transform) {
        for (var signal in origin._signals) {
            self.forward(origin, target, signal, transform);
        }
        return target;
    };

    /**
     * Makes the target object observable. This adds the observable functions
     * to the target and allows other objects to listen to it.
     *
     * @param [target]	{object}	The object to make observable
     * @param [signals]	{object}	An explicit definition of the events that
     * the target will offer. Each signal can have individual properties.
     * @end
     *
     * @return {object} The new observable object
     */
    self.create = function (target, signals) {
        target = target || {};

        /**
         * The target maintains its own state. This holds all of the
         * subscribers observing the target.
         *
         * @type {object}
         */
        target._subs = target._subs || {};

        /**
         * Maintains all of the signals for this target and any properties
         * associated with each signal.
         *
         * @type {object}
         */
        target._signals = target._signals || {};

        // If there are signals provided as an argument then add them
        // to the set of registered signals. If the data passed in
        // is an array then make a key for each element.
        if (signals) {
            if (signals instanceof Array) {
                signals.forEach(function (key) {target._signals[key] = {};});
            }
            else{
                _extend(target._signals, signals);
            }
        }

        /**
         * Subscribes the given delegate to the signal specified. The delegate
         * object is returned and can be modified at a later time.
         *
         * @param signal		{string}	Signal to observe
         * @param [delegate]	{object}	Signal delegate handle onNext,
         * onError and onComplete events
         * @end
         *
         * @return {object} The subscription delegate
         *
         * @throws error if the signal is not defined in this objects
         * observable signals.
         * @end
         */
        target.subscribe = function (signal, delegate) {
            _checkTarget(this);
            _checkSignal(this, signal);

            // If we get here then the signal is valid
            return _addSub(this, signal, delegate || {});
        };

        /**
         * Unsubscribes the given delegate from this observable. Returns if the
         * delegate was removed or not (i.e. if it existed in the first place).
         * If no delegate is provided then all delegates are unsubscribed
         *
         * @param [delegate] {object} The delegate object to unsubscribe
         *
         * @return {boolean} If the delegate was removed
         *
         * @throws error if this object is not observable
         */
        target.unsubscribe = function (delegate) {
            var index, signal;
            _checkTarget(this);

            if (!delegate || !delegate._signals) {
                return false;
            }

            for(var i in delegate._signals) {
                signal = delegate._signals[i];
                index  = signal in this._subs ? this._subs[signal].indexOf(delegate) : -1;
                if (index >= 0) {
                    this._subs[signal].splice(index, 1);
                    return true;
                }
            }
            return false;
        };

        /**
         * Unsubscribes all listeners from this observable object
         */
        target.unsubscribeAll = function () {
            this._subs = {};
        };


        /**
         * Adds a signal with the target obeservable applying the given
         * options. The available options are listed below. If the signal
         * already exists then the options will be applied to the curent
         * signal.
         *
         * @param signal	{string} The name of the signal to register
         * @param options	{object} Avaialable options:
         * async {boolean} If this signal should be executed asynchronously
         * @end
         *
         * @return The signal object
         */
        target.addSignal = function (signal, options) {
            _checkTarget(this);
            _checkSignal(this, signal);

            this._signals[signal] = _extend(
                this._signals[signal] || {},
                options	|| {}
            );
            this._subs[signal] = this._subs[signal] || [];
            return this._signals[signal];
        };


        /**
         * Removes the given signal from this object. Returns if the signal
         * was removed successfully
         *
         * @param signal {string} The signal to remove
         *
         * @return {boolean} If the unregister was successful
         */
        target.removeSignal = function (signal) {
            _checkTarget(this);
            _checkSignal(this, signal);
            return delete this._signals[signal];
        };

        /**
         * Sends a signal to all listeners for the given stream and observation
         *
         * @param stream	{string} Signal stream (i.e. NEXT)
         * @param signal	{string} Observation identifier
         * @param [data]	{object} A data object to pass to any delegate
         * functions. The structure of this object arbitrary
         * @end
         *
         *
         * @throws error if signal is not a string
         *
         * @example
         * this.signal(Observable.NEXT, 'data' { message : 'Hello, World!'});
         * @end
         *
         */
        target.signal = function (stream, signal, data) {
            _checkTarget(this);
            _checkSignal(this, signal);

            // Ensure that the signal exist before emitting it
            this._signals[signal] = this._signals[signal] || {};
            _signal(this, stream, signal, typeof data === 'undefined' ? {} : data);
        };

        return target;
    };

    /* private */


    /**
     * Checks if the given target is observable or not
     *
     * @param target {object} Object to examine
     *
     * @return {boolean} If the target is observable
     * @private
     */
    function _isObs (target) {
        return target		!== undefined &&
            target._signals !== undefined &&
            target._subs	!== undefined;
    }

    /**
     * Checks if the target is observable and if not then throws an error
     *
     * @param target {object} The object to check
     *
     * @throws error if the target is not observable
     * @private
     */
    function _checkTarget (target) {
        if (!_isObs(target)) {
            throw new Error('Target object is not observable');
        }
    }

    /**
     * Ensures that the observation specified is within the targets signal set
     *
     * @param target {object} Validation source
     * @param signal {string} Signal to validate
     *
     * @throws error if the target will not accept the signal
     * @private
     */
    function _checkSignal (target, signal) {
        if ('string' !== typeof signal) {
            throw new Error('Signal must be a string');
        }
    }

    /**
     * Adds a subscription to the target object. If there is no existing
     * subscription for the given signal then one is added
     *
     * @param target	{object}	Observable target
     * @param signal	{string}	Observable signal
     * @param delegate	{object}	Signal delegate
     *
     * @return {object} The delegate object
     * @private
     */
    function _addSub (target, signal, delegate) {

        // If the delegate is a function then put it in the
        // onNext channel of the delegate
        if (typeof delegate === 'function') {
            delegate = { onNext : delegate };
        }

        // If there are already signals in this delegate then add a new one
        if (delegate._signals) {
            delegate._signals.push(signal);
        }
        else {
            delegate._signals = [signal];
        }

        // If there are no signals then add a new one
        if (target._subs[signal]) {
            target._subs[signal].push(delegate);
        }
        else {
            target._subs[signal] = [delegate];
        }

        return delegate;
    }

    /**
     * Signals the delegates of the target object on the given event stream
     *
     * @param target	{object}	Observable target
     * @param stream	{string}	Signal stream
     * @param signal	{string}	Observable signal
     * @param data		{object}	Signal data
     *
     * @private
     */
    function _signal (target, stream, signal, data) {
        // Get all of the delegates for the specific signal
        var delegates = target._subs[signal] || [];

        // Determine if the signal is synchronous or not. Sync by default
        var emitter	= target._signals[signal].async ? _emitAsync : _emitSync;

        delegates.forEach(function (delegate) {
            emitter(target, stream, data, delegate);
        });
    }

    /**
     * Emits a single synchronous event on the given event stream sending the
     * defined data object
     *
     * @param target	{object}	Observable target
     * @param stream	{string}	Signal stream
     * @param data		{object}	Signal data
     * @param delegate	{object}	Delegate target
     *
     * @private
     */
    function _emitSync (target, stream, data, delegate) {
        var listener = delegate[stream];
        if ('function' === typeof listener) {
            listener(data, target);
        }
    }

    /**
     * Emits a single event asynchronously
     *
     * @param target	{object}	Observable target
     * @param stream    {string}    Signal stream
     * @param data      {object}    Signal data
     * @param delegate  {object}    Delegate target
     *
     * @private
     */
    function _emitAsync (target, stream, data, delegate) {
        // Runs a synchronous call in a different execution stack immediately
        setTimeout(_emitSync.bind(null, target, stream, data, delegate), 0);
    }

    /**
     * Extends the base object to include all values from the
     * extension. Any existing properties are overwritten
     *
     * @param base	{object} Base object to extend
     * @param ext	{object} Extension to add to the base
     *
     * @return {object} The extended object
     */
    function _extend (base, ext) {
        for (var key in ext) {
            base[key] = ext[key];
        }
        return base;
    }

    /**
     * If the input is undefined then returns the identity function.
     * Otherwise, returns the input
     *
     * @param transform {function} Function to check
     * @return {function} Identity or transform
     */
    function _transform (transform) {
        if (!transform) {
            return function (x) { return x; };
        }
        return transform;
    }

    function _forward (signal, target, transform) {
        transform = _transform(transform);
        return {
            onNext      : function (data) { target.signal(self.NEXT, signal, transform(data)); },
            onError     : function (data) { target.signal(self.ERROR, signal, transform(data)); },
            onComplete  : function (data) { target.signal(self.COMPLETE, signal, transform(data)); }
        };
    }

    return self;
}());

// If in node then export observable
if ('undefined' !== typeof module) { module.exports = Observable; }
