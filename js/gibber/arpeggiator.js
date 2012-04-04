/* 	
Charlie Roberts 2012 MIT License
Requires gibber.js and chord.js found in the Gibber download.

Usage (assume s is a sine oscillator) :
a = Arp(s, "Cm7", 2, .25, "updown");

*/
function Arp(notation, beats, mode, mult) {	
	var that = Seq();
	that.name = "Arp";
	that.notes = [];
	that.mode = mode || "up";
	that.notation = notation || "C4m7";
	that.mult = mult || 1;
	that.init = false;
	that.speed = isNaN(beats) ? _4 : beats;
	
	that.chord = function(_chord, shouldReset) {
		var arr = [];
		
		this.notation = _chord;

		for(var i = 0; i < this.mult; i++) {
			var tmp = [];
			
			var _root = this.notation.slice(0,1);
			var _octave, _quality;
			if(isNaN(this.notation.charAt(1))) { 	// if true, then there is a sharp or flat...
				_root += this.notation.charAt(1);	// ... so add it to the root name
				_octave  = parseInt( this.notation.slice(2,3) );
				_quality = this.notation.slice(3);
			}else{
				_octave  = parseInt( this.notation.slice(1,2) );
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
		if(this.init) this.setSequence(this.notes, this.speed, shouldReset);
	};
	
	that.set = function(_chord, _speed, _mode, octaveMult, shouldReset) {
		this.speed = _speed || this.speed;
		this.mode = _mode || this.mode;
		this.mult = octaveMult || this.mult;
		
		this.chord(_chord, shouldReset); // also sets sequence
	};
		
	that.modes = {
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
		},
		updown2 : function(array) { // do not repeat highest and lowest notes
			var _tmp = array.slice(0);
			_tmp.pop();
			_tmp.reverse();
			_tmp.pop();
			return array.concat(_tmp);
		}
	};
	
	that.chord(that.notation);	// this sets the sequence
				
	that.setSequence(that.notes, that.speed, false);
				
	that._sequence = that.notes.slice(0);	
	that._init = true;
	
	return that;
}