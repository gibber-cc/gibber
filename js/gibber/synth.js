function Synth(waveform, volume) {
	volume = isNaN(volume) ? .2 : volume;
	
	var that = {
		osc : Osc([440, volume, "triangle"], false),
		name: "Synth",
		type: "complex",
		env : Env(),
		mix: volume,
		frequency: 440,
		phase : 0,
		value : 0,
		active : true,
		note : function(n) {
			//console.log("calling " + n);
			this.osc.frequency = (typeof n === "string") ? Note.getFrequencyForNotation(n) : Note.mtof(n);
			this.env.triggerGate();
		},
		_start : true,
		counter : -1,
	};
	
	that.mods = [];
	that.fx = [];
	that.automations = [];
	
	that.replace = function(replacement){
		// can't replace, just remove instead.
		Gibber.genRemove(this);
		delete this.osc;
		delete this.env;
		delete this;
	};
	
	// TODO: figure out speed problems
	// that.setSequence = function(seq, speed) {
	// 	if(typeof speed != "undefined") {
	// 		this.phase -= this.speed - speed;
	// 		this.speed = speed;
	// 		//this.phase = 0;
	// 	}
	// 	this.sequence = [];
	// 	for(var i = 0; i < seq.length; i++) {
	// 		var n = seq[i];
	// 		this.sequence[i] = n;
	// 	}
	// };
	
	that.stop = function() {
		this.active = false;
	};
	
	that.start = function() {
		this.phase = 0;
		this.active = true;
	};
	
	if(typeof waveform !== "undefined") {
		that.osc.waveShape = waveform;
	}
	
	that.generate = function() {
	// 	if(this.phase++ > this.speed || this._start) {
	// 		this.phase = 0;
	// 		if(++this.counter >= this.sequence.length) { this.counter = 0;};
	// 		this.note(this.sequence[this.counter]);
	// 		this._start = false;
	// 	}
		
		this.env.generate();
		this.osc.generate();
		
		this.value = (this.env.getMix() * this.osc.getMix()) * this.mix;
		
		for(var e = 0; e < this.osc.fx.length; e++) {
			this.value = this.osc.fx[e].fxout(this.value);
		}
	};
	
	that.out = function() {
		this.generate();
		return this.value;
	}
	
	that.getMix = function() {
		return this.value * this.mix;
	};
	
	that.chain = Gibber.modsAndEffects.chain;

	that.mod = function() {
		if(typeof arguments[2] === "undefined") {
			this.osc.mod(arguments[0], arguments[1]);
		}else{
			this.osc.mod(arguments[0], arguments[1], arguments[2]);
		}
	}
	
	//that.setSequence(that._sequence);
	//that.seq = that.setSequence;
	Gibber.generators.push(that);
	
	//that.__proto__ = new audioLib.GeneratorClass();
	return that;
}