function ScaleSeq(_sequence, _speed, _gen) {
	var that = {
		root : Gibber.root,
		sequenceNumbers : _sequence,
		mode : Gibber.mode,
		
		gen : _gen,
		sequence : [],
		speed : _speed,
		seq : null,
		slaves : [],
	};
		
	that.setSequence = function(sequence) {
		var _rootoctave = this.root.octave;
		this.sequenceNumbers = sequence;
		this.sequence.length = 0;
		this.scale = [];
		
		console.log("root " + this.root + " mode " + this.mode);

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
		
		for(var i = 0; i < this.sequenceNumbers.length; i++) {
			this.sequence.push(this.scale[this.sequenceNumbers[i]]);
		}
	};
	
	(function() {
	    var root = that.root;
		var speed = that.speed;
		var mode = that.mode;

	    Object.defineProperties(that, {
			"root" : {
		        get: function() {
		            return root;
		        },
		        set: function(value) {
		            root = teoria.note(value);
					this.setSequence(this.sequenceNumbers);
					if(this.seq != null) {
						this.seq.set(this.sequence);
					}
		        }
			},
			"speed": {
				get: function(){ return speed; },
				set: function(value) {
					speed = value;
					this.seq.speed = speed;
				}
			},
			"mode" : {
		        get: function() {
		            return mode;
		        },
		        set: function(value) {
		            mode = value;
					this.setSequence(this.sequenceNumbers);
					if(this.seq != null) {
						this.seq.set(this.sequence);
					}
		        }
			},
			 
	    });
	})();
	
	// pass methods to seq object... TODO: this should probably just inherit somehow.
	that.shuffle 	= function() 	{ that.seq.shuffle(); };
	that.reset 		= function() 	{ that.seq.reset(); }
	that.retain 	= function() 	{ that.seq.retain(arguments[0]); }
	that.slave 		= function(gen) { this.seq.slaves.push(gen); };
	that.stop  		= function() 	{ this.seq.stop();  }
	that.play  		= function() 	{ this.seq.play();  }
	that.pause 		= function() 	{ this.seq.pause(); }
	
	that.free = function() {
		if(arguments.length == 0) {
			this.seq.slaves.length = 0;
		}else{
			this.seq.slaves.splice(arguments[0], 1);
		}
	};

	that.root = Gibber.root;	// triggers meta-setter that sets sequence
	that.seq = Seq(that.sequence, that.speed, that.gen);
	
	return that;
}


//function Seq(_seq, speed, gen, _outputMsg) {
function Seq() {
	
	var _seq = arguments[0];
	var speed = window["_" + arguments[0].length];
	var gen = null;
	var _outputMsg = null;
	
	// variable argument list parsing
	switch(arguments.length) {
		case 1: break;
		case 2:
			if(typeof arguments[1] === "number") {
				speed = arguments[1];
			}else if(typeof arguments[1] === "object") {
				gen = arguments[1];
			}else{
				_outputMsg = arguments[1];
			}
		break;
		case 3:
			if(typeof arguments[1] === "number") {
				speed = arguments[1];
			}else if(typeof arguments[1] === "object") {
				gen = arguments[1];
			}else{
				_outputMsg = arguments[1];
			}
			if(typeof arguments[2] === "number") {
				speed = arguments[2];
			}else if(typeof arguments[2] === "object") {
				gen = arguments[2];
			}else{
				_outputMsg = arguments[2];
			}
		break;
		case 4:
			speed = arguments[1];
			gen = arguments[2];
			_outputMsg = arguments[3];
		break;
		default: break;
	};
	
	sequence = _seq;
	
	if(_outputMsg === null) {
		if(gen != null) {
			if(typeof gen.note === "undefined") {
				_outputMsg = "freq";
			}else{
				_outputMsg = "note";
			}
		}else{
			_outputMsg = "note";
		}
	}
	
	var that = {
		_sequence : sequence,
		sequence : sequence,
		_start : true,
		counter : -1,
		speed: speed,
		outputMessage:_outputMsg,
		active:true,
		slaves: [],
		phase: 0,
		memory: [],
		init: true,
	}
	
	that.setSequence = function(seq, speed, shouldReset) {
		if(typeof speed != "undefined") {
			if(!shouldReset) {
				this.phase -= this.speed - speed;
			}
			this.speed = speed;
		}
		
		this.sequence = [];
		
		if(typeof seq === "string") {
			for(var c = 0; c < seq.length; c++) {
				var _c = seq.charAt(c);
				this.sequence.push(_c);
			}
		}else{
			for(var i = 0; i < seq.length; i++) {
				var n = seq[i];
				this.sequence[i] = n;
			}
		}
		
		if(shouldReset) {
			this.phase = 0;
		}
		
		this.sequenceLengthInSamples = seq.length * this.speed;
	};
	
	that.slave = function(gen) {
		this.slaves.push(gen);
		//if(typeof gen.note === "undefined") { this.outputMessage = "freq"; }		
	};
	
	that.free = function() {
		if(arguments.length == 0) {
			this.slaves.length = 0;
		}else{
			this.slaves.splice(arguments[0], 1);
		}
	};
	
	that.stop = function() {
		this.active = false;
	};
	
	that.pause = function() {
		this.active = false;
	};
		
	that.play = function() {
		this.active = true;
		this.phase = 0;
	};
	
	that.generate = function() {
		this.value = 0;
		if(!this.active) {
			return;
		}
		
		if(this.phase % this.speed <= .5) {
			this.counter++;
			var val = this.sequence[this.counter % this.sequence.length];
			
			// Function sequencing
			// TODO: there should probably be a more robust way to to this
			// but it will look super nice and clean on screen...
			if(typeof val === "function") {
				val();
				if(this.phase >= this.sequenceLengthInSamples - 1) {
					this.phase = 0;
				}else{
					this.phase++;
				}
				return;
			}
			
			for(j = 0; j < this.slaves.length; j++) {
				var slave = this.slaves[j];
	
				if(this.outputMessage === "freq") {
					if(typeof val === "string" ) {
						var n = teoria.note(val);
						val = n.fq();
					}else if(typeof val === "object"){
						val = val.fq();
					}
				}
				if(typeof slave[this.outputMessage] === "function") {
					//if(Gibber.debug) console.log("calling function " + this.outputMessage);					
					slave[this.outputMessage](val);
				}else{
					console.log("outputting " + this.outputMessage);
					slave[this.outputMessage] = val;
				}
			}
		}
		
		if(this.phase >= this.sequenceLengthInSamples - 1) {
			if(this.shouldBreak) { 
				console.log("breaking");
				this.shouldBreak = false;
				if(!this.breakToOriginal) {
					console.log("original");
					this.sequence = jQuery.extend(true, {}, this.preBreakSequence);
				}else{
					console.log("Last");;
					this.sequence = jQuery.extend(true, {}, this._sequence);
				}
				this.setSequence(this.sequence, this.speed);
				console.log(this.sequence);
			}
			this.phase = 0;
		}else{
			this.phase++;
		}
	}
	
	that.break = function(newSeq, breakToOriginal) {
		this.shouldBreak = true;
			
		if(breakToOriginal) {
			this.breakToOriginal = true;
		}
		console.log("BREAK");
		this.preBreakSequence = jQuery.extend(true, {}, this._sequence);
		console.log(this.preBreakSequence);
	};
	
	
	
	that.getMix = function(){
		return 0;
	}
	
	that.out = function() {
		this.generate();
		return 0;
	}
	that.set = function(newSequence, speed, shouldReset) {
		this.sequence = newSequence;
		this.setSequence(this.sequence, speed, shouldReset);
	}
	
	that.bpmCallback = function() {
		var that = this;
		return function(percentageChangeForBPM) {
			that.speed *= percentageChangeForBPM;
			that.setSequence(that.sequence, that.speed);
		}
	}
	
	Gibber.registerObserver( "bpm", that.bpmCallback() );
	
	that.shuffle = function() {
		this.sequence.shuffle();
		this.setSequence(this.sequence, this.speed);
	}
	
	that.reset = function() {
		if(arguments.length === 0) {
			this.setSequence(this._sequence, this.speed);
		}else{
			this.setSequence(this.memory[arguments[0]]);
		}
	}
	
	that.retain = function() {
		if(arguments.length != 0) {
			this.memory.push(this.sequence);
		}else{
			this.memory[arguments[0]] = this.sequence;
		}
	}
	

	that.setSequence(that.sequence, that.speed);	
	
	Gibber.controls.push(that);
	
	if(gen != null) {
		that.slave(gen);
	}
	
	return that;
}