//  Gibber - synth.js
// ========================

/**#FM - Synth
A simple two operator FM synth with a single attached attack / decay envelope that controls both the amplitude and the modulation index of the synth.
FM can play notes or chords.  
## Example Usage##
`// a brass sound
f = FM({
	cmRatio : 1 / 1.0007,
	index	: 5,
	attack	: 4100,
	decay	: 4100,
});
s.note("A4");  
g = FM("glockenspiel", {maxVoices:5});
g.chord("c4m7");`
## Constructors
### syntax 1 (not recommended):
**param** *cmRatio*: Float. The ratio between the carrier and modulation frequency. See the FM synthesis tutorial for details.
**param** *index* : Float. The depth of frequency change the modualtor applies to the carrier frequency.
**param** *attack*: Int in ms. The number of milliseconds the attack of the synth's envelope lasts  
**param** *decay* : Int in ms. The number of milliseconds the decay of the synth's envelope lasts  
- - - -
### syntax 2: 
**param** *arguments* : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
- - - -
### syntax 3: 
**param** *presetName* : String. The name of an FM preset. Current presets include:glockenspiel, frog, radio, noise, brass, clarinet, drum, gong and drum2.
**param** *arguments* : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/
/**###FM.cmRatio : property
Float. The ratio between the carrier and modulation frequencies. If you play a 440 Hz note with an FM synth, and the cmRatio = 2, the modulator
frequency will be 220.
**/
/**###FM.index : property
Float. The strength of the modulation. This value is multipled by the frequency of the carrier in order to determine the amplitude of
the modulation sine wave.
**/
/**###FM.attack : property
Integer. The length, in samples, of the attack of the amplitude / index envelope.
**/
/**###FM.decay : property
Integer. The length, in samples, of the decay of the amplitude / index envelope.
**/
/**###FM.amp : property
Float. The peak amplitude of the synth, usually between 0..1
**/
/**###FM.maxVoices : property
Integer. The number of voices that can be played simultaneously by the synth. NOTE: This property only has effect when assigned in the constructor! See example.
**/
/**###FM.glide : property
Integer. The length in time, in samples, to slide in pitch from one note to the next.
**/

function Input(shouldConnect){
	var that = Gibberish.Bus();
	that.input = Gibberish.Input();
	
	that.input.connect(that);
	/*var props = Gibber.applyPreset("FM", arguments);
	if(typeof props === "undefined") {
		props = {
			cmRatio : isNaN(cmRatio) ?  2 	: cmRatio,
			index  	: isNaN(index)	 ? .9 	: index,
			attack 	: isNaN(attack)  ? 4100 : G.time(attack),
			decay  	: isNaN(decay)   ? 4100 : G.time(decay),
			maxVoices: 1,
		};
	}*/
	if(shouldConnect === true || typeof shouldConnect === "undefined") {	
		that.send(Master, 1);	
	}
	
	return that;
}