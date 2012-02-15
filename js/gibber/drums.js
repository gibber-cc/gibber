/* 	
Charlie Roberts 2012 MIT License

Requires gibber.js. An audioLib.js plugin that allows you to easily sequence drum tracks.

x = kick
o = snare
* = closed hat

Usage: d = audioLib.Drums("x*o*x*o*");

I don't know what happened here but the prototype ineheritance was completely jacked... had to go to creating an object
and manually assigning __proto__.

*/
// (function myPlugin(){
// 
// function initPlugin(audioLib){
// (function(audioLib){

function _Drums (_sequence, _timeValue, _mix, _freq){
	that = {
		sampleRate : Gibber.sampleRate,
		type  : "gen",
		name  : "Drums",
		tempo : Gibber.bpm,
		phase : 0,
		value : 0,
		active : true,
		mods : [],
		shouldBreak: false,
		breakToOriginal: false,
		fx : [],
		sequenceInit:false,
		automations : [],
		sequences : {
			kick  : [],
			snare : [],
			hat   : [],
		},
		initialized : false,
		
		load : function (){
			// SAMPLES ARE PRELOADED IN GIBBER CLASS
			this.kick.loadWav(Gibber.samples.kick);
			this.snare.loadWav(Gibber.samples.snare);
			this.hat.loadWav(Gibber.samples.snare); // TODO: CHANGE TO HIHAT SAMPLE
			
			this.initialized = true;
		},
	
		generate : function() {
			this.value = 0;
			if(!this.initialized) {
				phase++; 
				return;
			}
			
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
			
			if(++this.phase >= this.sequences.lengthInSamples) { 
				if(this.shouldBreak) { 
					this.shouldBreak = false;
					if(!this.breakToOriginal) {
						this.sequences = jQuery.extend(true, {}, this.preBreakSequences);
					}else{
						this.sequences = jQuery.extend(true, {}, this._sequences);
					}
				}
				
				//console.log("PHASE : " +this.phase + " TV :" + this.timeValue);
				this.phase = 0; 
			}
		},
		
		getMix : function() { return this.value; },
	
		clearSequence : function() {
			for(var name in this.sequences) {
				this.sequences[name].length = 0;
			}
		},
		
		createSequence : function(seq) {
			var output = {
				kick:[],
				snare:[],
				hat:[],
			};
			for(var i = 0; i < seq.length; i++) {
				var c = seq.charAt(i);
				var drum = null;
				switch(c) {
					case 'x': drum = "kick"; break;
					case 'o': drum = "snare"; break;
					case '*': drum = "hat"; break;
					default: break;
				}
				if(drum != null) {
					output[drum].push(this.timeValue * i);
				}
			}
			output.lengthInSamples = seq.length * this.timeValue;	

			return output;
		},
		// TODO: setSequence should have an option to change timeValue
		setSequence : function(seq) {
			this.sequences = this.createSequence(seq);
			
			if(!this.sequenceInit) {
				this._sequences = jQuery.extend(true, {}, this.sequences);
				this.sequenceInit = true;
			}							
		},
		
		reset: function() {
			this.sequences = jQuery.extend(true, {}, this._sequences);
			this.phase = 0;
		},
		
		break: function(newSeq, breakToOriginal) {
			this.shouldBreak = true;
			
			if(breakToOriginal) {
				this.breakToOriginal = true;
			}
			this.preBreakSequences = jQuery.extend(true, {}, this.sequences);
			this.sequences = this.createSequence(newSeq);
		},
		start : function() { this.active = true; },	
		stop  : function() { this.active = false; },	
	};
	that._sequences = that.sequences;
	
	that.seq = that.setSequence;
	
	// for(var name in this.__proto__) {
	// 	this[name] = this.__proto__[name];
	// }
	//console.log(this);
	that.kick  = new audioLib.Sampler(Gibber.sampleRate);
	that.snare = new audioLib.Sampler(Gibber.sampleRate);		
	that.hat   = new audioLib.Sampler(Gibber.sampleRate);
	that.mix   = isNaN(_mix) ? 0.175 : _mix;
	that.timeValue = isNaN(_timeValue) ? _4 : _timeValue;
	that.sequence  = _sequence;
	that.frequency = isNaN(_freq) ? 440 : _freq;
	that.patternLengthInSamples = that.sequence.length * that.timeValue;	
	
	// this.sequences = {
	// 	kick  : [],
	// 	snare : [],
	// 	hat   : [],
	// };
	that.setSequence(that.sequence);
	
	function bpmCallback() {
		return function(percentageChangeForBPM) {
			//console.log(percentageChangeForBPM);
			that.timeValue *= percentageChangeForBPM;
			that.patternLengthInSamples = that.sequence.length * that.timeValue;
			that.setSequence(that.sequence);
		}
	}
	
	Gibber.registerObserver("bpm", bpmCallback.call(that));
	Gibber.addModsAndFX.call(that);
	Gibber.generators.push(that);
	
	// that.kick.loadWav(Gibber.samples.kick);
	// that.snare.loadWav(Gibber.samples.snare);
	// that.hat.loadWav(Gibber.samples.snare); // TODO: CHANGE TO HIHAT SAMPLE
	
	that.__proto__ = new audioLib.GeneratorClass();
	
	return that;
}

// Drums.prototype = {
// 
// }

//_Drums.prototype.__proto__ = new audioLib.GeneratorClass();

//audioLib.generators('Drums', Drums);

// audioLib.Drums = audioLib.generators.Drums;
// 
// }(audioLib));
// audioLib.plugins('Drums', myPlugin);
// }
// 
// if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
// 	exports.init = initPlugin;
// } else {
// 	initPlugin(audioLib);
// }
// 
// }());

function Drums (_sequence, _timeValue, _mix, _freq) {
	var d = _Drums(_sequence, _timeValue, _mix, _freq);
	d.load();
	return d;
}
