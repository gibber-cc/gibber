//  Gibber - synth.js
// ========================

(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){
	
// ###Synth
// Create an oscillator with an attached envelope that can be triggered by note messages.
//
// param **attack**: Int in ms. The number of milliseconds the attack of the synth's envelope lasts  
// param **decay** : Int in ms. The number of milliseconds the decay of the synth's envelope lasts  
// param **volume** : Float. The volume of the synth.  
//
// example usage:  
//	`s = Synth(1000, 2000, .5);  
//   s.note("A4");  `

function Synth(attack, decay, volume) {	
	this.env = Env();
	this.osc = Osc(440, 1, "triangle", false).silent();
	
	(function(obj) {
		var that = obj;
		var frequency = that.osc.frequency;
		var attack = that.env.attack;
		var decay  = that.env.decay;
		var sustain = that.env.sustain;
		var sustainTime = that.env.sustainTime;
		var waveShape = that.osc.waveShape;
	
	    Object.defineProperties(that, {
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
	
	if(typeof arguments[0] === "object") {
		var obj = arguments[0];
		
		for(key in obj) {
			this[key] = obj[key];
		}
	}else{
		this.amp = isNaN(volume) ? .4 : volume;
		if(!isNaN(attack)) this.env.attack = attack;
		if(!isNaN(decay)) this.env.decay = decay;
	}
	
	this.amp = this.amp || .4;
	
	this.waveShape = this.waveShape || "triangle";
	
	this.frequency = 440;
	this.phase = 0;
	this.value = 0;
	this.active = true;
	
	this.mods = [];
	this.fx = [];
	this.sends = [];
	this.masters = [];
	Gibber.generators.push(this);
	Gibber.addModsAndFX.call(this);
}

Synth.prototype = {
	name: "Synth",
	type: "complex",
	active : true,
	
	// ###note
	// tell synth to play a particular frequency and trigger its envelope. The value can be either a frequency, a note name (such as "A4") or a note object from teoria.js
	//
	// param note: the value can be either string (note name), int(frequency), or object (teoria note object).
	note : function(note) {
		switch(typeof note) {
			case "number" :
				this.osc.frequency = note;
			break;
			case "string" :
				this.osc.frequency = teoria.note(note).fq();
			break;
			default:
				this.osc.frequency = note.fq();
				break;
		}
		this.active = true;
		this.env.triggerGate();
	},
	
	getMix : function() {
		return this.value * this.amp;
	},
	
	generate: function() {
		this.value = this.osc.out();
		this.env.generate();
		
		this.value *= this.env.value;

		if(this.env.value <= .005 && this.env.state != 0) {
			this.active = false;
		}
	},
	
	// ####kill
	// remove the generator from the graph and destroy all attached fx
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
	
	chain : function() {
		for(var i = 0; i < arguments.length; i++) {
			this.osc.chain(arguments[i]);
		}
		return this;
	},
	
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
