//  Gibber.js - string.js
// ###Pluck
// A Karplus-Strong implementation by thecharlie
//
// param **damping**: Float. Default = 0. The speed at which the string decays. Note that higher frequencies decay faster than lower frequencies in the (basic) Karplus-Strong implementation
// param **blend**: Float. Default = 1. 1 gives string sounds, .5 gives noisy sounds, 0 gives weird sounds  
// param **color**: String. Default = "white". The type of noise used in the alogrithm. The options are "white", "pink", and "brown"
//
// example usage:    
// `p = Pluck(0, 1, "pink");  
//  p.note( "A3" );  `
/*
p = Pluck({damping:0, blend:1, maxVoices:1}).out();

p.note(450);

s = ScaleSeq(filli(-5,7,128), _32).slave(p);
s.mode = "phrygian";
s.root = "G3";

s.humanize = 200;
*/

function Pluck (damping, blend, amp, color){
	var that = {};

	if(typeof arguments[0] === "object") {
		that = Gibberish.PolyKarplusStrong( arguments[0] );
	}else{
		var props = {
			damping : (isNaN(damping)) ? 0 : damping / 100,
			blend	: (isNaN(blend)) ? 1 : blend,
			amp		: amp || .5,
			maxVoices: 1,
		};
		
		that = Gibberish.PolyKarplusStrong( props );
	}

	that.note = Gibber.makeNoteFunction(that);
	that.chord = Gibber.chord;

	that.send(Master, that.amp);	
	
	return that;
}