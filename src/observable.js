var Observable = (function(){
	'use strict';
	
	/**
	 * This is the observable object. Observable follows a 
	 * singleton pattern so this object represents the public
	 * API of Observable.
	 *
	 * @type {object}
	 */
	var self = {
		NEXT		: 'NEXT',
		ERROR		: 'ERROR',
		COMPLETE	: 'COMPLETE'
	};

	/* public */

	/**
	 * Makes the target object observable. This adds the observable
	 * functions to the target and allows other objects to listen
	 * to it.
	 *
	 * @param target	{object}	The object to make observable
	 * @param [events]	{Array}		An explicit definition of the
	 * events that the target will offer. If these are specified
	 * and a subscriber tries to listen to an undefined event
	 * then an error will be thrown. If this is not defined then
	 * subscribers can listen to any arbitrary event
	 * @end
	 */
	self.create = function (target, events){
		
		/**
		 * The target maintains its own state. This holds all of
		 * the subscribers observing the target.
		 * 
		 * @type {object}
 		 */
		target._subs = {};

		/**
		 * Maintains all of the signals for this target. This is 
		 * used for validation of subscriptions. If no event 
		 * filtering is used for this observable then this 
		 * object is ignored
		 *
		 * @type {Array}
		 */
		target._signals = [];

		/**
		 * Subscribes the given delegate to the signal specified.
		 * The delegate object is returned and can be modified 
		 * at a later time.
		 *
		 * @param signal		{string}	Signal to observe
		 * @param [delegate]	{object}	Signal delegate 
		 * handle onNext, onError and onComplete events
		 * @end
		 *
		 * @return {object} The subscription delegate
		 *
		 * @throws error if the signal is not defined in this 
		 * objects observable signals.
		 * @end
		 */
		target.subscribe = function(signal, delegate){
			_checkTarget(this);
			_checkSignal(this, signal);
			
			// If we get here then the signal is valid
			delegate = delegate || {};
			_addSub(this, signal, delegate);

			return delegate;
		};

		/**
		 * Unsubscribes the given delegate from this observable.
		 * Returns if the delegate was removed or not (i.e. if
		 * it existed in the first place).
		 *
		 * @param {object} The delegate object to unsubscribe
		 *
		 * @return {boolean} If the delegate was removed
		 *
		 * @throws error if this object is not observable
		 */
		target.unsubscribe = function(delegate){
			var index;
			_checkTarget(this);

			for(var key in this._subs){
				if(this._subs.hasOwnProperty(key)){
					index = this._subs[key].indexOf(delegate);
					if(index >= 0){
						this._subs.splice(index, 1);
						return true;
					}
				}
			}
			return false;
		};

		

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
	function _isObs(target){
		return 
			target			!== undefined && 
			target._signals !== undefined &&
			target._subs	!== undefined;
	}

	/**
	 * Checks if the target is observable and if not
	 * then throws an error
	 *
	 * @param target {object} The object to check
	 *
	 * @throws error if the target is not observable
	 * @private
	 */
	function _checkTarget(target){
		if(!_isObs(target){
			throw 'Target object is not observable';	
		}
	}

	/**
	 * Ensures that the observation specified is within
	 * the targets signal set
	 * 
	 * @param target {object} Validation source
	 * @param signal {string} Signal to validate
	 *
	 * @throws error if the target will not accept the signal
	 * @private
	 */
	function _checkSignal(target, signal){
		if('string' === typeof signal){
			throw 'Signal must be a string';
		}
		else if(target._signals.length > 0 && target._signals.indexOf(signal) === -1){
			throw 'Invalid subscription signal: ' + signal;
		}
	}

	/**
	 * Adds a subscription to the target object. If there 
	 * is no existing subscription for the given signal 
	 * then one is added
	 * 
	 * @param target	{object}	Observable target
	 * @param signal	{string}	Observable signal
	 * @param delegate	{object}	Signal delegate
	 *
	 * @private
	 */
	function _addSub(target, signal, delegate){
		target._subs[signal] = target._subs[signal] ? target._subs[signal].push(delegate) : [delegate];
	}

	return self;
})();
