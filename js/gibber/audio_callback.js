// 		Gibberish.callback = Gibberish.generateCallback( false );
// 		codeTimeout = setTimeout(function() { 
// 			var codegen = document.getElementById("output");
// 			codegen.innerHTML = Gibberish.callback;
// 		}, 250);
// 		
// 		var phase = 0;
// 		var sink = Sink( function(buffer, channelCount){
// 			//console.log("CHANNEL COUNT = ", channelCount);
// 		    for (var i=0; i<buffer.length; i+=2){
// 				//if(phase++ % 100 == 0) s.frequency = Math.round(400 + Math.random() * 400);
// 				if(Gibberish.dirty) {
// 					Gibberish.callback = Gibberish.generateCallback( false ); 
// 				}
// 				buffer[i] = buffer[i+1] = Gibberish.callback();
// 		    }
// 	}, 2, 256);


function audioProcess(buffer, channelCount){	
	if( Gibber.active ) {		
		for(var i = 0, _bl = buffer.length; i < _bl; i+= channelCount) {
			if(i === 0) Gibber.debug = true;
			//if(Gibber.debug) console.log(buffer.length);
			
			if(Gibberish.dirty) {
			 	Gibberish.callback = Gibberish.generateCallback(); 
			}
			
			Gibber.callback.generate();
			
			buffer[i] = buffer[i + 1] = Gibberish.callback();
			Gibber.debug = false;
		}
	}
};
