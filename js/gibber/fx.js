//  Gibber.js - fx.js
// ========================


// ###Bus
// Create a bus holding fx that signals can be routed to 
//
// param **name**: String Optional name that can be used to refer to the new bus.  
// param **---**: variable length object list. A comma delimited list of effects to attach to the bus.  
//
// example usage:  
//	`b = Bus( Delay(_4), Reverb() );  
//  s = Synth();  
//	s.send( b, .5 ); 
//
// alternatively:  
//	`b = Bus( "rev", Delay(_4), Reverb() );  
//  s = Synth();  
//	s.send( "rev", .5 );  `
//
// Note that when Reverb is placed on a bus it defaults to outputting only the wet signal; this is different from how it behaves in an fx chain.

function Bus() { // name is id, fx is array, ahem, fx
	var bus = Gibberish.Bus(arguments).connect(Master);
	return bus;
}

// ##Reverb#
// based off audiolib.js reverb and freeverb
//
// param **roomSize**: Float. Default = .8. The size of the room being emulated  
// param **damping**: Float. Default = .3. Attenuation of high frequencies that occurs  
// param **wet**: Float. Default = .75. The amount of processed signal that is output  
// param **dry**: Float. Default = .5. The amount of dry signal that is output  
//
// example usage:    
// `s = Synth();  
//  s.fx.add( Reverb() );  `

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

// ###Delay
//
// param **time**: Int. Default = _4. The number of samples betweeen echoes, usually expressed in Gibber time variables
// param **feedback**: Float. Default = .3. How much of the output is fed back into the input of hte delay  
//
// example usage:    
// `s = Synth();  
//  s.fx.add( Delay() );  `

function Delay(time, feedback) {
	var that = Gibberish.Delay(time, feedback);
	that.name = "Delay";
	return that;	
};

// ###Ring
// A Ring Modulator
//
// param **frequency**: Float. Default = 440. The frequency of the sine wave that the signal is multiplied by  
// param **amount**: Float. Default = 1. The amplitude of the sine wave the signal is multiplied by  
//
// example usage:    
// `s = Synth();  
//  s.fx.add( Ring(220, .5) );  `

function Ring(frequency, amount) {
	var that = Gibberish.RingModulator(frequency, amount);
	that.name = "Ring";
	return that;
}

// ###Crush
// A bit-crusher / sample-rate reducer
//
// param **resolution**: Float. Default = 8. The number of bits to truncate the output to  
//
// example usage:    
// `d = Drums("xoxo");  
//  d.fx.add( LPF(420, .5) );  `

function Crush(bitDepth, sampleRate) {
	var that = Gibberish.Decimator({bitDepth:bitDepth, sampleRate:sampleRate});
	that.name = "Crush";
	return that;
}

// ###Clip
// A simple waveshaping distortion using y = x / (1+|x|)
//
// param **amount**: Float. Default = 4. The amount of distortion
// Clip also has a logarithmic volume adapter to the equation so that you can
// apply extreme amounts of clipping
// TODO: store base2 log for faster calculations
//
// example usage:    
// `d = Drums("xoxo");  
//  d.fx.add( Clip(1000) );  `

window.Dist = window.Clip = function(amount, amp) {
	var that = Gibberish.SoftClip(amount, amp);
	that.name = "Clip";
	return that;
}

// ###LPF 24db ladder-style filter
//
// param **cutoff**: Float. Default = 300. The cutoff frequency of the filter  
// param **resonance**: Float. Default = 3. Emphasis of the cutoff frequency  
//
// example usage:    
// `d = Drums("xoxo");  
//  d.fx.add( LPF(420, .5) );  `

function LPF(cutoff, resonance, mix) {
	var that = Gibberish.Filter24(cutoff, resonance, true);
	that.name = "LPF";
	return that;
}


function HPF(cutoff, resonance) {
	var that = Gibberish.Filter24(cutoff, resonance, false);
	that.name = "HPF";
	return that;
}