//  Gibber - ScaleSequence.js
// ========================

/**#ScaleSeq
ScaleSeq inherits from the [Seq](javascript:Gibber.Environment.displayDocs('Seq'\)) object. By default it is used to send note messages
where each note belongs to a specific scale. The scale is defined by giving a root note and a mode. All of the normal modes (aeolian,
phrygian, lydian etc.) are supported, in addition to chromatic.
## Example Usage ##
`a = Synth();
s = ScaleSeq([0,1,2,3], [_4, _16, _8]).slave(a);  
b = Synth();
t = ScaleSeq({
	note:[0,2,4,5,7],
	durations:[_1, _2, _4],
	root:"C4",
	mode:"lydian",
	slaves:a
})`
## Constructors
### syntax 1:
  **param** **values** : Array. The note positions in the scale you want to sequence. Negative numbers will create notes lower than the root.  
  
  **param** **duration** : Array or Gibber time value. The length for each value in the sequence. This can either be a single Gibber time value or an array of Gibber time values.  
  
- - - -
### syntax 2: 
  **param** **arguments** : Object. A dictionary of messages, durations and slaves to be sequenced. See example.
**/


function ScaleSeq(_sequence, _speed) {
	var _sequenceNumbers = ($.isArray(_sequence)) ? _sequence.slice(0) : _sequence.note.slice(0);
	
	if($.isArray(arguments[0]) === true) {
		_sequence = {
			note:_sequence,
		};
		if($.isArray(_speed)) {
			_sequence.durations = _speed;
		}else{
			_sequence.speed = _speed;
		}
	}
	_sequence.doNotAdvance = true; // do not start sequence until scale and pattern has been set.
	
	var that = Seq(_sequence);
	
	that.name = "ScaleSeq";
	that.type = "control";
	
	that.sequenceNumbers = _sequenceNumbers;
	that.mode = that.mode || Gibber.mode;
	that.root = that.root || Gibber.root;
	that.scaleInit = false;
	that.counter = 0;
	that.scale = [];
	this.note = [];
	if(typeof arguments[0] !== "object" && $.isArray(arguments[0]) === true) {
		that.sequence = _sequence;
		that.slaves = [];
	}
	
	that.createPattern = function(sequence) {
		var _rootoctave = this.root.octave;
		this.sequenceNumbers = sequence;
		this.scale.length = 0;

		var _scale = teoria.scale.list(this.root, this.mode, false);

		for(var oct = _rootoctave, o = 0; oct < 8; oct++, o++) {
			for(var num = 0; num < _scale.length; num++) {
				var nt = jQuery.extend({}, _scale[num]);
				nt.octave += o;
				this.scale.push(nt);
			}
		}

		var negCount = -1;
		for(var oct = _rootoctave -1, o = -1; oct >= 0; oct--, o--) {
		 	for(var num = _scale.length - 1; num >= 0; num--) {
		 		var nt = jQuery.extend({}, _scale[num]);
		 		nt.octave += o;
		 		this.scale[negCount--] = nt;
		 	}
		}
		
		this.note.length = 0;
		
		for(var i = 0; i < this.sequenceNumbers.length; i++) {
			if(!$.isArray(this.sequenceNumbers[i])) {
				this.note.push(this.scale[this.sequenceNumbers[i]]);
			}else{
				this.note.push([this.scale[this.sequenceNumbers[i][0]], this.sequenceNumbers[i][1]]);
			}
		}
		
		if($.inArray("note", this.sequences) === -1) {
			this.sequences.push("note");
		}
		
		//this.setSequence(this.sequence);
		if(this.scaleInit === false) {
		 	this.scaleInit = true;
		 	this.memory[0] = this.sequence;
		}
	};
	
	that.set = function(sequence) {
		that.createPattern(sequence);
	};
	
	that.reset = function() {
		that.set(that._sequence);
	};
	// that.reset = function() {
	// 	if(arguments.length === 0) {
	// 		if(that.durations === null) {
	// 			that.setSequence(that.memory[0], that.speed);
	// 		}else{
	// 			that.setSequence(that.memory[0], that.durations);
	// 		}
	// 	}else{
	// 		that.setSequence(that.memory[arguments[0]]);
	// 	}
	// 	return that;
	// };
	
	
	(function(obj) {
	    var root = obj.root;
		var speed = obj.speed;
		var mode = obj.mode;
		var that = obj;
	    Object.defineProperties(that, {
/**###ScaleSeq.root : property
String. The root note for the scale. Possibilities are written in the form of "C#3" or "Bb2" for c-sharp in the third octave and b-flat in
the second ocatve.
**/	
			"root" : {
		        get: function() {
		            return root;
		        },
		        set: function(value) {
		            root = teoria.note(value);
					that.createPattern(that.sequenceNumbers);
		        }
			},
/**###ScaleSeq.mode : property
String. The mode of the scale. Uses standard modes (such as locrian, mixolydian etc.) and also adds chromatic.
**/	
			"mode" : {
		        get: function() {
		            return mode;
		        },
		        set: function(value) {
		            mode = value;
					that.createPattern(that.sequenceNumbers);
		        }
			},
			 
	    });
	})(that);
	
	that.root = that.root || Gibber.root; // triggers meta-setter that sets sequence
	that.counter = 0;

	that.doNotAdvance = false;	
	if(that.slaves.length !== 0) {
		that.advance(); // wait to advance until mode and root have been configured correctly.
	}

	
	return that;
}
