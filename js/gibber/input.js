/**#Input - Buffer Recording & Playback
The Input ugen allows you to grab samples from the audio inputs on your computer. It (currently) requires Chrome Canary; see
the audio input, sampling and looping tutorial for details. The Input ugen is immediately connected to Gibber's output... watch
out for feedback if you're not using headphones. After making an Input ugen you can add fx and monitor them live; you can also
record the Input and play it back using either the [Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\)), 
[Grains](javascript:Gibber.Environment.displayDocs('Grains'\)) or [Looper](javascript:Gibber.Environment.displayDocs('Looper'\)) 
ugens.

When the first Input object is created for a Gibber session you'll be prompted to grant permission to the browser to use audio
input and select the input you would like to use.
 
## Example Usage ##
`a = Input();    // live input only works in Chrome Canary
a.fx.add( Schizo('paranoid'), Delay(), Reverb() );
`
## Constructor
The constructor takes no parameters, although you'll have to select the input manually the first time you create an Input ugen.
**/

var _hasInput = false; // wait until requested to ask for permissions so annoying popup doesn't appear automatically

function Input(shouldConnect){
	if(!_hasInput) { 
		createInput(shouldConnect); 
	}
	
	var that = Gibberish.Bus();
	that.input = Gibberish.Input();
	
	that._disconnect = Gibberish.disconnect;
/**###Input.disconnect : method
**description**: Disconnect the Input from the Master output or any other busses it might be connected to.
**/	
	that.disconnect = function() {
		that._disconnect();
		that.senderObjects.remove();
		that.senders.remove();
		that.destinations.remove();
		that.send(Master, 0);		
		Master.disconnectUgen(that);
	};
	that.input.connect(that);

	if(shouldConnect === true || typeof shouldConnect === "undefined") {	
		that.send(Master, 1);	
	}
	
	return that;
}

function createInput(shouldConnect) {
    navigator.webkitGetUserMedia(
		{audio:true}, 
		function (stream) {
			console.log("INIT AUDIO INPUT");
		    Gibber.mediaStreamSource = Gibber.context.createMediaStreamSource(stream);    
		    Gibber.mediaStreamSource.connect(Gibber.node);
			_hasInput = true;
		}
	);
}