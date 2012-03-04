//function Seq(_seq, speed, gen, _outputMsg) {
function Seq() {
	var _seq = arguments[0] || null;
	
	if(typeof _seq === "function") { // wrap anonymous function in array as sugar
		_seq = [_seq];
	}
	
	var speed = arguments[1] || null;
	if(speed == null && _seq != null) {
		speed = (arguments.length != 0) ? window["_" + arguments[0].length] : _4;
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
		counter : 0,
		speed: speed,
		outputMessage:_outputMsg,
		active:true,
		slaves: [],
		phase: 0,
		memory: [],
		init: false,
		mods: [],
	}
	
	//console.log(that.sequence);
	that.once = function() {
		this.end = true;
		return this;
	},
	
	that.kill = function() {
		console.log("killing more");
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
			Gibber.callback.slaves.push(this);
			this._sequence = this.sequence.slice(0);
			this.init = true;
		}
				
		this.sequenceLengthInSamples = seq.length * this.speed;
		//console.log("seq.length = " + seq.length + " : speed = " + this.speed + " : sequenceLengthInSamples = " + this.sequenceLengthInSamples);
	};
	
	that.slave = function(gen) {
		//console.log("slaving " + gen);
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
			this.counter++;
			
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
		}
	};
	
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
					speed = value;
					if(this.sequence != null) {
						this.setSequence(this.sequence);
					}
				}
			}
		});
	})();
	
	if(that.sequence != null && typeof that.sequence != "undefined") {
		console.log("setting inital sequence")
		that.setSequence(that.sequence, that.speed);	
	}
	
	that.setParam = function(param, _value){
		this[param] = _value;
	};
	
	Gibber.addModsAndFX.call(that);
	
	return that;
}