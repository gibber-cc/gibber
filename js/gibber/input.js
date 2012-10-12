var _hasInput = false; // wait until requested to ask for permissions so annoying popup doesn't appear automatically

function Input(shouldConnect){
	if(!_hasInput) { 
		createInput(shouldConnect); 
	}
	
	var that = Gibberish.Bus();
	that.input = Gibberish.Input();
	
	that._disconnect = Gibberish.disconnect;
	
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