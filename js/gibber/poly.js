function Poly(_chord, _waveform, volume) {
	volume = isNaN(volume) ? .2 : volume;
	var _volume = volume / 5;
	_chord = _chord || "C4m7";
	_waveform = _waveform || "square";

	var that = {
		oscs : [
			Osc([220, .1, _waveform], false),
			Osc([330, .1, _waveform], false),
			Osc([440, .1, _waveform], false),
			Osc([550, .1, _waveform], false),
			Osc([660, .1, _waveform], false),
		],
		waveform: _waveform,
		name: "Synth",
		type: "complex",
		env : Env(),
		amp: volume,
		frequency: 440,
		phase : 0,
		value : 0,
		active : true,
		notation: _chord,
		masters: [],
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
		notes: [],
		
		_start : true,
		counter : -1,
	};
	
	that.mods = [];
	that.fx = [];
	that.sends = [];	
	
	Gibber.addModsAndFX.call(that);	
	
	that.chord = function(val) {
		this.notation = val;
		for(var i = 0; i < this.oscs.length; i++) {
			this.oscs[i].active = false;
		}
		var _root = this.notation.slice(0,1);
		var _octave, _quality;
		if(isNaN(this.notation.charAt(1))) { 	// if true, then there is a sharp or flat...
			_root += this.notation.charAt(1);	// ... so add it to the root name
			_octave = parseInt( this.notation.slice(2,3) );
			_quality = this.notation.slice(3);
		}else{
			_octave = parseInt( this.notation.slice(1,2) );
			_quality = this.notation.slice(2);
		}
		//console.log(_root + " : " + _octave + " : " + _quality);
		var _chord = teoria.note(_root + _octave).chord(_quality);
		for(var j = 0; j < _chord.notes.length; j++) {
			var n = _chord.notes[j];
			this.notes[j] = n.fq();
			this.oscs[j].frequency = this.notes[j];
			this.oscs[j].active = true;			
		}
	};
	
	that.kill = function() {
		Gibber.genRemove(this);
		this.masters.length = 0;
		this.mods.length = 0;
		this.fx.length = 0;
	},
	
	that.replace = function(replacement){
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
	};

	
	that.stop = function() {
		this.active = false;
	};
	
	that.start = function() {
		this.phase = 0;
		this.active = true;
	};
	
	(function() {
		var attack = that.env.attack;
		var decay  = that.env.decay;
		var sustain = that.env.sustain;
		var sustainTime = that.env.sustainTime;
		
	    Object.defineProperties(that, {
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
	
	that.generate = function() {
		var val = 0;
		for(var i = 0; i < this.oscs.length; i++) {
			var _osc = this.oscs[i];
			if(_osc.active) {
				val += _osc.out();
			}
		}		
		this.env.generate();
		
		val *= this.env.value;
		
		this.value = val;
	}
	
	that.getMix = function() {
		return this.value * this.amp;
	};
	
	//Gibber.generators.push(that);
	
	// that.chain = function() {
	// 	for(var i = 0; i < arguments.length; i++) {
	// 		this.osc.chain(arguments[i]);
	// 	}
	// 	return this;
	// };
	// 
	// that.mod = function() {
	// 	if(typeof arguments[2] === "undefined") {
	// 		this.osc.mod(arguments[0], arguments[1]);
	// 	}else{
	// 		this.osc.mod(arguments[0], arguments[1], arguments[2]);
	// 	}
	// };
	
	that.trig = function(vol) {
		if(typeof vol !== "undefined") {
			this.mix = vol;
		}
		this.env.triggerGate();
	};
	
	//console.log("end of constructor");
	
	that.chord(that.notation);
	
	Gibber.generators.push(that);
	
	return that;
}