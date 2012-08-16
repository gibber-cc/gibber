//  Gibber.js - fx.js
// ========================

/*#Flanger
**description** : A traditional flanger using a variable-length comb filter.
  
**param** *rate*: Float. Default = .25. Measured in Hz, this is the speed that the delay line size fluctuates at  
**param** *amount*: Int. Default = 125. The amount that the size of the delay line fluctuates by  
**param** *feedback*: Float. Default = .25. Feedback for the flanger. Increase to get a more pronounced effect  
**param** *offset*: Int. Default = amount. The offset of the flanger's comb filter from the current sample. By default this is the same as the amount parameter  

## Example Usage ##
`p = Pluck(0, 1);    
p.fx.add( Flanger() );   
p.note( "A3" );`
*/

/**###Flanger.rate : property
Float. Hz. the speed that the delay line size fluctuates at.
**/	
/**###Flanger.amount : property
Float. Hz. The amount that the size of the delay line fluctuates by.
**/	

/**#Bus
**description** : Create a bus holding fx that signals can be routed to 
*param* *name*: String Optional name that can be used to refer to the new bus.  
*param* *fx*: variable length object list. A comma delimited list of effects to attach to the bus.  
##Example Usage##    
`b = Bus( Delay(_4), Reverb() );  
 s = Synth();  
s.send( b, .5 ); 
alternatively:  
`b = Bus( "rev", Delay(_4), Reverb() );  
 s = Synth();  
s.send( "rev", .5 );`
**/

function Bus() { // name is id, fx is array, ahem, fx
	var bus = Gibberish.Bus(arguments).connect(Master);
	return bus;
}

/**#Reverb
**description** :  based off audiolib.js reverb and freeverb

**param** *roomSize*: Float. Default = .8. The size of the room being emulated  
**param** *damping*: Float. Default = .3. Attenuation of high frequencies that occurs  
**param** *wet*: Float. Default = .75. The amount of processed signal that is output  
**param** *dry*: Float. Default = .5. The amount of dry signal that is output  

##Example Usage##
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
/**###Reverb.roomSize : property
Float. Default = .5. The amount of dry signal that is output
**/	
function Reverb(roomSize, damping, wet, dry) {
	var that;
	if(typeof arguments[0] === "object") {
		that = Gibberish.Reverb( arguments[0] );
	}else{
		var props = {
			roomSize : (isNaN(roomSize)) ? .5 : roomSize,
			damping	: (isNaN(damping)) ? .2223 : damping,
			wet		: wet || .5,
			dry		: dry || .55,
		};
		
		that = Gibberish.Reverb( props );
	}
	that.name = "Reverb";
	return that;
}

/**#Delay

**param** *time*: Int. Default = _4. The number of samples betweeen echoes, usually expressed in Gibber time variables
**param** *feedback*: Float. Default = .3. How much of the output is fed back into the input of hte delay  

##Example Usage##    
`s = Synth();  
s.fx.add( Delay() );`
/**###Delay.time : property
Int. The number of samples betweeen echoes, usually expressed in Gibber time variables
**/	
/**###Delay.feedback : property
Float. How much of the output is fed back into the input of the delay.
**/	

function Delay(time, feedback) {
	var that = Gibberish.Delay(time, feedback);
	that.name = "Delay";
	return that;	
};


/**#Ring

**param** *frequency*: Float. Default = 440. The frequency of the sine wave that the signal is multiplied by  
**param** *amount*: Float. Default = 1. The amplitude of the sine wave the signal is multiplied by  
##Example Usage##
`s = Synth();  
s.fx.add( Ring(220, .5) );`

/**###Ring.frequency : property
Float. The frequency of the sine wave that the signal is multiplied by  
**/	
/**###Delay.feedback : property
Float. The amplitude of the sine wave the signal is multiplied by  
**/	

function Ring(frequency, amount) {
	var that = Gibberish.RingModulator(frequency, amount);
	that.name = "Ring";
	return that;
}

/**#Crush
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
	var that = Gibberish.Decimator({bitDepth:bitDepth, sampleRate:sampleRate});
	that.name = "Crush";
	return that;
}

/**#Clip
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
	var that = Gibberish.SoftClip(amount, amp);
	that.name = "Clip";
	return that;
}

/**#LPF 
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

/**#HPF 
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

/**#Gain 
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
