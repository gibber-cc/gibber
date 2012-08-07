//  Gibber - sequence.js
// ========================
// TODO: shuffle and reset are broke after applying pick function
// TODO: use memory[0] in reset function instead of _sequence 
// TODO: velocities
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

// hmmm... some screwups from the audioLib.js conversion, now I have to wrap these functions:

function Seq(seq, durations, msg) {
	return new _Seq(seq, durations, msg);
}

function _Seq() {
	(function(_that) {
		var _speed = null;
		var that = _that;
		var _offset = 0;
		var _slaves = [];
		
		Object.defineProperties(that, {
			"speed": {
				get: function(){ return _speed; },
				set: function(value) {
					if(value < 65) {
						value = window["_"+value];
					}
					_speed = value;
					if(that.sequence != null) {
						that.setSequence(that.sequence);
					}
				}
			},
			"offset" : {
				get: function(){ return _offset; },
				set: function(value) {
					if(_offset !== value) {
						value = Math.round(value);
						if(typeof G.callback.sequence[this.nextEvent] !== "undefined") {
							G.callback.sequence[this.nextEvent].remove(this);
						}
						var curPhase = G.callback.phase;
						
						if(this.nextEvent !== 0) {
							var newPhase = (this.nextEvent - curPhase) - _offset + value;
							if(newPhase < 0) newPhase *= -1;
							G.callback.addEvent(newPhase, that);
						}else{
							that.shouldUseOffset = true;
						}
						_offset = value;
					}
				}
			},
			"slaves" : {
				get: function(){ 
					return _slaves; 
				},
				set: function(value) {
					if($.isArray(value)) {
						_slaves = value;
					}else{
						_slaves = [value];
					}
					that.slave.apply(that, _slaves);
				}
			},
		});
	})(this);

	this._sequence = null;
	this.sequence = null;
	this.sequences = [];
	this._start = true;
	this.shouldUseOffset = false; // flag to determine when offset should be initially applied
	this.counter = 0; // position in seqeuence
	this.durationCounter = 0;
	this._counter = 0; // used for scheduling
	this.durations = null;
	this.outputMessage = null;
	this.active = true;
	this.slavesInit = false;
	this.phase = 0;
	this.memory = [];
	this.init = false;
	this.mods = [];
	this.shouldDie = false;
	this.oddEven = 0;
	this.phaseOffset = 0;
	this.sequenceInit = false;
	this.humanize = null;
	this.prevHumanize = null;
	this.mix = 1; // needed for modding because the value of the gen is multiplied by this, should never be changed
	this.values2 = null;
	this.randomFlag = false;
	this.end = false;
	this.nextEvent = 0;
	this.endFunction = null;
	this.endSequence = "note";
	this.shouldRepeat = false;
	this.repeatCount = 0;
	this.repeatEnd = 0;
	
	var that = this;
	if(typeof arguments[0] === "object") {
		if(typeof arguments[0].doNotAdvance !== "undefined") this.doNotAdvance = true;
	}
	
	if(typeof arguments[0] === "object" && $.isArray(arguments[0]) === false) {
		var obj = arguments[0];
		for(key in obj) {
			if(key !== "slaves") {
				//if($.inArray(key, this.properties) !== -1) {
					//if($.isArray(obj[key])) {
				if(key === "durations") {
					if(typeof obj[key] === "number") {
						obj[key] = [obj[key]];
					}
				}
				
				this[key] = obj[key];
				if($.inArray(key, this.properties) === -1) {
					this.sequences.push(key);
				}
						//}else{
						//this[key] = [obj[key]];
						//}
					
				//}else{
					//if($.isArray(obj[key])) {
				//		this.sequences[key] = obj[key];
						//}else{
						//this.sequences[key] = [obj[key]];
						//}
				//}
			}else{
				if($.isArray(obj[key])) {
					this.slave.apply(this, obj[key]);
				}else{
					this.slave.apply(this, [obj[key]]);
				}
			}
		}
	}else{
		_seq = arguments[0] || [];
		if(typeof _seq === "function") { // wrap anonymous function in array as sugar
			_seq = [_seq];
		}else if(typeof _seq === "string") {
			_seq = _seq.split("");
		}
		if(typeof _seq[0] === "function") this.endSequence = "function";
		this.sequence = _seq;
	}
	
	if(this.outputMessage === null) {
		if(typeof arguments[2] !== "undefined") {
			this.outputMessage = arguments[2];
			this.endSequence = this.outputMessage;
			this[this.outputMessage] = this.sequence;
			this.sequences.push(this.outputMessage);
		}else{
			if(this.sequence !== null) {
				if(typeof this.sequence[0] === "function") {
					this.endSequence = "function";
					this.outputMessage = "function";
				}else{
					this.outputMessage = "note";
				}
				this.sequences.push(this.outputMessage);				
				
			}
		}
	}
	
	if(this.sequence !== null) {
		if (this.outputMessage === null) {
			if(typeof this.sequence[0] === "function") {
				this.functions = this.sequence;
				this.sequences.push("functions");				
			}else{
				this.note = this.sequence;
				this.sequences.push("note");				
			}
		}else{
			this[this.outputMessage] = this.sequence;
		}
		this._sequence = this.sequence.slice(0);
	}else{
		if(typeof this.note !== "undefined") {
			this._sequence = this.note.slice(0);
		}
	}

	if(this.speed === null && this.durations === null) {
		var arg1Type = typeof arguments[1];
		if(arg1Type !== "undefined") {
			if(arg1Type === "number") {
				this.speed = arguments[1];
				this.durations = null;
			}else{
				this.durations = arguments[1];
				this.speed = null;
			}
		}else{
			if(typeof arguments !== "undefined") {
				if(typeof arguments[0] !== "undefined")
					this.speed = (arguments.length != 0) ? window["_" + arguments[0].length] : _4;
			}
		}
	}
	
	Gibber.registerObserver( "bpm", this.bpmCallback(this) );
	if(this.sequence != null && typeof this.sequence != "undefined") {
		this.setSequence(this.sequence, this.speed);	
	}
	
	if(this.slaves.length != 0) {	// put here so it doesn't get repushed as when using slave function
		for(var i = 0; i < this.slaves.length; i++) {
			var gen = this.slaves[i];
	
			if(typeof gen.masters === "undefined") {
				gen.masters = [this];
			}else{
				gen.masters.push(this);
			}
			if(typeof gen.note === "undefined" && this.outputMessage == "note") { this.outputMessage = "frequency"; }
		}
		if(!this.slavesInit && !this.doNotAdvance) { // start sequence if it's not already running
			 this.advance();
			 this.slavesInit = true;
		}
	}
	this.setParam = function(param, _value){
		this[param] = _value;
	};
	
	this.generate = function() {} // null function of modding
	this.getMix = function() { return this.value; }
	this.modded = [];
	
	// ####shuffle
	// randomize order of sequence
	
	this.shuffle = function(seq) {
		if(typeof seq === "undefined") {
			that.note.shuffle();
		}else if(seq !== "all"){
			that[seq].shuffle();
		}else{
			for(var i = 0; i < that.sequences.length; i++) {
				var key = that.sequences[i];
				that[key].shuffle();
			}
			that.durations.shuffle();
		}
		return that;
	};
	
	// ####reset
	// reset order of sequence to its original order or to a memorized set of positions
	//
	// param **memory location** Int. Optional. If a sequencer has retain a order, you can recall it by passing its number here. Otherwise the sequence is reset to its original order.

	this.reset = function(seq) {
		if(typeof seq === "undefined") {
			that.note = that._sequence.slice(0);
			// if(arguments.length === 0) {
			// 				if(that.durations === null) {
			// 					that.setSequence(that._sequence, that.speed);
			// 				}else{
			// 					that.setSequence(that._sequence, that.durations);
			// 				}
			// 			}else{
			// 				that.setSequence(that.memory[arguments[0]]);
			// 			}
		}
		return that;
	};

	//Gibber.addModsAndFX.call(this);	
	//this.play();
}
	
_Seq.prototype = {
	name : "Seq",
	type : "control",
	category : "control",
	
	// ####advance
	// run the current event and schedule the next one. This is called automatically by the master clock if a sequencer is added to the Gibber.callback.slaves array.
	advance : function() {
		if(this.active) {
			var pos, val;
			
			var shouldReturn = false; 
			var nextPhase = 0;
			if(this.prevHumanize) {
				nextPhase += this.prevHumanize * -1;
			}
			
			if(this.humanize) {
				this.prevHumanize = rndi(this.humanize * -1, this.humanize);
				nextPhase += this.prevHumanize;
			}
			
			if(this.shouldUseOffset) { // only used when Seq object is first initialized to set the offset; afterwards scheduling is handled in property setter
				nextPhase += this.offset;
				this.shouldUseOffset = false;
				shouldReturn = true;
				
				// only use duration with negative offset
				if(this.offset < 0) {
					if(this.durations != null) {
						if(this.durations.pick != null) {
							nextPhase += this.durations.pick();
						}else{
							nextPhase += this.durations[this.durationCounter % this.durations.length]
						}
					}else{
						nextPhase += this.speed;
					}
				}
			}else{
				if(this.durations != null) {
					if(this.durations.pick != null) {
						nextPhase += this.durations.pick();
					}else{
						nextPhase += this.durations[this.durationCounter % this.durations.length]
					}
				}else{
					nextPhase += this.speed;
				}
			}
			// TODO: should this flip-flop between floor and ceiling instead of rounding?
			nextPhase = Math.round(nextPhase);
			//if(nextPhase == 0) return;
			
			this.nextEvent = G.callback.addEvent(nextPhase, this);
			
			//if(typeof this.sequence === "undefined" || this.sequence === null) return;
			
			//if(shouldReturn) return;a.mods
//			console.log(this.sequences);
			// TODO : an array of keys? can't this just loop through an object with the appropriate values? 
			// pretty sure I made this decision to easy live coding (no need to specify sequences array) but it's weird...
			for(var i = 0; i < this.sequences.length; i++) {
				var key = this.sequences[i];
				var seq = this[key];
//				console.log(key);
				var usePick = (typeof seq.pick !== "undefined");
				
				if(!usePick) {
					pos = this.counter % seq.length;
				}
				if(!usePick) {
					val = seq[pos];
				}else{
					val = seq.pick();
				}
				
				if(this.slaves.length === 0 && key === "note") { // if a mod... note is the default sequence value
				 	this.value = val;
				}
				
				//G.log("key : " + key + " , val : " + val + ", pos : " + pos);
						
				// Function sequencing
				// TODO: there should probably be a more robust way to to this
				// but it will look super nice and clean on screen...
				if(key === "function") {
					if(!shouldReturn) {
						val();
						//this.counter++;
						//this.durationCounter++;
					}
					//return;
				}else if(typeof val === "undefined") {
					if(!shouldReturn) {
						this.counter++;
						this.durationCounter++;
					}
					return;
				}
				
				for(var j = 0; j < this.slaves.length; j++) {
					var _slave = this.slaves[j];
					//console.log("HAS SLAVE", _slave);
					if(key === "freq" || key === "frequency") {
						if(! $.isArray(val) ) {
							if(typeof val === "string" ) {
								var nt = teoria.note(val);
								val = nt.fq();
							}else if(typeof val === "object"){
								val = val.fq();
							}// else val is a number and is fine to send as a freq...
						}else{
							if(typeof val[0] === "string" ) {
								var nt = teoria.note(val[0]);
								val[0] = nt.fq();
							}else if(typeof val[0] === "object"){ // for ScaleSeqs and Arps
								val[0] = val[0].fq();
							}
						}
					}
					//console.log("ADVANCING", key, _slave);	
					if(typeof _slave[key] === "function") {
						if(key === "note" && val === 0) { // advance envelope instead of changing freq
							if(typeof _slave.env === "object") {
								_slave.env.state = 1;
							}
						}else{
							if($.isArray(val) && key !== "chord") {
								//console.log("CALLING", val);
								_slave[key].apply(_slave, val);									
							}else{
								//console.log("CALLING", val);
								
								//console.log("CALLING");
								_slave[key](val);
							}
						}
					}else{
						//console.log("ASSIGNING");
						_slave[key] = val;
					}
				}
			}
			
			this.counter++;
			this.durationCounter++;
			
			if(this.shouldRepeat) {
				if(this.counter % this[this.endSequence].length === 0) {
					this.repeatCount++;
					if(this.repeatCount === this.repeatEnd) {
						this.end = true;
					}
				}
			}
			
			if(this.end) {
				if(this.counter % this[this.endSequence].length === 0) {
					this.stop();
					if(this.endFunction !== null) {
						this.endFunction();
					}
					return;
				}
			}
			
			// if(!usePick && this.counter % this.sequence.length === 0) {
			// 	if(this.shouldDie) {
			// 		this.kill();
			// 	}
			// }
			//}
		}
	},
	// an array storing all the properties/methods of the Seq object that can't be sequenced
	properties : [
		"isSequence", "once", "random", "kill",
		"setSequence","slave", "slaves", "stop","play",
		"shuffle", "reset", "free", "pause",
		"break", "out", "getMix", "bpmCallback",
		"retain", "set", "advance", "name",
		"type", "generate", "setParam", "modded",
		"_sequence","sequence","_start","shouldUseOffset",
		"counter","durationCounter","_counter","outputMessage",
		"active","slavesInit","phase","memory","init","mods",
		"shouldDie","oddEven","phaseOffset","sequenceInit",
		"humanize","prevHumanize","mix","values2","randomFlag",
		"end","nextEvent","endFunction",
		"durations","doNotAdvance","speed",
		// for ScaleSeq
		"scaleInit", "root", "mode"
	],
	
	// ####once
	// Play the sequence once and then end it
	
	once : function(seq) {
		if(!this.active) {
			this.play();
		}
		
		if(typeof arguments[0] === "function") {
			this.endFunction = arguments[0];
		}else if(typeof arguments[0] === "string") {
			this.endSequence = seq;
			this.endFunction = (typeof arguments[1] === "function") ? arguments[1] : null;
		}else{
			this.endFunction = null;
		}
	
		this.end = true;

		return this;
	},
	
	// ####random
	// Shuffle the sequence each time it is played
	
	random : function(flag) {
		this.randomFlag = (typeof flag === "undefined" || flag) ? true : false;
		if(!this.randomFlag) this.reset();
	},
	
	// ####kill
	// Destroy the sequencer
	
	kill : function() {
		this.free();
		
		for(var i = 0; i < this.slaves.length; i++) {
			var slave = this.slaves[i];
			slave.masters.remove(this);
		}
		this.slaves.length = 0;
		
		this.mods.length = 0;
		this.active = false;
	},
	
	// ####setSequence
	// assign a new set of values to be sequenced
	//
	// param **seq** Array or Function. The new values to be sequenced  
	// param **_speed** Int. Optional. A new speed for the sequencer to run at  
	// param **_reset** Bool. Optional. If true, reset the the current position of the sequencer to 0.  
	
	setSequence : function(seq, _speed, _reset) {
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
		}else if ($.isArray(seq) && typeof seq.pick === "undefined"){
			for(var i = 0; i < seq.length; i++) {
				var n = seq[i];
				this.sequence[i] = n;
			}
		}else{
			this.sequence = seq;
		}
		if(this.init === false && typeof seq.pick === "undefined") {
			//this._sequence = this.sequence.slice(0);
			if(typeof this.sequence[0] === "function" && !this.doNotAdvance){
				this.advance();
			}
			this.init = true;
		}
	},
	
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
	
	slave : function() {
		if(arguments.length != 0) {
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
					if(typeof gen.note === "undefined" && this.outputMessage == "note") { this.outputMessage = "frequency"; }
				}else{
					return this;
				}
			}
			if(!this.slavesInit && !this.doNotAdvance) {
				 this.advance();
				 this.slavesInit = true;
			}
			
		}
		return this;		
	},
	
	// ####free
	// stop controlling slaved ugens
	
	free : function() {
		if(arguments.length == 0) {
			this.slaves.length = 0;
		}else{
			this.slaves.splice(arguments[0], 1);
		}
	},
	
	// ####stop
	// stop the sequencer from running and reset the position to 0
	
	stop : function() {
		this.active = false;
		this.phase = 0;		
		this.counter = 0;
		return this;
	},
	
	// ####pause
	// stop the sequencer from running but do not reset the current position
	
	pause : function() {
		this.active = false;
		return this;
	},
	
	
	repeat: function(numTimes) {
		this.shouldRepeat = true;
		this.repeatEnd = numTimes;
		
		return this;
	},

	// ####play
	// start the sequencer running
	
	play : function() {
		if(!this.doNotAdvance) {
			this.active = true;
			this.end = false;
		
			this.advance();
		}
		this.repeatCount = 0;
		return this;
	},
	
	break : function(newSeq, breakToOriginal) {
		this.shouldBreak = true;
			
		if(breakToOriginal) {
			this.breakToOriginal = true;
		}

		this.preBreakSequence = jQuery.extend(true, {}, this._sequence);
	},
	
	getMix : function(){
		return this.value;
	},
	
	out : function() {
		this.generate();
		return 0;
	},
	
	// ####set
	// assign a new set of values to be sequenced. I can't remember how this is different from setSequence, but surely there's a good reason for it :)
	//
	// param **newSequence** Array or Function. The new values to be sequenced  
	// param **speed** Int. Optional. A new speed for the sequencer to run at  
	// param **shouldReset** Bool. Optional. If true, reset the the current position of the sequencer to 0.   
	
	set : function(newSequence, speed, shouldReset) {
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
	},
	
	// ####retain
	// retain current order of sequenced values
	//
	// param **slotNumber** Int. Optional. The position to hold the current sequencer order. By default it will simply be pushed to the memory array
	retain : function() {
		if(arguments.length === 0) {
			this.memory.push(this.sequence);
		}else{
			this.memory[arguments[0]] = this.sequence;
		}
	},

	bpmCallback : function(obj) {
		var _that = obj;
		return function(percentageChangeForBPM) {
			if(_that.speed !== null) {
				_that.speed *= percentageChangeForBPM;
			}
			if(_that.durations !== null) {
				for(var i = 0; i < _that.durations.length; i++) {
					_that.durations[i] *= percentageChangeForBPM;
				}
			}
			//_that.setSequence(_that.sequence, _that.speed); // don't need this, not sure why it causes errors.
		}
	},
}