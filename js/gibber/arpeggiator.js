/**#Arp - Sequencer
The Arpeggiator takes a chord and plays the individual notes comprising it in succession, with different possible patterns.
It is basically an extended [Seq](javascript:Gibber.Environment.displayDocs('Seq'\)) object. The available patterns are:  
  
*	*up* : Play the notes in ascending order. After the top note, drop back to the bottom  
*	*down* : Play the notes in descending order. After the bottom note, jump to the top  
*	*updown* : Play the notes all the way up, and then play them all the way down. The top and bottom notes repeat when changing direction  
*	*updown2* : Play the notes all the way up, and then play them all the way down. The top and bottom notes DO NOT repeat when changing direction  
## Example Usage ##
`a = Sine();
b = Arp('c2m7', _32, 'updown2', 4).slave(s);
`
## Constructor
  **param** *notation* : String. The chord to be sequenced.  
  **param** *duration* : Integer. The duration for each note in the arpeggio.  
  **param** *pattern* : String. Default: "up". The ordering for the arpeggio.  
  **param** *mult* : Integer. How many octaves the arpeggio should span. The default is 1.
**/

function Arp(notation, beats, pattern, mult, scale) {	
	var that = Seq();
	that.name = "Arp";
	that.notes = [];
	that.pattern = pattern || "up";
	that.notation = notation || "C4m7";
	that.mult = mult || 1;
	that.init = false;
	that.speed = isNaN(beats) ? _4 : beats;
	that.scale = scale || null;
	
/**###Arp.chord : method
**param** *chord name* String. The chord to be sequenced.
	
**description** : Change the chord that the Arpeggiator is arpeggiating.
**/
	that.chord = function(_chord, shouldReset) {
		var arr = [];
		this.notation = _chord;
		
		if(typeof this.scale === 'undefined' || this.scale === null && typeof _chord === 'string') {
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

		}else{
			for(var i = 0; i < this.mult; i++) {
				var tmp = [];
				
				for(var j = 0; j < this.notation.length; j++) {
					tmp[j] = this.notation[j] + (7 * i);
				}
				arr = arr.concat(tmp);
			}	
		}
		this.note = this.patterns[this.pattern]( arr );
		this.sequences.push("note");
		
		
		// if(this.init) {
		// 	this.sequences.note = this.notes;
		// 	//this.setSequence(this.notes, this.speed, shouldReset);
		// }
	};
	
	that.set = function(_chord, _speed, _pattern, octaveMult, shouldReset) {
		this.speed = _speed || this.speed;
		this.pattern = _pattern || this.pattern;
		this.mult = octaveMult || this.mult;
		
		this.chord(_chord, shouldReset); // also sets sequence
	};
		
	that.patterns = {
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
				
	//that.setSequence(that.notes, that.speed, false);
				
	that._sequence = that.notes.slice(0);	
	that._init = true;
	
	return that;
}