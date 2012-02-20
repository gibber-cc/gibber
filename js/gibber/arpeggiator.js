/* 	
Charlie Roberts 2012 MIT License
Requires gibber.js and chord.js found in the Gibber download.

Usage (assume s is a sine oscillator that has the Gibber mod method) :
a = audioLib.Arp(s, "Cm7", 2, .25, "updown");
*/

(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){

function Arp(gen, notation, beats, mode, mult, interpolate) {
	if(typeof arguments[0] === "string") {
		gen = null;
		notation = arguments[0], beats = arguments[1], mode = arguments[2], mult = arguments[3];
	}else{
		gen = arguments[0], notation = arguments[1], beats = arguments[2], mode = arguments[3], mult = arguments[4];
	}	
	
	this.speed = isNaN(beats) ? _4 : beats;
	this.mode = mode || "up";
	this.type = "complex";
	this.name = "Arp";
	
	this.gen = gen,
	this.notation = notation || "Cm7",
	this.mult = mult || 1;
	this.interpolate = interpolate || 0; // not programmed yet
	
	this.modded = [];
	if(gen != null) { this.slave(gen); }
}

Arp.prototype = {
	slave : function(gen) {
		var arr = [];
		for(var i = 0; i < this.mult; i++) {
			var tmp = [];
			
			var _root = this.notation.slice(0,1);
			var _octave, _quality;
			if(isNaN(this.notation.charAt(1))) { 	// if true, then there is a sharp or flat...
				_root += this.notation.charAt(1);	// ... so add it to the root name
				_octave = parseInt( this.notation.slice(2,3) );
				_quality = this.notation.slice(3);
			}else{
				_octave = parseInt( this.notation.slice(1,2) );
				_quality = this.notation.slice(3);
			}
			_octave += i;

			var _chord = teoria.note(_root + _octave).chord(_quality);
			for(var j = 0; j < _chord.notes.length; j++) {
				var n = _chord.notes[j];
				if(typeof gen.note === "function") {
					tmp[j] = n;
				}else{
					tmp[j] = n.fq();
				}
			}
			arr = arr.concat(tmp);
		}
		
		this.freqs 		= this.modes[this.mode]( arr );
		this.original 	= this.freqs.slice(0);
		this.seq = Seq(this.freqs, this.speed, gen)
	},
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
	reset : function(num)  { 
		if(isNaN(num)) {
			this.seq.reset();
		}else{
			this.seq.reset(num); 
		}
	},
	
	retain : function(num) { 
		if(isNaN(num)) {
			this.seq.retain();
		}else{
			this.seq.retain(num); 
		}
	},

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