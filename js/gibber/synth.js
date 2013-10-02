//  Gibber - synth.js
// ========================

/**#Synth - Synth
Create an oscillator(s) with an attached attack / decay envelope(s) that can play notes or chords. The primary oscillator is determined by the
waveform property and can currently be Sine, Saw, Triangle, Square or Noise. Presets are short and rhodes.
## Example Usage##
`s = Synth();
s.note("A4");  
t = Synth({ 
	waveform:"Saw",
	maxVoices:5, 
	attack:_1,
	decay:_1
});
t.chord("c3m7");`
## Constructors
### syntax 1:
param **attack**: Int in ms. The number of milliseconds the attack of the synth's envelope lasts  
param **decay** : Int in ms. The number of milliseconds the decay of the synth's envelope lasts  
param **volume** : Float. The volume of the synth.  
- - - -
### syntax 2: 
  param **arguments** : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/

/**###Synth.waveform : property
String. The primary oscillator to be used. Can currently be 'Sine', 'Square', 'Noise', 'Triangle' or 'Saw'. 
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
	
	var props = Gibber.applyPreset("Synth", arguments);
	if(typeof props === "undefined") {
		props = {};

		if(! isNaN(attack)) props.attack = attack;
 		if(! isNaN(decay)) 	props.decay  = decay;
		if(! isNaN(amp)) 	props.amp = amp;
	}
	
	if(props.attack) props.attack = G.time( props.attack );
	if(props.decay)  props.decay  = G.time( props.decay );
	if(isNaN(props.maxVoices)) props.maxVoices = 1;
	
	that = Gibberish.PolySynth( props );
	
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
	
	if(props.fx) {
		for(var i = 0; i < props.fx.length; i++) {
			that.fx.add( props.fx[i] );
		}
	}

	
	return that;
}

Gibber.presets.Synth = {
	short : { attack: 44, decay: 1/16,},
	bleep: { waveform:'Sine', attack:44, decay:1/16 },
  rhodes: { waveform:'Sine', maxVoices:4, fx:[ Tremolo(2, .2) ], attack:44, decay:1, cutoff:.1, filterMult:.4, resonance:1.5 }
};

/**#Synth2 - Synth
Create an oscillator with an attached envelope and 24db resonant filter that can be triggered by note or chord messages. The envelope controls both the
amplitude and cutoff frequency of the filter. Like the Synth object, the primary oscillator is determined by the
waveform property and can currently be Sine, Saw, Triangle, Square or Noise. Presets are short and squeal.
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

/**###Synth2.waveform : property
String. The primary oscillator to be used. Can currently be 'Sine', 'Square', 'Noise', 'Triangle' or 'Saw'. 
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

function Synth2() {
	var that = {};
		
	var props = Gibber.applyPreset("Synth2", arguments);
	if(typeof props === "undefined") {
		props = {};
	}
	
	if(props.attack) props.attack = G.time( props.attack );
	if(props.decay)  props.decay  = G.time( props.decay );
	if(isNaN(props.maxVoices)) props.maxVoices = 1;
	
	if(typeof props !== "undefined") Gibberish.extend(that, props);
	
	that = Gibberish.PolySynth2(that);
	that.fx.parent = that;

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

Gibber.presets.Synth2 = {
	short : {
		attack: 44,
		decay: 1/16,
	},
  squeal: { waveform:'Saw', attack:44, decay:1/16, cutoff:.1, filterMult:.4, resonance:5.5 },
};

/**#Mono - Synth
A three oscillator monosynth for bass and lead lines. You can set the octave and tuning offsets for oscillators 2 & 3. There is a 24db filter and an envelope controlling
both the amplitude and filter cutoff. Presets are: short, lead, bass, easy, dark, dark2.
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
### syntax 2: 
  param **presetName** : String. A preset to choose for starting values. Current values are 'short', 'lead', and 'bass'.
  param **arguments** : Object. A dictionary of property values to set upon initialization; these override any settings in the preset. See the properties section and the example usage section for details.
**/

/**###Mono.waveform : property
String. The primary oscillator to be used. Can currently be 'Sine', 'Square', 'Noise', 'Triangle' or 'Saw'. 
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
function Mono() {
	var that = {};
		
	var props = Gibber.applyPreset("Mono", arguments);
	if(typeof props === "undefined") {
		props = {};
	}
	
	if(typeof props.attack !== "undefined") props.attack = G.time(props.attack);
	if(typeof props.decay !== "undefined") 	props.decay  = G.time(props.decay);

	Gibberish.extend(that, props);
		
	that = Gibberish.Mono(that);
	that.fx.parent = that;
		
	if(props.fx) {
		for(var i = 0; i < props.fx.length; i++) {
			that.fx.add( props.fx[i] );
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

Gibber.presets.Mono = {
	short : {
		attack: 44,
		decay: 1/16,
	},
  
	lead : {
		//fx : [ Delay(1/4, .35), Reverb() ],
		attack: 1/8,
		decay:1/2,
		octave3:0,
		cutoff:.2,
		filterMult:.5,
		resonance:5,
		isLowPass: false,
	},
  
	bass : {
		attack: Gibber.MAX_MEASURES,
		decay:	1/8 - Gibber.MAX_MEASURES,
		octave2 : -1,
		cutoff: 0,
		filterMult:.2,
		resonance:4,
	},
  
	easy : {
		attack:44,
		decay:2,
		octave2:0,
		octave3:0,
		cutoff:.3,
	},
  
  dark : {
    resonance:0,
    attack:44,
    cutoff:.075,
    amp:.35,
    filterMult:0
  },

  dark2 : {
    filterMult:.1,
    attack:44,
    octave2:0,
    octave3:0
  },
};