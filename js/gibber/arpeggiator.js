/* 	
Charlie Roberts 2012 MIT License
Requires gibber.js and chord.js found in the Gibber download.

Usage (assume s is a sine oscillator that has the Gibber mod method) :
a = audioLib.Arp(s, "Cm7", 2, .25, "updown");

TODO: does traversing the prototype chain cause the huge performance spike vs. a seq object?
*/

(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){

function Arp(notation, beats, mode, mult) {
	this.slaves = [];
	this.sequence = [];
	this._sequence = [];	
	this.notes = [];
	this.mode = mode || "up";
	this.notation = notation || "Cm7";
	this.mult = mult || 1;
	this.init = false;
	
	// wrap this in closures for easy sequencing
	var that = this;
	this.shuffle = function() {
		that.sequence.shuffle();
		that.setSequence(that.sequence, that.speed);
	};
	
	this.reset = function() {
		if(arguments.length === 0) {
			console.log(that._sequence);
			that.setSequence(that._sequence, that.speed);
		}else{
			that.setSequence(that.memory[arguments[0]]);
		}
	};
	
	this.__proto__.__proto__ = Seq();
	
	this.speed = isNaN(beats) ? _4 : beats;
	
	this.chord(this.notation);	// this sets the sequence
	this._sequence = this.notes.slice(0);	
}

Arp.prototype = {
	name : "Arp",
	type : "control",
	
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
		this.setSequence(this.notes, this.speed, shouldReset);
	},
	
	set : function(_chord, _speed, _mode, octaveMult, shouldReset) {
		this.speed = _speed || this.speed;
		this.mode = _mode || this.mode;
		this.mult = octaveMult || this.mult;
		
		this.chord(_chord, shouldReset); // also sets sequence
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
}
//Arp.prototype.__proto__ = Seq();	

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