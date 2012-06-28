function audioProcess(buffer, channelCount){
	if( Gibber.active ) {		
		for(var i = 0, _bl = buffer.length; i < _bl; i+= channelCount) {
			if(i === 0) Gibber.debug = true;
			//if(Gibber.debug) console.log("RUNNING", buffer.length);
			
			if(Gibberish.dirty) {
			 	Gibberish.callback = Gibberish.generateCallback(); 
			}
			
			Gibber.callback.generate();
			
			buffer[i] = buffer[i + 1] = Gibberish.callback();
			Gibber.debug = false;
		}
	}
};
