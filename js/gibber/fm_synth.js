Gibber.FMPresets = {
	gong : {
		cmRatio : 1.4,
		index	: .95,
		attack	: 1,
		decay	: 5000,
	},
	drum : {
		cmRatio : 1.4,
		index	: 2,
		attack	: 1,
		decay	: 1000,
	},
	brass : {
		cmRatio : 1 / 1.0007,
		index	: 5,
		attack	: 100,
		decay	: 100,
	},
};

function FM(cmRatio, index, attack, decay, shouldUseModulatorEnvelope){
	var that = Synth("sine");
	that.name = "FM";
	
	if(typeof arguments[0] === "string") {	// if a preset
		var preset = Gibber.FMPresets[arguments[0]];
		that.cmRatio 	= preset.cmRatio;
		that.index 		= preset.index;
		that.attack 	= preset.attack;
		that.decay 		= preset.decay;
	}else{
		that.cmRatio 	= isNaN(cmRatio) ? 2 : cmRatio;
		that.index = isNaN(index)	 ? .9 : index;
		that.attack = isNaN(attack) ? 100 : attack;
		that.decay = isNaN(decay) ? 100 : decay;
	}
	
	modFreq = that.osc.frequency * that.cmRatio;
	modAmp = that.index * that.osc.frequency;
	
	that.modulator = Sine();
	Gibber.genRemove(that.modulator);

	shouldUseModulatorEnvelope = (typeof shouldUseModulatorEnvelope === "undefined") ? true : shouldUseModulatorEnvelope;
	
	if(shouldUseModulatorEnvelope) {
		that.modulator.env = Env(that.attack, that.decay);
		that.modulator.mod("mix", that.modulator.env, "*");
	}
		
	that.osc.mod("freq", that.modulator, "+");
	
	that.note = function(n) {
		var oscFreq = (typeof n === "string") ? Note.getFrequencyForNotation(n) : n;
		this.osc.frequency = oscFreq;
		this.modulator.frequency = oscFreq * this.cmRatio;
		this.modulator.mix = oscFreq * this.index;
		
		this.env.triggerGate();
		this.modulator.env.triggerGate();
	};
	
	(function() {
	    var mix = that.mix;
		var fx  = that.osc.fx;
		
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
		})
	})();
	
	
	return that;
};
