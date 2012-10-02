function audioProcess(e){//buffer, channelCount){
	var buffer = [];// e.outputBuffer;
	var input = e.inputBuffer.getChannelData(0);
	buffer[0] = e.outputBuffer.getChannelData(0);
	buffer[1] = e.outputBuffer.getChannelData(1);	
	var channelCount = e.outputBuffer.numberOfChannels;
	//console.log("CALLING");
	if( Gibber.active ) {
		//console.log("INPUT", input[0]);
		for(var i = 0, _bl = e.outputBuffer.length; i < _bl; i++){//= channelCount) {
			if(i === 0) Gibber.debug = true;
			//if(Gibber.debug) console.log("RUNNING", buffer.length);
			
			if(Gibberish.isDirty) Gibberish.callback = Gibberish.generateCallback(); 

			Gibber.callback.generate(); // for sequencers etc.
			var val = Gibberish.callback(input[i]);
			//if(typeof val === "object") {
				buffer[0][i] = val[0];
				buffer[1][i] = val[1]; 
				//}else{
				//buffer[i] = buffer[i + 1] = val;
				//}
			//Gibberish.callback(); // for audio
			Gibber.debug = false;
		}
	}
};
