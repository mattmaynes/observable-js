/* global navigator */

// PhantomJS versions prior to 2.x have a broken implementation of
// Function.prototype.bind. This is a small patch to fix this issue
//
// Source: https://developer.mozilla.org/en/docs/Web/JavaScript/
// Reference/Global_objects/Function/bind#Polyfill
//
// Determine if the user agent is PhantomJS and its version is prior to 2.x

var agent	= navigator.userAgent || '';
var phantom	= agent.match(/(PhantomJS)[\/.0-9]+/g)[0] || '';
var version = phantom.match(/[.0-9]+/g)[0] || '';

// If the bind function does not exist or it is broken (i.e. PhantomJS)
// then overwrite it with this polyfill
if(!Function.prototype.bind || version.match(/1[.0-9]+/g)){
	Function.prototype.bind = function(context){
		'use strict';
		if(typeof this !== 'function'){
			// Closest thing possible to the ECMAScript 5
			// Internal isCallable function
			throw new TypeError('Function.prototype.bind - ' + 
					'what is trying to be bound is not callable');
		}

		var args	= Array.prototype.slice.call(arguments, 1),
			self	= this,
			NOP		= function () {},
			bound	= function () {
				return self.apply(
						this instanceof NOP ? this : context,
						args.concat(Array.prototype.slice.call(arguments)));
			};

		NOP.prototype		= this.prototype;
		bound.prototype		= new NOP();
		return bound;
	};

}



