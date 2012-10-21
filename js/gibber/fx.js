//  Gibber.js - fx.js
// ========================

/**#Bus - Miscellaneous
**description** : Create a bus holding fx that signals can be routed to   
**param** *name*: String Optional name that can be used to refer to the new bus.  
**param** *fx*: variable length object list. A comma delimited list of effects to attach to the bus.  
##Example Usage##    
`b = Bus( Delay(_4), Reverb() );  
s = Synth();  
s.send( b, .5 );`
alternatively:  
`b = Bus( "rev", Delay(_4), Reverb() );  
s = Synth();  
s.send( "rev", .5 );`
**/

function Bus() { // name is id, fx is array, ahem, fx
	var bus = Gibberish.Bus(arguments).connect(Master);
	return bus;
}

/**#Flanger - FX
**description** : A traditional flanger using a variable-length comb filter.
  
**param** *rate*: Float. Default = .25. Measured in Hz, this is the speed that the delay line size fluctuates at  
**param** *amount*: Int. Default = 125. The amount that the size of the delay line fluctuates by  
**param** *feedback*: Float. Default = .25. Feedback for the flanger. Increase to get a more pronounced effect  
**param** *offset*: Int. Default = amount. The offset of the flanger's comb filter from the current sample. By default this is the same as the amount parameter  

## Example Usage ##
`p = Pluck(0, 1);    
p.fx.add( Flanger() );   
p.note( "A3" );`
**/

/**###Flanger.rate : property
Float. Hz. the speed that the delay line size fluctuates at.
**/	
/**###Flanger.amount : property
Int. Samples. The amount that the size of the delay line fluctuates by.
**/	

function Flanger(rate, amount, feedback, offset) {
	var args = Array.prototype.slice.call(arguments, 0),
		that = Gibberish.Flanger.apply(null, args);
		
	that.name = 'Flanger';
	return that;
}

/**#Vibrato - FX
**description** : A small variation on the flanger that only outputs the 'wet' signal and creates fluctuations in pitch. 
The rate controls the speed of the vibrato, while the maximum size of the vibrato in pitch is determined by offset * amount.
  
**param** *rate*: Float. Default = 5. Measured in Hz, this is the speed that the delay line size fluctuates at.  

**param** *amount*: Int. Default = .5. The amount that the size of the delay line fluctuates by as a percentage of the offset.  

**param** *offset*: Int. Default = 125. The base delay of the output from the input sample. This fluctuates according to the rate and amount. Is best to set upon initialization and not touch.
## Example Usage ##
`p = Pluck(0, 1);    
p.fx.add( Vibrato() );   
p.note( "A3" );`
**/

/**###Vibrato.rate : property
Float. Hz. the speed that the delay line size fluctuates at.
**/	 
/**###Vibrato.amount : property
Int. Samples. The amount that the size of the delay line fluctuates by.
**/  
/**###Vibrato.offset : property
Int. Samples. The base delay offset for the output sample. In general this should only be set upon initialization.
**/	

function Vibrato(rate, amount, offset) {
	var args = Array.prototype.slice.call(arguments, 0),
		that = Gibberish.Vibrato.apply(null, args);
	
	that.name = "Vibrato";
	
	return that;
}


/**#Chorus- FX
**description** : cheap chorus using a flanger with an extreme offset see http://denniscronin.net/dsp/article.html

**param** *rate*: Float. Default = .25. Measure in Hz, this is the speed that the delay line size fluctuates at  
**param** *amount*: Int. Default = 125. The amount that the size of the delay line fluctuates by 
**/ 
/**###Chorus.rate : property
Float. Hz. The speed that the delay line size fluctuates at.
**/	
/**###Chorus.amount : property
Float. Hz. The amount that the size of the delay line fluctuates by.
**/	

function Chorus(rate, amount) {
	var _rate = rate || 1;
	var _amount = amount || ms(1);
	var that = Flanger(rate, amount, .5, ms(30));
	that.name = "Chorus";
	
	return that;
}

/**#Reverb- FX
**description** :  based off audiolib.js reverb and freeverb

**param** *roomSize*: Float. Default = .8. The size of the room being emulated  
**param** *damping*: Float. Default = .3. Attenuation of high frequencies that occurs  
**param** *wet*: Float. Default = .75. The amount of processed signal that is output  
**param** *dry*: Float. Default = .5. The amount of dry signal that is output  

##Example Usage
`s = Synth();  
s.fx.add( Reverb() );`
**/

/**###Reverb.roomSize : property
Float. Hz. The size of the room being emulated.
**/	
/**###Reverb.damping : property
Float. Attenuation of high frequencies that occurs.
**/	
/**###Reverb.wet : property
Float. Default = .75. The amount of processed signal that is output.  
**/	
/**###Reverb.dry : property
Float. Default = .5. The amount of dry signal that is output
**/	
function Reverb(roomSize, damping, wet, dry) {
	var that;
	
	if(typeof Gibber.ReverbPresets === 'undefined') ReverbPresets();
	
	if(typeof arguments[0] === "object") {
		that = Gibberish.Reverb( arguments[0] );
	}else if(typeof arguments[0] === 'string') {
		that = Gibberish.Reverb( Gibber.ReverbPresets[arguments[0]]);
	}else{
		var props = {
			roomSize : (isNaN(roomSize)) ? .5 : roomSize,
			damping	: (isNaN(damping)) ? .2223 : damping,
			wet		: wet || .25,
			dry		: dry || 1,
		};
		
		that = Gibberish.Reverb( props );
	}
	that.name = "Reverb";
	return that;
}

function ReverbPresets() {
	Gibber.ReverbPresets = {
		space : {
			roomSize:1,
			damping:0,
			wet:.4,
			dry:.6,
		},
	}
}

/**#Delay- FX

**param** *time*: Int. Default = _4. The number of samples betweeen echoes, usually expressed in Gibber time variables
**param** *feedback*: Float. Default = .3. How much of the output is fed back into the input of hte delay  

##Example Usage
`s = Synth();  
s.fx.add( Delay() );`
**/
/**###Delay.time : property
Int. The number of samples betweeen echoes, usually expressed in Gibber time variables
**/	
/**###Delay.feedback : property
Float. How much of the output is fed back into the input of the delay.
**/	

function Delay(time, feedback) {
	if(time) time = G.time(time);
	var that = Gibberish.Delay(time, feedback);
	that.name = "Delay";
	return that;	
};


/**#Ring- FX

**param** *frequency*: Float. Default = 440. The frequency of the sine wave that the signal is multiplied by  
**param** *amount*: Float. Default = 1. The amplitude of the sine wave the signal is multiplied by  
##Example Usage##
`s = Synth();  
s.fx.add( Ring(220, .5) );`
**/

/**###Ring.frequency : property
Float. The frequency of the sine wave that the signal is multiplied by  
**/	
/**###Delay.feedback : property
Float. The amplitude of the sine wave the signal is multiplied by  
**/	

function Ring(frequency, amount) {
	var args = Array.prototype.slice.call(arguments, 0),
		that = Gibberish.RingModulator.apply(null, args);
	
	that.name = "Ring";
	return that;	
}

/**#Crush- FX
**description** : A bit-crusher / sample-rate reducer
**param** *bitDepth*: Float. Default = 8. The number of bits to truncate the output to.
**param** *sampleRate*: Float. Default = 1. The sampleRate to downsample to. Range is 0..1
example usage:    
`d = Drums("xoxo");  
d.fx.add( Crush(6, .05) );`
**/
 
/**###Crush.bitDepth : property
Float. The number of bits to truncate the output to.
**/	
/**###Crush.sampleRate : property
Float. The sampleRate to downsample to. Range is 0..1
**/	
 
function Crush(bitDepth, sampleRate) {
	var args = Array.prototype.slice.call(arguments, 0),
		that = Gibberish.Decimator.apply(null, args);
	
	that.name = "Crush";
	return that;
}

/**#Clip- FX
**description** : A simple waveshaping distortion using y = x / (1+|x|). Clip also has a logarithmic volume adapter to the equation so that you can
apply extreme amounts of clipping

**param** *amount*: Float. Default = 4. Minimum of 2. The amount of distortion
**param** *amp*: Float. Default = 1. The amount of distortion

##Example Usage##
`d = Drums("xoxo");  
d.fx.add( Clip(1000) );`
**/

/**###Clip.amount : property
Float. The number of bits to truncate the output to.
**/	
/**###Clip.amp : property
Float. The sampleRate to downsample to. Range is 0..1
**/	
window.Dist = window.Clip = function(amount, amp) {
	var args = Array.prototype.slice.call(arguments, 0),
		that = Gibberish.SoftClip.apply(null, args);
	
	that.name = "Clip";
	return that;
};

/**#LPF - FX
**description** : 24db resonant ladder-style filter

**param** *cutoff*: Float. Default = .1. The cutoff frequency of the filter. Range is 0..1
**param** *resonance*: Float. Default = 3. Emphasis of the cutoff frequency. Range is 0..50. Higher than 6 is scary.

##Example Usage## 
`d = Drums("xoxo");
d.amp = 3.5;  
l = LPF(.2, 40);  
d.fx.add( Crush(4,.1),  l, Clip(2, .25), Reverb() );  
s = Seq( function() { l.cutoff = rndf(0,.25);}, _8);  
Master.fx.add( Flanger() );`
**/
/**###LPF.cutoff : property
Float. The cutoff frequency of the filter. Range is 0..1
**/	
/**###LPF.resonance : property
Float. Emphasis of the cutoff frequency. Range is 0..50. Higher than 6 is scary. See example for higher than 6.
**/

function LPF(cutoff, resonance) {
	var that = Gibberish.Filter24(cutoff, resonance, true);
	that.name = "LPF";
	return that;
}

/**#HPF - FX
**description** : 24db resonant ladder-style filter

**param** *cutoff*: Float. Default = .1. The cutoff frequency of the filter. Range is 0..1
**param** *resonance*: Float. Default = 3. Emphasis of the cutoff frequency. Range is 0..50. Higher than 6 is scary.

##Example Usage## 
`d = Drums("xoxo");
d.amp = 3.5;  
l = HPF(.2, 40);  
d.fx.add( Crush(4,.1),  l, Clip(2, .25), Reverb() );  
s = Seq( function() { l.cutoff = rndf(0,.25);}, _8);  
Master.fx.add( Flanger() );`
**/
/**###HPF.cutoff : property
Float. The cutoff frequency of the filter. Range is 0..1
**/	
/**###HPF.resonance : property
Float. Emphasis of the cutoff frequency. Range is 0..50. Higher than 6 is scary. See example for higher than 6.
**/

function HPF(cutoff, resonance) {
	var that = Gibberish.Filter24(cutoff, resonance, false);
	that.name = "HPF";
	return that;
}

/**#Gain - FX
**description** : a simple gain controller, can be used to scale output for example after high amplitude distortions or resonant filters.  
  
**param** *gain*: Float. Default = 1. A multiple for the amplitude.
**/

/**###Gain.gain : property
Float. A multiple for the amplitude.
**/	

function Gain(gain) {
	var that = Gibberish.Gain(gain);
	that.name = "Gain";
	return that;
}

/**#Schizo - FX
**description** : A buffer shuffling / stuttering effect with reversing and pitch-shifting
### syntax 1:
**param** *properties* : Object. A dictionary of property keys and values to assign to the Schizo object
- - - - 
### syntax 2:
**param** *presetName* : String. The name of a Schizo preset to use. Current choices include "sane", "borderline" and "paranoid".

##Example Usage## 
`d = Drums("x*o*x*o-");
d.fx.add(Schizo('paranoid'));`
**/
/**###Schizo.rate : property
Integer, in samples. Default 11025. How often Schizo will randomly decide whether or not to shuffle.
**/	
/**###Schizo.chance : property
Float. Range 0..1. Default .25. The likelihood that incoming audio will be shuffled.
**/	
/**###Schizo.length : property
Integer, in samples. Default 22050. The length of time to play stuttered audio when stuttering occurs.
**/	
/**###Schizo.reverseChance : property
Float. Range 0..1. Default .5. The likelihood that stuttered audio will be reversed
**/	
/**###Schizo.pitchChance : property
Float. Range 0..1. Default .5. The likelihood that stuttered audio will be repitched.
**/	
/**###Schizo.pitchMin : property
Float. Range 0..1. Default .25. The lowest playback speed used to repitch the audio
**/	
/**###Schizo.pitchMax : property
Float. Range 0..1. Default 2. The highest playback speed used to repitch the audio.
**/	
function Schizo(props) {
	if(typeof Gibber.SchizoPresets === "undefined") {
		Gibber.SchizoPresets = {
			sane: {
				chance			: .1,
				reverseChance 	: 0,
				pitchChance		: .5,
				mix				:.5,
			},
			borderline: {
				chance			: .1,		
				pitchChance		: .25,
				reverseChance	: .5,
				mix				: 1,
			},
			paranoid: {
				chance			: .2,
				reverseChance 	: .5,
				pitchChance		: .5,
				mix				: 1,
			},
		};
	}

	var that = {
		chance: 	.25,		
		name:		"Schizo",
		rate: 		11025,
		length:		22050,
		reverseChance : .5,
		pitchChance : .5,
		pitchMin : .25,
		pitchMax : 2,
		mix : 1,
	};

	if(typeof arguments[0] === "object") {
		$.extend(that, arguments[0]);
	}else if(typeof arguments[0] === "string") {
		$.extend(that, Gibber.SchizoPresets[arguments[0]]);
		if(typeof arguments[1] === "object") {
			$.extend(that, arguments[1]);
		}
	}
	that.rate = G.time(that.rate);
	that.length = G.time(that.rate);
	
	that = Gibberish.BufferShuffler( that );
	
	return that;
}
