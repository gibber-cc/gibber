/* 	
Charlie Roberts 2012 MIT License
Requires gibber.js and chord.js found in the Gibber download.

Usage (assume s is a sine oscillator that has the Gibber mod method) :
a = audioLib.Arp(s, "Cm7", 2, .25, "updown");
*/

(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){

function Arp(notation, beats, mode, mult) {
	this.mode = mode || "up";
	this.notation = notation || "Cm7";
	this.mult = mult || 1;
	this.speed = isNaN(beats) ? _4 : beats;
		
	this.type = "complex";
	this.name = "Arp";
	
	this.notes = [];
	this.modded = [];
	
	this.seq = Seq();
	
	this.original = this.notes.slice(0);
	
	(function(obj) {	
		var that = obj;
		var speed = obj.speed;
		
		Object.defineProperties(that, {
			"speed": {
				get: function(){ return speed; },
				set: function(value) {
					speed = value;
					this.seq.setSequence(this.notes, speed, false);
				}
			}
		});
	})(this);
	
	this.chord(this.notation);
}

Arp.prototype = {
	chord : function(_chord, shouldReset) {
		var arr = [];
		
		this.notation = _chord;

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
				_quality = this.notation.slice(2);
			}
			_octave += i;

			var _chord = teoria.note(_root + _octave).chord(_quality);
			for(var j = 0; j < _chord.notes.length; j++) {
				var n = _chord.notes[j];
				tmp[j] = n;
			}
			arr = arr.concat(tmp);
		}	
		this.notes = this.modes[this.mode]( arr );
		this.seq.setSequence(this.notes, this.speed, shouldReset);	
	},
	set : function(_chord, _speed, _mode, octaveMult, shouldReset) {
		this.speed = _speed || this.speed;
		this.mode = _mode || this.mode;
		this.mult = octaveMult || this.mult;
		
		this.chord(_chord, shouldReset); // also sets sequence
	},
	
	slave : function(gen) {
		this.gen = gen;
		this.seq.slave(this.gen);
		if(typeof this.gen.note === "undefined") { this.seq.outputMessage = "freq"; }		
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

function Arp(notation, beats, mode, mult) {
	return new audioLib.Arpeggiator(notation, beats, mode, mult);
}