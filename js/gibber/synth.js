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

function Synth(attack, decay, volume) {
	this.volume = isNaN(volume) ? .4 : volume;
	this.waveform = "triangle";
	this.osc = Osc([440, 1, this.waveform], false).silent();
	this.env = Env();
	
	if(!isNaN(attack)) this.env.attack = attack;
	if(!isNaN(decay)) this.env.decay = decay;	
	
	if(typeof waveform !== "undefined") {
		this.osc.waveShape = waveform;
	}
	
	this.mix= this.volume;
	this.frequency= 440;
	this.phase = 0;
	this.value = 0;
	this.active = true;
	this._start = true;
	this.counter = -1;
	this.value = 0;
	
	this.mods = [];
	this.fx = [];
	this.sends = [];
	this.masters = [];
	
	//Gibber.generators.push(this.osc);
	Gibber.generators.push(this);
	// meta-methods
	(function(obj) {
		var that = obj;
	    var mix = that.mix;
		var frequency = that.osc.frequency;
		var attack = that.env.attack;
		var decay  = that.env.decay;
		var sustain = that.env.sustain;
		var sustainTime = that.env.sustainTime;
		var waveShape = that.osc.waveShape;
		var fx = that.osc.fx;
		
	    Object.defineProperties(that, {
			// "mix" : {
			// 		        get: function() {
			// 		            return mix;
			// 		        },
			// 		        set: function(value) {
			// 		            mix = value;
			// 		this.osc.mix = value;
			// 		        }
			// },
			"frequency" : {
				get : function() {
					return this.osc.frequency;
				},
				set : function(val) {
					this.osc.frequency = val;
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
	Gibber.addModsAndFX.call(this);
}

Synth.prototype = {
	name: "Synth",
	type: "complex",
	active : true,

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
	
	// TODO : get generate to work in synth
	
	out : function() {
		this.generate();
		return this.value * this.mix;
	},
	
	getMix : function() {
		return this.value * this.mix;
	},
	
	generate: function() {
		//console.log("Generate called");
		this.value = this.osc.out();
		// if(Gibber.debug) {
		// 	G.log(this.value);
		// }
		this.env.generate();
		
		this.value *= this.env.value;
	},
	
	kill : function() {
		Gibber.genRemove(this.osc);
		this.masters.length = 0;
		this.mods.length = 0;
		this.fx.length = 0;
	},
	
	replace : function(replacement){
		Gibber.genRemove(this);
		for(var i = 0; i < this.masters.length; i++) {
			var master = this.masters[i];
			for(var j = 0; j < master.slaves.length; j++) {
				if(master.slaves[j] == this) {
					master.slave(replacement);
					master.slaves.splice(j,1);
				}
			}
		}
		delete this.osc;
		delete this.env;
		delete this;
	},
	
	remove : function(replacement){
		// can't replace, just remove instead.
		Gibber.genRemove(this);
		for(var i = 0; i < this.masters.length; i++) {
			var master = this.masters[i];
			for(var j = 0; j < master.slaves.length; j++) {
				if(master.slaves[j] == this) {
					master.slave(replacement);
					master.slaves.splice(j,1);
				}
			}
		}
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
	
	chain : function() {
		for(var i = 0; i < arguments.length; i++) {
			this.osc.chain(arguments[i]);
		}
		return this;
	},
	
	// mod : function() {
	// 	console.log("MODDING")
	// 	console.log(this);
	// 	if(typeof arguments[2] === "undefined") {
	// 		this.mod(arguments[0], arguments[1]);
	// 	}else{
	// 		this.mod(arguments[0], arguments[1], arguments[2]);
	// 	}
	// },
	
	send : function(_bus, amount) {
		var bus = { 
			bus : Gibber.getBus(_bus),
			amount : amount,
		};
			
		bus.bus.senders.push(this);
			
		this.sends.push(bus);
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

function Synth (attack, decay, volume) {
	var s = new audioLib.Synth(attack, decay, volume);
	return s;
}
