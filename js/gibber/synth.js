//  Gibber - synth.js
// ========================

// ###Synth
// Create an oscillator with an attached envelope that can be triggered by note messages.
//
// param **attack**: Int in ms. The number of milliseconds the attack of the synth's envelope lasts  
// param **decay** : Int in ms. The number of milliseconds the decay of the synth's envelope lasts  
// param **volume** : Float. The volume of the synth.  
//
// example usage:  
//	`s = Synth(1000, 2000, .5);  
//   s.note("A4");  `

function Synth(attack, decay, amp) {
	var that;
	if(typeof arguments[0] === "object") {
		that = arguments[0];
		if(isNaN(that.maxVoices)) that.maxVoices = 1;
		
		that = Gibberish.PolySynth(that);
	}else{
		that = {};
		
		if(! isNaN(attack)) that.attack = Math.round(attack * 44.1);
 		if(! isNaN(decay)) that.decay = Math.round(decay * 44.1);
		if(! isNaN(amp)) that.amp = amp;
		
		that.maxVoices = 1;

		that = Gibberish.PolySynth(that);
	}
	
	that.note = Gibber.makeNoteFunction(that);
	that.chord = Gibber.chord;	
	
	that.send(Master, that.amp);
	
	return that;
}