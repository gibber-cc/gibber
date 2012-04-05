Gibber.FMPresets = {
	glockenspiel : {
		cmRatio	: 3.5307,
		index 	: 1,
		attack	: 1,
		decay	: 1000
	},
	gong : {
		cmRatio : 1.4,
		index	: .95,
		attack	: 1,
		decay	: 5000,
	},
	drum : {
		cmRatio : 1.40007,
		index	: 2,
		attack	: 1,
		decay	: 1000,
	},
	drum2 : {
		cmRatio: 1 + Math.sqrt(2),
		index: .2,
		attack: 1,
		decay: 20,
	},
	brass : {
		cmRatio : 1 / 1.0007,
		index	: 5,
		attack	: 100,
		decay	: 100,
	},
	clarinet : {
		cmRatio	: 3 / 2,
		index	: 1.5,
		attack	: 50,
		decay	: 200,
	}
};

// TODO: modulator should use same amplitude envelope as the carrier, would probably require a custom generate method.
// or, if you keep them separate, expand envelope capabilities to be more advanced

function FM(cmRatio, index, attack, decay, shouldUseModulatorEnvelope){
	var that = Synth({ waveShape : "sine"});
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
	
	that.amp = .5;
	that.active = false;
	
	modFreq = that.osc.frequency * that.cmRatio;
	modAmp = that.index * that.osc.frequency;
	
	that.modulator = Sine(modFreq, modAmp).silent();

	shouldUseModulatorEnvelope = (typeof shouldUseModulatorEnvelope === "undefined") ? true : shouldUseModulatorEnvelope;
	
	if(shouldUseModulatorEnvelope) {
		//that.modulator.env = Env(that.attack, that.decay);
		//that.modulator.mod("mix", that.modulator.env, "*");
	}
	
	that.mod = function(_name, _source, _type) {
		var name = (typeof Gibber.shorthands[_name] !== "undefined") ? Gibber.shorthands[_name] : _name;
		var type = (typeof _type !== "undefined") ? Gibber.automationModes[_type] : 'addition';
		
		if(typeof _source.mods === "undefined") {
			_source.mods = [];
		}
			
		_source.store = {};
		_source.modded.push(this);
		_source.param = name;
		_source.name = _name;
		_source.type = type;
			
		this.mods.push(_source);			
			
		Gibber.genRemove(_source);
		return this;
	};
	
	that.note = function(n) {
		var oscFreq;
		switch(typeof n) {
			case "number" :
				oscFreq = n;
			break;
			case "string" :
				oscFreq = teoria.note(n).fq();
			break;
			default:
				oscFreq = n.fq();
				break;
		}
		
		//console.log("cmRatio = " + this.cmRatio + " : index = " + this.index);
		this.osc.frequency = oscFreq;
		this.modulator.frequency = oscFreq * this.cmRatio;
		this.modulator.mix = oscFreq * this.index;
		//console.log("freq = " + this.modulator.frequency + " : mix = " + this.modulator.mix);
		
		this.env.triggerGate();
		this.active = true;
	};
	
	that.generate = function() {
		if(this.active === true) {
			var envValue = this.env.generate();
		
			var modValue = this.modulator.out() * envValue;
			var freqStore = this.osc.frequency;
		
			this.osc.frequency += modValue;
			this.value = this.osc.out();
		
			this.osc.frequency = freqStore;
			
			this.value *= envValue;
			if(envValue < .005 && this.env.state != 0) {
				this.active = false;
			}
		}
	}
	
	that.getMix = function() {
		return this.value * this.amp;
	}
		
	return that;
};