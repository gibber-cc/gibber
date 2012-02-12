/* 	
Charlie Roberts 2012 MIT License

Requires gibber.js. An audioLib.js plugin that allows you to easily sequence drum tracks.

x = kick
o = snare
* = closed hat

Usage: d = audioLib.Drums("x*o*x*o*");

*/


(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){

function _Drums (_sequence, _timeValue, _mix, _freq){
	this.timeValue = isNaN(_timeValue) ? 4 : _timeValue;	
	this.kick  = new audioLib.Sampler(Gibber.sampleRate);
	this.snare = new audioLib.Sampler(Gibber.sampleRate);		
	this.hat = new audioLib.Sampler(Gibber.sampleRate);
	this.sequence = _sequence;
	this.timeValue = this.timeValue;
	this.frequency = isNaN(_freq) ? 440 : _freq;
	this.patternLengthInMs = this.sequence.length * (Gibber.measure / this.timeValue);
	this.patternLengthInSamples = this.sequence.length * (Gibber.measure / this.timeValue) * (Gibber.sampleRate / 1000);
	this.mix = isNaN(_mix) ? 0.25 : _mix;
	
    for ( var prop in Gibber.modsAndEffects) { this[prop] = Gibber.modsAndEffects[prop]; }
	
	this.kick.loadWav(atob(samples.kick));
	this.snare.loadWav(atob(samples.snare));
	this.hat.loadWav(atob(samples.snare)); // TODO: CHANGE TO HIHAT SAMPLE
	
	this.setSequence(this.sequence);		
	
	Gibber.generators.push(this);
}

_Drums.prototype = {
	sampleRate : Gibber.sampleRate,
	tempo : Gibber.bpm,
	phase : 0,
	value : 0,
	active : true,
	mods : [],
	fx : [],
	automations : [],
	sequences : {
		kick  : [],
		snare : [],
		hat   : [],
	},
		
	generate : function() {
		this.value = 0;
			
		for(var i = 0; i < this.sequences.kick.length; i++) {
			if(this.phase == this.sequences.kick[i]) {
				this.kick.noteOn(this.frequency);
				break;
			}
		}
			
		this.kick.generate();
		this.value += this.kick.getMix();
			
		for(var i = 0; i < this.sequences.snare.length; i++) {
			if(this.phase == this.sequences.snare[i]) {
				this.snare.noteOn(this.frequency);
				break;
			}
		}
			
		this.snare.generate();
		this.value += this.snare.getMix();
			
		for(var i = 0; i < this.sequences.hat.length; i++) {
			if(this.phase == this.sequences.hat[i]) {
				this.hat.noteOn(this.frequency * 3.5);
				break;
			}
		}
			
		this.hat.generate();
		this.value += this.hat.getMix();
			
		if(++this.phase >= this.patternLengthInSamples) this.phase = 0;
	},
		
	getMix : function() { return this.value; },
		
	setSequence : function(seq) {
		var stepTime = Gibber.measure / seq.length;
		for(var i = 0; i < seq.length; i++) {
			var c = seq.charAt(i);
			var drum = null;
			switch(c) {
				case 'x': drum = "kick"; break;
				case 'o': drum = "snare"; break;
				case '*': drum = "hat"; break;
				default: break;
			}
			console.log("sequence " + drum + " :: " + stepTime * i);
			if(drum != null)
				this.sequences[drum].push((stepTime * i) * (Gibber.sampleRate / 1000));
		}
	},
	start : function() { this.active = true; },	
	stop : function() { this.active = false; },	
}

audioLib.generators('Drums', _Drums);

audioLib.Drums = audioLib.generators.Drums;

}(audioLib));
audioLib.plugins('Drums', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
	exports.init = initPlugin;
} else {
	initPlugin(audioLib);
}

}());

function Drums (_sequence, _timeValue, _mix, _freq) {
	return audioLib.Drums(_sequence, _timeValue, _mix, _freq);
}
