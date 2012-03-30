//  Gibber - sequence.js
// ========================


// ###Seq
// Create a sequencer object, the base class for all sequencing capabilities in Gibber
//
// param **values**: Array or function. The value(s) to be sequenced.
// param **duration** : Array or Gibber time value. The length for each value in the sequence. This can either be a single Gibber time value or an array of Gibber time values.
//
// example usage:  
//	`s = Synth();  
//  t = Seq(["C4", "D4", "G4", "F4"], [_2, _8, _4, _4 * 1.5]).slave(s);    `
//
// alternatively:  
//	`s = Synth();  
//  t = Seq(["C4", "D4", "G4", "F4"], _4).slave(s)  ` 

function Seq() {
	var _seq = arguments[0] || null;
	
	if(typeof _seq === "function") { // wrap anonymous function in array as sugar
		_seq = [_seq];
	}
	
	var arg1Type = typeof arguments[1];
	var speed, durations;
	if(arg1Type !== "undefined") {
		if(arg1Type === "number") {
			speed = arguments[1];
			durations = null;
		}else{
			speed = null;
			durations = arguments[1];
		}
	}else{
		speed = (arguments.length != 0) ? window["_" + arguments[0].length] : _4;
		durations = null;
	}
	
	var _outputMsg = arguments[2] || null;
	
	if(_outputMsg === null) {
		_outputMsg = "note";
	}
		
	var that = {
		name : "Seq",
		type : "control",
		_sequence : null,
		sequence : _seq,
		_start : true,
		offset : 0,	 // used to sequence Gibber object
		shouldUseOffset : false, // flag to determine when offset should be initially applied
		counter : 0, // position in seqeuence
		_counter :0, // used for scheduling
		speed: speed,
		durations : durations,
		outputMessage:_outputMsg,
		active:true,
		slaves: [],
		slavesInit : false,
		phase: 0,
		memory: [],
		init: false,
		mods: [],
		shouldDie: false,
		oddEven : 0,
		phaseOffset : 0,
		sequenceInit : false,
		mix : 1, // needed for modding because the value of the gen is multiplied by this, should never be changed.
	}
	// ####once
	// Play the sequence once and then end it
	
	that.once = function() {
		this.end = true;
		return this;
	};
	
	that.schedule = function() {
	};
	
	// ####kill
	// Destroy the sequencer
	
	that.kill = function() {
		this.free();
		Gibber.callback.slaves.remove(this);
		
		for(var i = 0; i < this.slaves.length; i++) {
			var slave = this.slaves[i];
			slave.masters.remove(this);
		}
		this.slaves.length = 0;
		
		this.mods.length = 0;	
	},
	
	// ####setSequence
	// assign a new set of values to be sequenced
	//
	// param **seq** Array or Function. The new values to be sequenced  
	// param **_speed** Int. Optional. A new speed for the sequencer to run at  
	// param **_reset** Bool. Optional. If true, reset the the current position of the sequencer to 0.  
	
	that.setSequence = function(seq, _speed, _reset) {
		if(typeof _speed !== "undefined") {
			if(_speed === "number") {
				speed = _speed;
				durations = null;
			}else{
				speed = null;
				durations = _speed;
			}
		}
		
		if(_reset) {
			this.phase = 0;		
			this.counter = 0;
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
		
		if(this.init === false) {
			this._sequence = this.sequence.slice(0);
			Gibber.callback.slaves.push(this);
			if(typeof this.sequence[0] === "function"){
				this.advance();
			}
			this.init = true;
		}
	};
	
	
	// ####slave
	// assign a new set of values to be sequenced
	//
	// param **seq** Comma separated list of generators. The generators to be controlled by this sequencer  
	//
	// example:
	// `s = Synth();  
	// ss = Synth();  
	// t = Seq(["C4", "D4"], _1)  
	// t.slave(s, ss);  `
	
	that.slave = function() {
		for(var i = 0; i < arguments.length; i++) {
			var gen = arguments[i];
	
			var idx = jQuery.inArray( gen, this.slaves);
			if(idx === -1) {
				this.slaves.push(gen);
				if(typeof gen.masters === "undefined") {
					gen.masters = [this];
				}else{
					gen.masters.push(this);
				}
				if(typeof gen.note === "undefined" && this.outputMessage == "note") { this.outputMessage = "freq"; }
			}else{
				return this;
			}
		}
		if(!this.slavesInit) {
			 this.advance();
			 this.slavesInit = true;
		} // start sequence if it's not already running
		return this;		
	};
	
	// ####free
	// stop controlling slaved ugens
	
	that.free = function() {
		if(arguments.length == 0) {
			this.slaves.length = 0;
		}else{
			this.slaves.splice(arguments[0], 1);
		}
	};
	
	// ####stop
	// stop the sequencer from running and reset the position to 0
	
	that.stop = function() {
		this.active = false;
		this.phase = 0;		
		this.counter = 0;
		return this;
	};
	
	// ####pause
	// stop the sequencer from running but do not reset the current position
	
	that.pause = function() {
		this.active = false;
		return this;
	};
	
	// ####play
	// start the sequencer running
	
	that.play = function() {
		this.active = true;
		this.advance();
		return this;
	};
	
	// ####advance
	// run the current event and schedule the next one. This is called automatically by the master clock if a sequencer is added to the Gibber.callback.slaves array.
	
	that.advance = function() {
		if(this.active) {
			var pos = this.counter % this.sequence.length;
			var val = this.sequence[pos];
		
			var shouldReturn = false;
			// Function sequencing
			// TODO: there should probably be a more robust way to to this
			// but it will look super nice and clean on screen...
			
			var nextPhase = (this.durations != null) ? this.durations[pos] : this.speed;
			if(this.shouldUseOffset) {
				nextPhase += this.offset;
				this.shouldUseOffset = false;
			}
			nextPhase = Math.round(nextPhase);
			
			if(typeof val === "function") {
				val();
				G.callback.addEvent(nextPhase, this);
				this.counter++;
				
				return;
			}else if(typeof val === "undefined") {
				G.callback.addEvent(nextPhase, this);
				this.counter++;
				
				return;
			}
			if(this.slaves.length === 0) { // if a mod
				this.value = val;
			}else{
				for(var j = 0; j < this.slaves.length; j++) {
					var _slave = this.slaves[j];
	
					if(this.outputMessage === "freq") {
						if(typeof val === "string" ) {
							var nt = teoria.note(val);
							val = nt.fq();
						}else if(typeof val === "object"){
							val = val.fq();
						}// else val is a number and is fine to send as a freq...
					}
					if(typeof _slave[this.outputMessage] === "function") {
						_slave[this.outputMessage](val);
					}else{
						_slave[this.outputMessage] = val;
					}
				}
			}
			
			// TODO: should this flip-flop between floor and ceiling?
			G.callback.addEvent(nextPhase, this);
			
			this.counter++;
			if(this.counter % this.sequence.length === 0) {
				if(this.shouldDie) {
					this.kill();
				}
			}
		}
	};
	
	that.break = function(newSeq, breakToOriginal) {
		this.shouldBreak = true;
			
		if(breakToOriginal) {
			this.breakToOriginal = true;
		}

		this.preBreakSequence = jQuery.extend(true, {}, this._sequence);
	};

	that.getMix = function(){
		return this.value;
	};
	
	that.out = function() {
		this.generate();
		return 0;
	};
	
	// ####set
	// assign a new set of values to be sequenced. I can't remember how this is different from setSequence, but surely there's a good reason for it :)
	//
	// param **newSequence** Array or Function. The new values to be sequenced  
	// param **speed** Int. Optional. A new speed for the sequencer to run at  
	// param **shouldReset** Bool. Optional. If true, reset the the current position of the sequencer to 0.   
	
	
	that.set = function(newSequence, speed, shouldReset) {
		if(typeof speed != "undefined") {
			if(!shouldReset) {
				this.phase -= this.speed - speed;
			}
			this.speed = speed;
		}
		
		if(shouldReset) {
			this.phase = 0;
		}
		
		this.sequence = newSequence;
		this.setSequence(this.sequence, speed, shouldReset);
	};
	
	// ####shuffle
	// randomize order of sequence

	that.shuffle = function() {
		that.sequence.shuffle();
		that.setSequence(that.sequence, that.speed);
		return that;
	};
	
	// ####reset
	// reset order of sequence to its original order or to a memorized set of positions
	//
	// param **memory location** Int. Optional. If a sequencer has retain a order, you can recall it by passing its number here. Otherwise the sequence is reset to its original order.
	
	that.reset = function() {
		if(arguments.length === 0) {
			that.setSequence(that._sequence, that.speed);
		}else{
			that.setSequence(that.memory[arguments[0]]);
		}
		return that;
	};
	
	// ####retain
	// retain current order of sequenced values
	//
	// param **slotNumber** Int. Optional. The position to hold the current sequencer order. By default it will simply be pushed to the memory array
	that.retain = function() {
		if(arguments.length === 0) {
			this.memory.push(this.sequence);
		}else{
			this.memory[arguments[0]] = this.sequence;
		}
	};
	// TODO: Needs to account for multiple durations
	that.bpmCallback = function(obj) {
		var _that = obj;
		return function(percentageChangeForBPM) {
			_that.speed *= percentageChangeForBPM;
			//_that.setSequence(_that.sequence, _that.speed); // don't need this, not sure why it causes errors.
		}
	};
	
	Gibber.registerObserver( "bpm", that.bpmCallback(that) );
	
	(function() {
		var speed = that.speed;
		var _that = that;
		var _offset = that.offset;
		
		Object.defineProperties(that, {
			"speed": {
				get: function(){ return speed; },
				set: function(value) {
					if(value < 65) {
						value = window["_"+value];
					}
					speed = value;
					if(this.sequence != null) {
						this.setSequence(this.sequence);
					}
				}
			},
			"offset" : {
				get: function(){ return _offset; },
				set: function(value) {
					_offset = value;
					this.shouldUseOffset = true;
				}
			}
		});
	})();
	
	if(that.sequence != null && typeof that.sequence != "undefined") {
		that.setSequence(that.sequence, that.speed);	
	}
	
	that.setParam = function(param, _value){
		this[param] = _value;
	};
	
	that.generate = function() {} // null function of modding
	that.getMix = function() { return this.value; }
	that.modded = [];
	
	Gibber.addModsAndFX.call(that);
	
	return that;
}