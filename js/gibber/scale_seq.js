function ScaleSeq(_sequence, _speed) {
	var _sequenceNumbers = ($.isArray(_sequence)) ? _sequence.slice(0) : _sequence.sequence.slice(0);
	
	_sequence.doNotAdvance = true; // do not start sequence until scale and pattern has been set.	
	var that = Seq(_sequence, _speed);
	_sequence.doNotAdvance = false;

	that.name = "ScaleSeq";
	that.type = "control";
	
	that.sequenceNumbers = _sequenceNumbers;

	that.mode = that.mode || Gibber.mode;
	that.root = that.root || Gibber.root;

	that.scaleInit = false;
	that.counter = 0;
	
	if(typeof arguments[0] !== "object" && $.isArray(arguments[0]) === true) {
		that.sequence = _sequence;
		that.slaves = [];
	}
		
	that.createPattern = function(sequence) {
		var _rootoctave = this.root.octave;
		this.sequenceNumbers = sequence;
		this.scale = [];
		
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
		 		this.scale[negCount--] = nt;	// negative array indices!!!!! The magic of js.
		 	}
		}
		
		if(this.sequence != null) {
			this.sequence.length = 0;
		}else{
			this.sequence = [];
		}
		
		for(var i = 0; i < this.sequenceNumbers.length; i++) {
			this.sequence.push(this.scale[this.sequenceNumbers[i]]);
		}
		
		this.setSequence(this.sequence);
		// if(this.scaleInit === false && this.slaves.length != 0) {
		// 	this.scaleInit = true;
		// 	console.log("CALLED CALLED CALLED")
		// 	this.advance();
		// }
	};
	
	that.set = function(sequence) {
		that.createPattern(sequence);
	};
	
	(function(obj) {
	    var root = obj.root;
		var speed = obj.speed;
		var mode = obj.mode;
		var that = obj;
	    Object.defineProperties(that, {
			"root" : {
		        get: function() {
		            return root;
		        },
		        set: function(value) {
		            root = teoria.note(value);
					that.createPattern(that.sequenceNumbers);
		        }
			},
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
	return that;
}
