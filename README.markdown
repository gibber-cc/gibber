## Gibber ##

Gibber is a live coding environment for the web browser, built on top of audiolib.js and using the ACE code editor. I've only tested it in Chrome.

Gibber is just getting started. But here are some simple instructions if you want to play. Ctrl-Return executes selected code, if no code is executed the entire block is run. Try executing one line at a time.

	// execute selected code using Ctrl-Return. If no code is selected entire block is run.
		
	sine = Sine(240, .5); 				// Create a sine wave at frequency 240, amplitude .5
	sine.mod("freqOffset", LFO(4,10));  // modulate the frequencyOffset by 10Hz with an LFO running at 4Hz
	
	//  GND.stop();
	//  GND.start();

	square = Square(120, .15);
	freqs = [120, 240, 120, 360];

	step = StepSequencer(250, freqs); 		// create a step sequencer. each step is 250 ms.

	square.mod("frequency", step);			// use step sequencer to set freq of saw wave
	square.mod("ampOffset", LFO(10, .15));  // tremolo

	tri = Tri(240, .5).mod( "freqOffset", LFO(4,40) ).mod( "ampOffset", LFO(1, .25) ); // mods can cascade	

