#Observable-JS [![Build Status](https://travis-ci.org/mattmaynes/observable-js.svg)](https://travis-ci.org/mattmaynes/observable-js) [![Coverage Status](https://coveralls.io/repos/mattmaynes/observable-js/badge.svg?branch=master)](https://coveralls.io/r/mattmaynes/observable-js?branch=master)
Observable allows objects to define a set of state changes that can be 
observed. This provides a nice machanism for applying the subscriber design 
pattern to a JavaScript project. This is very similar to EventEmitter in 
Node.js except it is brower ready.

##Observables
Each observable event in an object triggers three separate functions:
- onNext
- onError
- onComplete


These functions can be called indepenently of one another. Each function 
accepts the same arguments:
- data
- source

A simple handler for an onNext function might look like the following:

```JavaScript
function moreData(data, source){
	console.log(data.message);
}
```

##Examples

####Initialization
Observable-JS uses static construction to create an observable object. The 
following makes this object observable with a 'data' 
event. 

```JavaScript
var Foo = function(){

	// Calling create makes 'this' object observable. It adds the 
	// observable functions to this object and allows external objects to 
	// subscribe to the defined events. If no events are defined then
	// listening objects can subscribe to anything.
	Observable.create(this, ['data']);
};
```

####Subscription
To listen to the new data event, an observer must subscribe to the given event.
A subscription can either explicitly stated in the subscribe line or later by 
setting it in the subscription object returned by subscribe.

```JavaScript
function moreData(data, source){
	console.log(data.message);
}

function printError(error, source){
	console.log(error.message);
}

var Bar = function(){
	var foo = new Foo();
	
	// You can specify your listeners in the subscription by adding them to
	// the handler object.
	var sub = foo.subscribe('data', { onNext : moreData });

	// The function can also be added later by setting its value in the 
	// subscription object
	sub.onError = printError;
};
```

####Signalling
To notify subscribers of events that have occured, the observable object sends a 
signal with the event data.

```JavaScript
// Foo is an observable object. In the constructor we created a 'data' event 
// that we can now signal. This function listens for user input and signals 
// users of the change in data
Foo.prototype.onUserInput = function(event){
	if(isValid(event.value)){
		// Signal that the next data has occured and send the data object
		this.signal(Observable.NEXT, 'data', { message : event.value });
	}
	else{
		// In this case our data is invalid so there is an error
		this.signal(Observable.ERROR, 'data', { message : event.value });
	}
};
```

####Unsubscribing
To unsubscribe from an observable object, simply pass the original subscription
to the unsubscribe function.

```JavaScript
var Bar = function(){
	var foo = new Foo();

	// Subscribe to the data event
	var sub = foo.subscribe('data', { 

		// If there is an error with the data then unsubscribe from the source
		onError : function(){
			foo.unsubscribe(sub);
		}
	});
};
	
```

####Signals
Signals can be have special properties associated with them. To add or update
a signal, use the `addSignal()`

```JavaScript
	foo.addSignal('data', { async : true });
```

Currently there the only option for signals is `async` but there may be more 
in the future


##License

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
