function FM(cmRatio, index, attack, decay, shouldUseModulatorEnvelope){
	var that = Synth("sine");
	that.name = "FM";
	that.cmRatio 	= isNaN(cmRatio) ? 2 : cmRatio;
	that.index = isNaN(index)	 ? .9 : index;
	modFreq = that.osc.frequency * that.cmRatio;
	modAmp = that.index * that.osc.frequency;
	that.modulator = Sine();

	Gibber.genRemove(that.modulator);
	
	that.attack = isNaN(attack) ? 100 : attack;
	that.decay = isNaN(decay) ? 100 : decay;
	
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
	
	return that;
};
