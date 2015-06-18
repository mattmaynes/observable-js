![](https://travis-ci.org/mattmaynes/observable-js.svg)

#Observable-JS
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

###Subscription
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

