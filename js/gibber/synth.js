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
			this.osc.frequency = (typeof n === "number") ? n : n.fq();
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
	
	// that.generate = function() {
	// 	
	// 	var store = {};
	// 	for(var m = 0; m < this.mods.length; m++) {
	// 		var mod = gen.mods[m];
	// 		if(typeof store[mod.param] === "undefined") store[mod.param] = gen[mod.param];
	// 		var val = mod.gen.out();
	// 		audioLib.Automation.modes[mod.type](gen, mod.param, val);
	// 	}
	// 				
	// 	genValue += gen.out();
	// 				
	// 	for(var name in store) {
	// 		gen[name] = store[name];
	// 	}
	// 	
	// 	this.env.generate();
	// 	this.osc.generate();
	// 	
	// 	this.value = (this.env.getMix() * this.osc.getMix()) * this.mix;
	// 	
	// 	for(var e = 0; e < this.osc.fx.length; e++) {
	// 		this.value = this.osc.fx[e].fxout(this.value);
	// 	}
	// };
	// 
	that.out = function() {
		//this.generate();
		//return this.value;
	}
	
	that.getMix = function() {
		return this.value * this.mix;
	};
	
	//Gibber.generators.push(that);
	
	that.chain = function() {
		for(var i = 0; i < arguments.length; i++) {
			this.osc.chain(arguments[i]);
		}
		return this;
	};
	
	that.mod = function() {
		if(typeof arguments[2] === "undefined") {
			this.osc.mod(arguments[0], arguments[1]);
		}else{
			this.osc.mod(arguments[0], arguments[1], arguments[2]);
		}
	};
	
	Gibber.generators.push(that.osc);
	that.osc.mod("mix", that.env, "*");
	
	
	//that.__proto__ = new audioLib.GeneratorClass();
	return that;
}
// TODO: Extend for FM?
//FM = Synth;
//FM.note = 