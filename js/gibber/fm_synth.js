function FM(cmRatio, index, attack, decay, shouldUseModulatorEnvelope){
	var that = Synth();
	that.name = "FM";
	that.cmRatio 	= isNaN(cmRatio) ? 2 : cmRatio;
	that.index = isNaN(index)	 ? .9 : index;
	that.modulator = Sine(that.osc.frequency * that.cmRatio, that.index * that.osc.frequency);
	Gibber.genRemove(that.modulator);
	
	that.env.attack = isNaN(attack) ? 100 : attack;
	that.env.decay = isNaN(decay) ? 100 : decay;
		
	if(shouldUseModulatorEnvelope) {
		that.modulator.env = Env(that.osc.env.attack, that.osc.env.decay);
		that.modulator.mod("mix", that.modulator.env, "*");
	}
		
	that.osc.mod("freq", that.modulator, "+");
	
	that.note = function(n) {
		var oscFreq = (typeof n === "string") ? Note.getFrequencyForNotation(n) : n;
		this.osc.frequency = oscFreq;
		this.modulator.frequency = oscFreq * this.cmRatio;
		this.modulator.mix = oscFreq * this.index;
		
		//console.log("osc.freq = " + this.osc.frequency + " :: " + this.modulator.frequency + " :: " + this.modulator.mix);
		this.env.triggerGate();
	};
	
	return that;
};
