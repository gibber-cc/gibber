/* 	
Charlie Roberts 2012 MIT License
Requires gibber.js and chord.js found in the Gibber download.

Usage (assume s is a sine oscillator that has the Gibber mod method) :
a = audioLib.Arp(s, "Cm7", 2, .25, "updown");
*/

(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){

function Arp(gen, notation, octave, beats, mode, mult, interpolate) {
	this.speed = isNaN(beats) ? _4 : beats;
	this.mode = mode || "up";
	this.type = "complex";
	this.name = "Arp";
	
	this.gen = gen,
	this.notation = notation || "Cm7",
	this.octave = (isNaN(octave)) ? 2 : octave,
	this.mult = mult || 1;
	this.interpolate = interpolate || 0; // not programmed yet
	
	var arr = [];
	for(var i = 0; i < this.mult; i++) {
		var tmp;
		if(typeof gen.note !== "undefined") {
			tmp = Chord(this.notation, this.octave + i);
		}else{
			var tmp = [];
			var _chord = ChordFactory.createNotations(this.notation, this.octave);
	
			for(var i = 0; i < _chord.length; i++) {
				tmp[i] = Note.getFrequencyForNotation(_chord[i]);
			}
		}
		arr = arr.concat(tmp);
	}
	
	this.freqs 		= this.modes[this.mode]( arr );
	this.original 	= this.freqs.slice(0);
	this.seq = Seq(this.freqs, this.speed, gen)
	
	this.modded = [];
}

Arp.prototype = {
	modes : {
		up : function(array) {
			return array;
		},
		down : function(array) {
			return array.reverse();
		},
		updown : function(array) {
			var _tmp = array.slice(0);
			_tmp.reverse();
			return array.concat(_tmp);
		}
	},
	shuffle: function() { this.seq.shuffle(); },
	reset: function() { this.seq.reset(); },
	
	replace : function(replacement){
		if(replacement.name != "Arp") {
			if(replacement.type == "mod") {
				var idx = jQuery.inArray( this.step, this.gen.mods );
				if(idx > -1) {
					this.gen.mods.splice(idx,1,replacement);
					replacement.gens.push(this.gen);
				}
			}
		}else{
			var idx = jQuery.inArray( this.step, this.gen.mods );
			if(idx > -1) {
				this.gen.mods.splice(idx,1,replacement.step);
				replacement.gens.push(this.gen);
			}
		}
	},
}

audioLib.Arpeggiator = Arp;
		
}(audioLib));
audioLib.plugins('Arpeggiator', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
	exports.init = initPlugin;
} else {
	initPlugin(audioLib);
}

}());

function Arp(gen, notation, octave, beats, mode, mult) {
	return new audioLib.Arpeggiator(gen, notation, octave, beats, mode, mult);
}