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

(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){

function Seq() {
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
						G.callback.sequence[this.nextEvent].remove(this);
						var curPhase = G.callback.phase;
						var newPhase = (this.nextEvent - curPhase) - _offset + value;
						if(newPhase < 0) newPhase *= -1;
						_offset = value;
						G.callback.addEvent(newPhase, that);
						//console	.log(this.nextEvent, curPhase, newPhase, _offset, value);
						//that.shouldUseOffset = true;
					}
				}
			},
			"slaves" : {
				get: function(){ 
					return _slaves; 
				},
				set: function(value) {
					_slaves = value;
					that.slave.apply(that, _slaves);
				}
			},
		});
	})(this);

	this._sequence = null;
	this.sequence = null;
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
	this.nextEvent = null;
	
	var that = this;	
	if(typeof arguments[0] === "object" && $.isArray(arguments[0]) === false) {
		var obj = arguments[0];
		for(key in obj) {
			if(key !== "slaves") {
				this[key] = obj[key];
			}else{
				this.slave.apply(this, obj[key]);
			}
		}
	}else{
		_seq = arguments[0] || [];
		if(typeof _seq === "function") { // wrap anonymous function in array as sugar
			_seq = [_seq];
		}
		this.sequence = _seq;
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
	
	if(this.outputMessage === null) {
		this.outputMessage = arguments[2] || "note";
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
			if(typeof gen.note === "undefined" && this.outputMessage == "note") { this.outputMessage = "freq"; }
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

	this.shuffle = function() {
		that.sequence.shuffle();
		that.setSequence(that.sequence, that.speed);
		return that;
	};
	
	// ####reset
	// reset order of sequence to its original order or to a memorized set of positions
	//
	// param **memory location** Int. Optional. If a sequencer has retain a order, you can recall it by passing its number here. Otherwise the sequence is reset to its original order.

	this.reset = function() {
		if(arguments.length === 0) {
			if(that.durations === null) {
				that.setSequence(that._sequence, that.speed);
			}else{
				that.setSequence(that._sequence, that.durations);
			}
		}else{
			that.setSequence(that.memory[arguments[0]]);
		}
		return that;
	};
	Gibber.addModsAndFX.call(this);	
}
	
Seq.prototype = {
	name : "Seq",
	type : "control",
	
	// ####advance
	// run the current event and schedule the next one. This is called automatically by the master clock if a sequencer is added to the Gibber.callback.slaves array.
	advance : function() {
		if(this.active) {
			var pos, val;
			// only play if not setting an offset... if using offset simply set original offset position
			var shouldReturn = false; 
			var nextPhase = 0;
			if(this.prevHumanize) {
				nextPhase += this.prevHumanize * -1;
			}
			
			if(this.humanize) {
				this.prevHumanize = rndi(this.humanize * -1, this.humanize);
				nextPhase += this.prevHumanize;
			}
			// if(this.shouldUseOffset) {
			// 	nextPhase += this.offset;
			// 	this.shouldUseOffset = false;
			// 	shouldReturn = true;
			// 	
			// 	// only use duration with negative offset
			// 	if(this.offset < 0) {
			// 		if(this.durations != null) {
			// 			if(this.durations.pick != null) {
			// 				nextPhase += this.durations.pick();
			// 			}else{
			// 				nextPhase +=this.durations[this.durationCounter % this.durations.length]
			// 			}
			// 		}else{
			// 			nextPhase += this.speed;
			// 		}
			// 	}
			// }else{
			if(this.durations != null) {
				if(this.durations.pick != null) {
					nextPhase += this.durations.pick();
				}else{
					nextPhase += this.durations[this.durationCounter % this.durations.length]
				}
			}else{
				nextPhase += this.speed;
			}
			//}
			// TODO: should this flip-flop between floor and ceiling instead of rounding?
			nextPhase = Math.round(nextPhase);
			//if(nextPhase == 0) return;
			
			this.nextEvent = G.callback.addEvent(nextPhase, this);
			
			if(typeof this.sequence === "undefined" || this.sequence === null) return;
			
			var usePick = (typeof this.sequence.pick !== "undefined");
			if(!usePick) {
				pos = this.counter % this.sequence.length;
			}
			if(!usePick) {
				val = this.sequence[pos];
			}else{
				val = this.sequence.pick();
			}
			
			// Function sequencing
			// TODO: there should probably be a more robust way to to this
			// but it will look super nice and clean on screen...
			if(typeof val === "function") {
				if(!shouldReturn) {
					val();
					this.counter++;
					this.durationCounter++;
				}
				
				return;
			}else if(typeof val === "undefined") {
				if(!shouldReturn) {
					this.counter++;
					this.durationCounter++;
				}

				return;
			}
			var amp = null;
			if($.isArray(val)) {
				amp = val[1];
				val = val[0];
			}
			if(shouldReturn) return;
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
						if(amp === null){
							_slave[this.outputMessage](val);
						}else{
							_slave[this.outputMessage](val, amp);
						}
					}else{
						_slave[this.outputMessage] = val;
					}
				}
			}
			
			this.counter++;
			if(this.counter % this.sequence.length === 0){
				if(this.randomFlag) {
					this.shuffle();
				}
				if(this.end) {
					this.stop();
				}
			}
			this.durationCounter++;
			if(!usePick && this.counter % this.sequence.length === 0) {
				if(this.shouldDie) {
					this.kill();
				}
			}
		}
	},
	
	// ####once
	// Play the sequence once and then end it
	
	once : function() {
		if(!this.active) {
			this.play();
		}
		
		this.end = true;

		return this;
	},
	
	random : function(flag) {
		this.randomFlag = (typeof flag === "undefined" || flag) ? true : false;
		if(!this.randomFlag) this.reset();
	},
	
	schedule : function() {},
	
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
			this._sequence = this.sequence.slice(0);
			//Gibber.callback.slaves.push(this);
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
					if(typeof gen.note === "undefined" && this.outputMessage == "note") { this.outputMessage = "freq"; }
				}else{
					return this;
				}
			}
			if(!this.slavesInit && !this.doNotAdvance) {
				 this.advance();
				 this.slavesInit = true;
				 if(typeof this.sequence.pick !== "undefined")
					 this._sequence = this.sequence.slice(0);
			} // start sequence if it's not already running
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
	
	// ####play
	// start the sequencer running
	
	play : function() {
		this.active = true;
		this.end = false;
		this.advance();
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
	// TODO: Needs to account for multiple durations
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
audioLib.Sequencer = Seq;
		
}(audioLib));
audioLib.plugins('Sequencer', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
	exports.init = initPlugin;
} else {
	initPlugin(audioLib);
}

}());

function Seq(seq, durations, msg) { // may also be a single object dictionary
	return new audioLib.Sequencer(seq, durations, msg);
}