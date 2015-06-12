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
		 */
		target.subscribe = function(signal, delegate){
			_checkSignal(target, signal);
			
			// If we get here then the signal is valid
			delegate = delegate || {};
			_addSub(target, signal, delegate);		
		};

	};

	/* private */
	
	
	/**
	 * Ensures that the observation specified is within
	 * the targets signal set
	 * 
	 * @param target {object} Validation source
	 * @param signal {string} Signal to validate
	 *
	 * @throws error if the target will not accept the signal
	 */
	function _checkSignal(target, signal){
		if(target === undefined || target._signals === undefined){
			throw 'Target object is not observable';
		}
		else if('string' === typeof signal){
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
	 */
	function _addSub(target, signal, delegate){
		target._subs[signal] = target._subs[signal] ? target._subs[signal].push(delegate) : [delegate];
	}

	return self;
})();
