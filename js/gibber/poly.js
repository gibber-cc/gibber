function Poly(_chord, _waveform, volume) {
	var that = {
		oscs : null,
		waveform: _waveform,
		name: "Synth",
		type: "complex",
		env : Env(),
		amp: null,
		frequency: 440,
		phase : 0,
		value : 0,
		active : true,
		notation: null,
		masters: [],
		notes: [],
		_start : true,
		counter : -1,
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
	
	
	if(typeof arguments[0] === "object" && !$.isArray(arguments[0])) {
		var obj = arguments[0];
		
		for(key in obj) {
			that[key] = obj[key];
		}
		that.amp = isNaN(that.amp) ? .2 : that.amp;
		that.amp /= 5;
		that.notation = that.notation || "C4m7";
		that.waveform = that.waveform || "square";
		
	}else{
		that.amp = isNaN(volume) ? .2 : volume;
		that.amp /= 5;
		that.notation = _chord || "C4m7";
		that.waveform = _waveform || "square";
	}
	
	that.oscs = [
		Osc(220, .1, that.waveform).silent(),
		Osc(330, .1, that.waveform).silent(),
		Osc(440, .1, that.waveform).silent(),
		Osc(550, .1, that.waveform).silent(),
		Osc(660, .1, that.waveform).silent(),
	];
	
	that.mods = [];
	that.fx = [];
	that.sends = [];	
	
	Gibber.addModsAndFX.call(that);	
	
	that.chord = function(val) {
		this.notation = val;
				
		for(var i = 0; i < this.oscs.length; i++) {
			this.oscs[i].active = false;
		}
		if(typeof this.notation === "string") {
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
		}else{
			for(var k = 0; k < this.notation.length; k++) {
				var note = this.notation[k];
				if(typeof note === "number"){
					this.oscs[k].frequency = note;
					this.oscs[k].active = true;					
				}else{
					this.oscs[k].frequency = teoria.note(note).fq();
					this.oscs[k].active = true;
				}
			}
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
			this.amp = vol;
		}
		this.env.triggerGate();
	};
	
	//console.log("end of constructor");
	
	that.chord(that.notation);
	
	Gibber.generators.push(that);
	
	return that;
}