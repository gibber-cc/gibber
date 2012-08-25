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

function FM(cmRatio, index, attack, decay){
	var that;
	if(typeof Gibber.FMPresets === "undefined") FMPresets();
	
	if(typeof arguments[0] === "string") { // if a preset
		if(typeof arguments[1] === "undefined") {
			var preset = Gibber.FMPresets[arguments[0]];
			preset.maxVoices = 1;
			that = Gibberish.PolyFM( preset );
		}else{
			console.log("EXTENDING WITH ", arguments[1]);
			var props = Gibber.FMPresets[arguments[0]];
			Gibberish.extend(props, arguments[1]);
			
			that = Gibberish.PolyFM( props );
		}
	}else if(typeof arguments[0] === "object") {
		that = Gibberish.PolyFM( arguments[0] );
	}else{
		props = {
			cmRatio : isNaN(cmRatio) ?  2 	: cmRatio,
			index  	: isNaN(index)	 ? .9 	: index,
			attack 	: isNaN(attack)  ? 4100 : G.time(attack),
			decay  	: isNaN(decay)   ? 4100 : G.time(decay),
			maxVoices: 1,
		};
		
		that = Gibberish.PolyFM( props );
	}

/**###FM.note : method
param **note or frequency** : String or Integer. You can pass a note name, such as "A#4", or a frequency value, such as 440.
param **amp** : Optional. Float. The volume of the note, usually between 0..1. The main amp property of the Synth will also affect note amplitude.
	
play a note and optionally specify and amplitude for it.
**/
	that.note = Gibber.makeNoteFunction(that);
	
/**###FM.chord : method
param **chord name or note list** : String or Array. You can pass a chord name, such as "C4maj7", or a list of notes, such as ["A4", "C#4", "E4"]
param **amp** : Optional. Float. The volume of the chord, usually between 0..1. The main amp property of the Synth will also affect chord amplitude.
	
Play a chord and optionally specify and amplitude for it. This method only works if the maxVoices property is set to more than one voice in the constructor. See the example usage for details.
**/	
	that.chord = Gibber.chord;
	
	that.send(Master, 1);	
	
	return that;
}

function FMPresets() {
	Gibber.FMPresets = {
		glockenspiel : {
			cmRatio	: 3.5307,
			index 	: 1,
			attack	: 44,
			decay	: 44100,
		},
		radio : { //ljp
			cmRatio	: 1,
			index	: 40,
			attack	: 300 * 44.1,
			decay	: 500 * 44.1,
		},
		noise : { //ljp
			cmRatio	: 0.04,
			index	: 1000,
			attack	: 1 * 44.1,
			decay	: 100 * 44.1,
		},
		frog : { //ljp
			cmRatio	: 0.1,
			index	: 2.0,
			attack	: 300 * 44.1,
			decay	: 5 * 44.1,
		},
		gong : {
			cmRatio : 1.4,
			index	: .95,
			attack	: 44.1,
			decay	: 5000 * 44.1,
		},
		drum : {
			cmRatio : 1.40007,
			index	: 2,
			attack	: 44,
			decay	: 44100,
		},
		drum2 : {
			cmRatio: 1 + Math.sqrt(2),
			index: .2,
			attack: 44,
			decay: 20 * 44.1,
		},
		brass : {
			cmRatio : 1 / 1.0007,
			index	: 5,
			attack	: 4100,
			decay	: 4100,
		},
		clarinet : {
			cmRatio	: 3 / 2,
			index	: 1.5,
			attack	: 50 * 44.1,
			decay	: 200 * 44.1,
		}
	};
}