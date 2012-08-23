function audioProcess(buffer, channelCount){
	if( Gibber.active ) {		
		for(var i = 0, _bl = buffer.length; i < _bl; i+= channelCount) {
			if(i === 0) Gibber.debug = true;
			//if(Gibber.debug) console.log("RUNNING", buffer.length);
			
			if(Gibberish.isDirty) Gibberish.callback = Gibberish.generateCallback(); 

			Gibber.callback.generate(); // for sequencers etc.
			
			buffer[i] = buffer[i + 1] = Gibberish.callback(); // for audio
			Gibber.debug = false;
		}
	}
};
