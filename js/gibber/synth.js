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
	
	(function() {
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
	})();
	
	
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