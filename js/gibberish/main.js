requirejs.config({
    baseUrl: 'js/gibberish/lib',
    paths: {}
});

requirejs(['external/sink-light', 'external/audiofile', 'gibberish', 'utils', 'cycle'], 
	function   (sink,  audiofile, _gibberish) {
		window.Gibberish = _gibberish;
		Gibberish.init();
		
		s = Gibberish.Sine(440, .25);
		s.connect(Gibberish.MASTER);
		Gibberish.dirty = true;
		
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
	}
);