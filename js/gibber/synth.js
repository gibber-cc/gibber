//  Gibber - synth.js
// ========================

/**#Synth - Synth
Create an oscillator(s) with an attached attack / decay envelope(s) that can play notes or chords.  
## Example Usage##
`s = Synth();
s.note("A4");  
t = Synth({ 
	maxVoices:5, 
	attack:_1,
	decay:_1
});
t.chord("c4m7");`
## Constructors
### syntax 1:
param **attack**: Int in ms. The number of milliseconds the attack of the synth's envelope lasts  
param **decay** : Int in ms. The number of milliseconds the decay of the synth's envelope lasts  
param **volume** : Float. The volume of the synth.  
- - - -
### syntax 2: 
  param **arguments** : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/

/**###Synth.attack : property
Integer. The length, in samples, of the attack of the amplitude envelope.
**/
/**###Synth.decay : property
Integer. The length, in samples, of the decay of the amplitude envelope.
**/
/**###Synth.amp : property
Float. The peak amplitude of the synth, usually between 0..1
**/
/**###Synth.maxVoices : property
Integer. The number of voices that can be played simultaneously by the synth. NOTE: This property only has effect when assigned in the constructor! See example.
**/
/**###Synth.glide : property
Integer. The length in time, in samples, to slide in pitch from one note to the next.
**/

function Synth(attack, decay, amp) {
	var that;
	var _fx;
	if(typeof arguments[0] === "object") {
		that = arguments[0];
		_fx = that.fx;
		
		if(isNaN(that.maxVoices)) that.maxVoices = 1;
		
		if(that.attack) that.attack = G.time(that.attack);
		if(that.decay) 	that.decay 	= G.time(that.decay);
		
		that = Gibberish.PolySynth(that);
	}else{
		that = {};

		if(! isNaN(attack)) that.attack = G.time(attack);
 		if(! isNaN(decay)) 	that.decay 	= G.time(decay);	
		if(! isNaN(amp)) 	that.amp = amp;
		
		that.maxVoices = 1;

		that = Gibberish.PolySynth(that);
	}
	that.fx.parent = that;
	
	
/**###Synth.note : method
param **note or frequency** : String or Integer. You can pass a note name, such as "A#4", or a frequency value, such as 440.
param **amp** : Optional. Float. The volume of the note, usually between 0..1. The main amp property of the Synth will also affect note amplitude.
	
play a note and optionally specify and amplitude for it.
**/
	that.note = Gibber.makeNoteFunction(that);
	
/**###Synth.chord : method
param **chord name or note list** : String or Array. You can pass a chord name, such as "C4maj7", or a list of notes, such as ["A4", "C#4", "E4"]
param **amp** : Optional. Float. The volume of the chord, usually between 0..1. The main amp property of the Synth will also affect chord amplitude.
	
Play a chord and optionally specify and amplitude for it. This method only works if the maxVoices property is set to more than one voice in the constructor. See the example usage for details.
**/	
	that.chord = Gibber.chord;	
	
	that.send(Master, 1);
	
	if(_fx) {
		for(var i = 0; i < _fx.length; i++) {
			that.fx.add( _fx[i] );
		}
	}
	
	return that;
}

/**#Synth2 - Synth
Create an oscillator with an attached envelope and 24db resonant filter that can be triggered by note or chord messages. The envelope controls both the
amplitude and cutoff frequency of the filter.
## Example Usage##
`s = Synth2();
s.note("A4");  
t = Synth2({ 
	maxVoices:5,
	cutoff:0,
	filterMult:.5,
	attack:_1,
	decay:_1
});
t.chord("c4m7");`
## Constructors
### syntax 1: 
  param **arguments** : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/

/**###Synth2.attack : property
Integer. The length, in samples, of the attack of the amplitude envelope.
**/
/**###Synth2.decay : property
Integer. The length, in samples, of the decay of the amplitude envelope.
**/
/**###Synth2.amp : property
Float. The peak amplitude of the synth, usually between 0..1
**/
/**###Synth2.maxVoices : property
Integer. The number of voices that can be played simultaneously by the synth. NOTE: This property only has effect when assigned in the constructor! See example.
**/
/**###Synth2.cutoff : property
Float. The frequency cutoff for the synth's filter. Range is 0..1.
**/
/**###Synth2.filterMult : property
Float. As the envelope on the synth progress, the filter cutoff will also change by this amount * the envelope amount.
**/
/**###Synth2.resonance : property
Float. The emphasis placed on the filters cutoff frequency. 0..50, however, GOING OVER 5 IS DANGEROUS TO YOUR EARS (ok, maybe 6 is all right...)
**/
/**###Synth2.glide : property
Integer. The length in time, in samples, to slide in pitch from one note to the next.
**/

function Synth2(properties) {
	var that = {};
	var _fx = properties.fx;
	if(properties.attack) properties.attack = G.time(properties.attack);
	if(properties.decay) properties.decay = G.time(properties.decay);
	
	if(typeof properties !== "undefined") Gibberish.extend(that, properties);
	if(isNaN(that.maxVoices)) that.maxVoices = 1;
	
	that = Gibberish.PolySynth2(that);
	that.fx.parent = that;
	
	if(_fx) {
		for(var i = 0; i < _fx.length; i++) {
			that.fx.add( _fx[i] );
		}
	}
	
	
/**###Synth2.note : method
param **note or frequency** : String or Integer. You can pass a note name, such as "A#4", or a frequency value, such as 440.
param **amp** : Optional. Float. The volume of the note, usually between 0..1. The main amp property of the Synth will also affect note amplitude.
	
play a note and optionally specify and amplitude for it.
**/	
	that.note = Gibber.makeNoteFunction(that);
	
/**###Synth2.chord : method
param **chord name or note list** : String or Array. You can pass a chord name, such as "C4maj7", or a list of notes, such as ["A4", "C#4", "E4"]
param **amp** : Optional. Float. The volume of the chord, usually between 0..1. The main amp property of the Synth will also affect chord amplitude.
	
Play a chord and optionally specify and amplitude for it. This method only works if the maxVoices property is set to more than one voice in the constructor. See the example usage for details.
**/		
	that.chord = Gibber.chord;	
	
	that.send(Master, 1);
	
	return that;
}
/**#Mono - Synth
A three oscillator monosynth for bass and lead lines. You can set the octave and tuning offsets for oscillators 2 & 3. There is a 24db filter and an envelope controlling
both the amplitude and filter cutoff.
## Example Usage##
`s = Mono();
s.note("A4");  
t = Mono({ 
	cutoff:0,
	filterMult:.5,
	attack:_8,
	decay:_8,
	octave2:-1,
	octave3:-1,
	detune2:.01,
	glide:_12,
});
t.note("C3");`
## Constructors
### syntax 1: 
  param **arguments** : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/
/**###Mono.attack : property
Integer. The length, in samples, of the attack of the amplitude envelope.
**/
/**###Mono.decay : property
Integer. The length, in samples, of the decay of the amplitude envelope.
**/
/**###Mono.amp : property
Float. The peak amplitude of the synth, usually between 0..1
**/
/**###Mono.cutoff : property
Float. The frequency cutoff for the synth's filter. Range is 0..1.
**/
/**###Mono.filterMult : property
Float. As the envelope on the synth progress, the filter cutoff will also change by this amount * the envelope amount.
**/
/**###Mono.resonance : property
Float. The emphasis placed on the filters cutoff frequency. 0..50, however, GOING OVER 5 IS DANGEROUS TO YOUR EARS (ok, maybe 6 is all right...)
**/
/**###Mono.octave2 : property
Integer. The octave difference between oscillator 1 and oscillator 2. Can be positive (higher osc2) or negative (lower osc 2) or 0 (same octave).
**/
/**###Mono.detune2 : property
Float. The amount, from -1..1, the oscillator 2 is detuned. A value of -.5 means osc2 is half an octave lower than osc1. A value of .01 means osc2 is .01 octaves higher than osc1.
**/
/**###Mono.octave3 : property
Integer. The octave difference between oscillator 1 and oscillator 3. Can be positive (higher osc3) or negative (lower osc 3) or 0 (same octave).
**/
/**###Mono.detune3 : property
Float. The amount, from -1..1, the oscillator 3 is detuned. A value of -.5 means osc3 is half an octave lower than osc1. A value of .01 means osc3 is .01 octaves higher than osc1.
**/
/**###Mono.glide : property
Integer. The length in time, in samples, to slide in pitch from one note to the next.
**/
function Mono(properties) {
	var that = {};
	var _fx = typeof properties !== "undefined" ? properties.fx : undefined;
	if(typeof properties !== "undefined") {
		if(typeof properties.attack !== "undefined") properties.attack = G.time(properties.attack);
		if(typeof properties.decay !== "undefined") properties.decay = G.time(properties.decay);
	}
	
	if(typeof properties !== "undefined") Gibberish.extend(that, properties);
		
	that = Gibberish.Mono(that);
	that.fx.parent = that;
		
	if(typeof _fx !== "undefined") {
		for(var i = 0; i < _fx.length; i++) {
			that.fx.add( _fx[i] );
		}
	}
	
/**###Mono.note : method
param **note or frequency** : String or Integer. You can pass a note name, such as "A#4", or a frequency value, such as 440.
param **amp** : Optional. Float. The volume of the note, usually between 0..1. The main amp property of the Synth will also affect note amplitude.
**/
	that.note = Gibber.makeNoteFunction(that);
	
	that.send(Master, 1);
	
	return that;
}

