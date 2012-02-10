## Gibber ##

Gibber is a live coding environment for the web browser, built on top of audiolib.js and using the ACE code editor. I've only tested it in Chrome.

Gibber is just getting started. But here are some simple instructions if you want to play. Ctrl-Return executes selected code, if no code is executed the entire block is run. Try executing one line at a time.

```
// GIBBER --- try execting code one line at a time to hear results
// Ctrl-Return (Cmd-Return OSX) executes selected code. If no code is selected entire block is run.
// Cntrl/Cmd-. toggles the audio on and off
// Cntrl/Cmd-` clears all generators
    	
s = Sine(240, .5);                  // Create a sine wave at frequency 240, amplitude .5    
s.mod("freq", LFO(2,4), "+");  	    // offset the frequency by 10Hz with an LFO running at 4Hz
s.chain( Dist(), Reverb() );        // add some fx

step = Step( 250, [120, 240, 120, 360] ); 	// create a step sequencer. each step is 250 ms.
s.mod("freq", step, "=");	    	        // use step sequencer to assign freq of saw wave

/*
tri = Tri(240, .5)
    .mod( "freq", LFO(4,40) )
    .mod( "amp", LFO(1, .25) );     // mods can cascade
*/

Master.chain( Trunc(4) );           // Master FX are applied to summed signal of all generators
Master.clearFX();                   // clearFX also works with generators... try it on s	
```
