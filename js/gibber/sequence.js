//function Seq(_seq, speed, gen, _outputMsg) {
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
		counter : 0, // position in seqeuence
		_counter :0, // used for scheduling
		speed: speed,
		durations : durations,
		outputMessage:_outputMsg,
		active:true,
		slaves: [],
		phase: 0,
		memory: [],
		init: false,
		mods: [],
		shouldDie: false,
		oddEven : 0,
		phaseOffset : 0,
	}
	
	that.once = function() {
		this.end = true;
		return this;
	};
	
	that.schedule = function() {
		if(this.shouldDie) {
			this.kill();
			return;
		}
		
		// increment phase
		// how many events will be passed?
		// for each event that occurs
		// schedule
		// retain phase
		// var numEventsToSchedule = _1 / this.speed;
				
		// var me = this;
		// var count = 0;


		/*
		checkSchedule( 0 + 88200)
		....nextEvent = 0
		checkSchedule(88200)
		....nextEvent = 22050
		....
		checkSchedule(22050) --- counter  = 0
		*/
		// function checkSchedule(time) {
		// 	var nextEvent = me.durations[me._counter];
		// 	count += nextEvent;
		// 	if(time >= nextEvent) {
		// 		
		// 		var _pos = nextEvent % time;
		// 		console.log("NEXT EVENT = " + nextEvent + " time : " + time + " : pos : " + _pos);
		// 		
		// 		me.phaseOffset += _pos;
		// 		G.callback.addEvent(me.phaseOffset, me);
		// 		
		// 		if(++me._counter >= me.durations.length) {
		// 			me._counter = 0;
		// 			me.phase = 0;
		// 			me.phaseOffset = 0;
		// 		}
		// 		//console.log("now checking time : " + (time - _pos));
		// 		if(count >= _1) return time - _pos;
		// 		return checkSchedule(time - _pos);
		// 	}else{
		// 		//console.log("done");
		// 		return time;
		// 	}
		// }
		// 
		// this.phase = checkSchedule(this.phase + _1);	
		
		// 	    var phase = 0;
		// 	    var _offset = this.offset;
		// 
		// var events = (_1 + _offset ) / this.speed;
		// //console.log("NUM EVENTS " + events );
		// for(var i = 0; i < events; i++) {
		// 	this.oddEven = !this.oddEven;
		// 	var pos = i * Math.round(this.speed);
		// 	//if(i ==1 ) console.log(pos); // TODO: there is some slop here. eventually the wrong number of events will be generated...
		// 	//var pos = (this.oddEven) ? (i * Math.floor(this.speed)) : (i * Math.ceil(this.speed));
		// 	
		// 	G.callback.addEvent(pos - _offset, this); // sequence on global object
		// 	phase = pos - _offset;
		// 	
		// 	        this.offset = 0;
		// }
		// if(this.end) {
		// 	this.shouldDie = true;
		// 	this.end = false;
		// }
		// 	
		// this.offset += _1 - phase;
	};
	
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
	
	that.setSequence = function(seq, _speed, _reset) {
		if(typeof _speed !== "undefined") {
			this.speed = _speed;
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
			console.log("CALLING INIT");
			Gibber.callback.slaves.push(this);
			this._sequence = this.sequence.slice(0);
			this.init = true;
			this.advance();
		}
	};
	
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
			}
		}
		return this;		
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
		this.phase = 0;		
		this.counter = 0;
		return this;
	};
	
	that.pause = function() {
		this.active = false;
		return this;
	};
		
	that.play = function() {
		this.active = true;
		return this;
	};
	
	that.advance = function() {
		if(this.active) {
			var val = this.sequence[this.counter % this.sequence.length];
		
			var shouldReturn = false;
			// Function sequencing
			// TODO: there should probably be a more robust way to to this
			// but it will look super nice and clean on screen...
			if(typeof val === "function") {
				val();
				return;
			}else if(typeof val === "undefined") {
				return;
			}			
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
			
			
			// TODO: should this flip-flop between floor and ceiling?
			if(this.durations != null) {
				G.callback.addEvent(Math.round(this.durations[this.counter % this.sequence.length]), this);
			}else{
				G.callback.addEvent(Math.round(this.speed), this);
			}
			this.counter++;
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
		return 0;
	};
	
	that.out = function() {
		this.generate();
		return 0;
	};
	
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
	
	that.shuffle = function() {
		that.sequence.shuffle();
		that.setSequence(that.sequence, that.speed);
		return that;
	};
	
	that.reset = function() {
		if(arguments.length === 0) {
			that.setSequence(that._sequence, that.speed);
		}else{
			that.setSequence(that.memory[arguments[0]]);
		}
		return that;
	};
		
	that.retain = function() {
		if(arguments.length != 0) {
			this.memory.push(this.sequence);
		}else{
			this.memory[arguments[0]] = this.sequence;
		}
	};
	
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
			}
		});
	})();
	
	if(that.sequence != null && typeof that.sequence != "undefined") {
		that.setSequence(that.sequence, that.speed);	
	}
	
	that.setParam = function(param, _value){
		this[param] = _value;
	};
	
	Gibber.addModsAndFX.call(that);
	
	return that;
}