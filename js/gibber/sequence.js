function Intervals(_root, _quality, _sequence, _speed, _gen) {	
	var that = {
		root : _root,
		sequenceNumbers : _sequence,
		quality : _quality,
		gen : _gen,
		sequence : [],
		speed : _speed,
		seq : null,
	};
		
	that.setSequence = function(sequence) {
		var _rootoctave = this.root.octave;
		this.sequenceNumbers = sequence;
		this.sequence.length = 0;
		this.scale = [];

		var _scale = teoria.scale.list(this.root, this.quality, false);
		for(var oct = _rootoctave, o = 0; oct < 8; oct++, o++) {
			for(var num = 0; num < _scale.length; num++) {
				var nt = jQuery.extend({}, _scale[num]);
				nt.octave += o;
				this.scale.push(nt);
			}
		}

		var negCount = -1;
		for(var oct = _rootoctave -1, o = -1; oct > 0; oct--, o--) {
		 	for(var num = _scale.length - 1; num >= 0; num--) {
		 		var nt = jQuery.extend({}, _scale[num]);
		 		nt.octave += o;
		 		this.scale[negCount--] = nt;
		 	}
		}
		
		for(var i = 0; i < this.sequenceNumbers.length; i++) {
			this.sequence.push(this.scale[this.sequenceNumbers[i]]);
		}
	};
	
	(function() {
	    var root = that.root;
		var speed = that.speed;

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
	    });
	})();

	/*
s = Synth();
i = Intervals("B2", "ionian", [1,2,3,5], _8, s);
	*/
	that.root = _root;	// triggers meta-setter that sets sequence
	that.seq = Seq(that.sequence, that.speed, that.gen);
	
	return that;
}


function Seq(_seq, speed, gen, _outputMsg) {
	var _seq = arguments[0];
	var speed = (typeof arguments[1] === "number") ? arguments[1] : window["_" + arguments[0].length];
	
	var gen =   (typeof arguments[2] !== "undefined") ? arguments[2] : null;
	sequence = _seq;
	
	if(typeof arguments[3] === "undefined") {
		if(gen != null) {
			if(typeof gen.note === "undefined") {
				_outputMessage = "freq";
			}else{
				_outputMessage = "note";
			}
		}else{
			_outputMessage = "note";
		}
	}
	//_outputMsg = (typeof arguments[3] === "undefined") ? "freq" : _outputMsg;
	
	var that = {
		_sequence : sequence,
		sequence : sequence,
		_start : true,
		counter : -1,
		speed: speed,
		outputMessage:_outputMessage,
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
				this.sequence.push(c);
			}
		}else{
			for(var i = 0; i < seq.length; i++) {
				var n = seq[i];
				this.sequence[i] = n;
			}
		}
		
		console.log("INSIDE SEQUENCER");
		console.log(this.sequence);
		
		if(shouldReset) {
			this.phase = 0;
		}
		
		this.sequenceLengthInSamples = seq.length * speed;
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
		
		if(this.phase % this.speed < 1) {
			this.counter++;
			for(j = 0; j < this.slaves.length; j++) {
				var slave = this.slaves[j];
				var val = this.sequence[this.counter % this.sequence.length];
				if(this.outputMessage === "freq") {
					if(typeof val === "string" ) {
						//val = Note.getFrequencyForNotation(val);
						var n = teoria.note(val);
						val = n.fq();
						//console.log("note freq = " + val);
					}else if(typeof val === "object"){
						val = val.fq();
					}
				}
				if(typeof slave[this.outputMessage] === "function") {
					if(Gibber.debug) console.log("calling function " + this.outputMessage);					
					slave[this.outputMessage](val);
				}else{
					if(Gibber.debug) console.log("outputting " + this.outputMessage);
					slave[this.outputMessage] = val;
				}
			}
		}
			
		if(this.phase >= this.sequence.lengthInSamples) { 
			if(this.shouldBreak) { 
				this.shouldBreak = false;
				if(!this.breakToOriginal) {
					this.sequence = jQuery.extend(true, {}, this.preBreakSequences);
				}else{
					this.sequence = jQuery.extend(true, {}, this._sequences);
				}
				this.setSequence(this.sequence, this.speed)
			}
			this.phase = 0;
		}else{
			this.phase++;
		}
	}
	
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
	
	that.break = function(newSeq, breakToOriginal) {
		this.shouldBreak = true;
			
		if(breakToOriginal) {
			this.breakToOriginal = true;
		}
		this.preBreakSequences = jQuery.extend(true, {}, this.sequence);
	};
		
	that.setSequence(that.sequence, that.speed);	
	
	Gibber.controls.push(that);
	
	if(gen != null) {
		that.slave(gen);
	}
	
	return that;
}
	

	
	