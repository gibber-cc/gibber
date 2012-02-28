/* 	
Charlie Roberts 2012 MIT License

Oscillator and envelope wrapped together with a method to play notes.

usage:
s = Synth();
s.note("A4");

*/

(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){

function Synth(waveform, volume) {
	this.volume = isNaN(volume) ? .2 : volume;
	this.waveform = waveform || "triangle";
	this.osc = Osc([440, this.volume, this.waveform], false);
	this.env = Env();
	this.osc.mod("mix", this.env, "*");
	
	if(typeof waveform !== "undefined") {
		this.osc.waveShape = waveform;
	}
	
	this.mix= .2;
	this.frequency= 440;
	this.phase = 0;
	this.value = 0;
	this.active = true;
	this._start = true;
	this.counter = -1;
	
	this.mods = [];
	this.fx = [];
	this.sends = [];
	
	Gibber.generators.push(this.osc);
	
	// meta-methods
	(function(obj) {
		var that = obj;
	    var mix = that.mix;
		var attack = that.env.attack;
		var decay  = that.env.decay;
		var sustain = that.env.sustain;
		var sustainTime = that.env.sustainTime;
		var waveShape = that.osc.waveShape;
		var fx = that.osc.fx;
		
	    Object.defineProperties(that, {
			"mix" : {
		        get: function() {
		            return mix;
		        },
		        set: function(value) {
		            mix = value;
					this.osc.mix = value;
		        }
			},
			"fx" : {
				get : function() {
					return this.osc.fx;
				},
				set : function(_fx) {
					this.osc.fx = _fx;
				}
			},
			"waveShape" : {
		        get: function() {
		            return waveShape;
		        },
		        set: function(value) {
		            waveShape = value;
					this.osc.waveShape = value;
		        }
			},
			
			"attack" : {
		        get: function() {
		            return attack;
		        },
		        set: function(value) {
		            attack = value;
					this.env.attack = value;
		        }
			},
			"decay" : {
		        get: function() {
		            return decay;
		        },
		        set: function(value) {
		            decay = value;
					this.env.decay = value;
		        }
			},
			"sustain" : {
		        get: function() {
		            return sustain;
		        },
		        set: function(value) {
		            sustain = sustain;
					this.env.sustain = value;
		        }
			},
			"sustainTime" : {
		        get: function() {
		            return sustainTime;
		        },
		        set: function(value) {
		            sustainTime = value;
					this.env.sustainTime = value;
		        }
			},
	    });
	})(this);
}

Synth.prototype = {
	name: "Synth",
	type: "complex",

	note : function(n) {
		switch(typeof n) {
			case "number" :
				this.osc.frequency = n;
			break;
			case "string" :
				this.osc.frequency = teoria.note(n).fq();
			break;
			default:
				this.osc.frequency = n.fq();
				break;
		}
		this.env.triggerGate();
	},
	
	kill : function() {
		Gibber.genRemove(this.osc);
	},
	
	replace : function(replacement){
		// can't replace, just remove instead.
		Gibber.genRemove(this);
		delete this.osc;
		delete this.env;
		delete this;
	},
	
	stop : function() {
		this.active = false;
	},
	
	start : function() {
		this.phase = 0;
		this.active = true;
	},
		
	out : function() {
		//this.generate();
		//return this.value;
	},
	
	getMix : function() {
		return this.value * this.mix;
	},
	
	//Gibber.generators.push(that);
	
	chain : function() {
		for(var i = 0; i < arguments.length; i++) {
			this.osc.chain(arguments[i]);
		}
		return this;
	},
	
	mod : function() {
		if(typeof arguments[2] === "undefined") {
			this.osc.mod(arguments[0], arguments[1]);
		}else{
			this.osc.mod(arguments[0], arguments[1], arguments[2]);
		}
	},
}

Synth.prototype.__proto__ = new audioLib.GeneratorClass();

audioLib.generators('Synth', Synth);

audioLib.Synth = audioLib.generators.Synth;
 
}(audioLib));
audioLib.plugins('Synth', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
	exports.init = initPlugin;
} else {
	initPlugin(audioLib);
}

}());

function Synth (waveform, volume) {
	var s = new audioLib.Synth(waveform, volume);
	return s;
}
