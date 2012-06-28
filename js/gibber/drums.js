// Gibber - drums.js
// ========================

// TODO: d._sequence is getting changed when shuffling, so reset no longer works correctly.
// maybe nows the time to fix the memory situation once and for all?
// ###Drums
// Three different samplers linked to a combined sequencer for convenience  
//
// param **sequence**: String. Uses x for kick, o for snare, * for cowbell (just a repitched snare at the moment)  
// param **timeValue**: Int. A duration in samples for each drum hit. Commonly uses Gibber time values such as _4, _8 etc.  
// param **mix**: Float. Default = .175. Volume for drums  
// param **freq**: Int. The audioLib.js samplers use 440 as a fundamental frequency. You can raise or lower the pitch of samples by changing this value.  
//
// example usage:    
// `d = Drums("xo*o", _8, .2, 880)  `
//
// note that most Drum methods mirror that of Seq. 

function Drums (_sequence, _timeValue, _amp, _freq){
	this.kick  = new audioLib.Sampler(Gibber.sampleRate);
	this.snare = new audioLib.Sampler(Gibber.sampleRate);		
	this.hat   = new audioLib.Sampler(Gibber.sampleRate);
	this.amp   = isNaN(_amp) ? .4 : _amp;
	this.frequency = isNaN(_freq) ? 440 : _freq;
	
	this.value = 0;
	this.active = true;
	this.mods = [];
	this.fx = [];
	this.sends = [];
	this.masters = [];
	this.pitch = 1; // pitch is a mod to frequency; only used when the value is set
	
	this.sequenceInit =false;
	this.initialized = false;
	this.seq = null;
	
	Gibber.addModsAndFX.call(this);
	Gibber.generators.push(this);	
	
	var that = this; // closure so that d.shuffle can be sequenced
	this.shuffle = function() { console.log("SHUFFLE"); that.seq.shuffle(); };
	this.reset = function() { that.seq.reset(); };
	
	this.load();
	
	if(typeof arguments[0] === "object") {
		var obj = arguments[0];
		
		for(key in obj) {
			this[key] = obj[key];
		}
		
		this.seq = Seq({
			doNotAdvance : true,
			note : 	this.sequence.split(""),
			speed : 	this.speed,
			slaves :	[this],
		});
	}else if(typeof _sequence != "undefined") {
		if(typeof _timeValue !== "undefined") {
			if($.isArray(_timeValue)) {
				this.seq = Seq({
					doNotAdvance : true,					
					note :_sequence.split(""),
					durations : _timeValue,
					slaves:[this],
				});
			}else{
				this.seq = Seq({
					doNotAdvance : true,					
					note :_sequence.split(""),
					speed : _timeValue,
					slaves:[this],
				});
			}
		}else{
			_timeValue = window["_"+_sequence.length];
			this.seq = Seq({
				doNotAdvance : true,					
				note :_sequence.split(""),
				speed : _timeValue,
				slaves:[this],
			});
		}
	}
	
	(function(obj) {
		var that = obj;
		var _pitch = 1;
		
	    Object.defineProperties(that, {
			"speed" : {
		        get: function() {
		            return that.seq.speed;
		        },
		        set: function(value) {
					if(that.seq != null) {
						that.seq.speed = value;
					}
		        }
			},
			// pitch is a multiplier for the fundamental frequency of the samplers (440). A pitch value of 2 means the samples will be played with a frequency of 880 hz.
			"pitch" : {
		        get: function() {
		            return _pitch;
		        },
		        set: function(value) {
					_pitch = value;
					that.frequency = 440 * value;
		        }
			},
	    });
	})(this);
	
	if(this.pitch != 1) this.pitch = arguments[0].pitch;
	
	if(this.seq !== null) {
		this.seq.doNotAdvance = false;
		this.seq.advance();
	}
}

Drums.prototype = {
	sampleRate : 44100, //Gibber.sampleRate,
	type  : "complex",
	name  : "Drums",
		
	load : function (){
		// SAMPLES ARE PRELOADED IN GIBBER CLASS... but it still doesn't stop the hitch when loading these...
		this.kick.loadWav(Gibber.samples.kick);
		this.snare.loadWav(Gibber.samples.snare);
		this.hat.loadWav(Gibber.samples.snare); // TODO: CHANGE TO HIHAT SAMPLE
			
		this.initialized = true;
	},
	
	replace : function(replacement) { 
		if(typeof this.seq != "undefined") {
			this.seq.kill();
		}
		for( var i = 0; i < this.masters.length; i++) {
			replacement.masters.push(this.masters[i]);
		}
		for( var j = 0; j < this.fx.length; j++) {
			replacement.fx.push(this.fx[j]);
		}
		for( var k = 0; k < this.mods.length; k++) {
			replacement.mods.push(this.mods[k]);
		}
		this.kill();
	},
	
	kill : function() {
		Gibber.genRemove(this);
		this.masters.length = 0;
		this.mods.length = 0;
		this.fx.length = 0;
	},
	
	generate : function() {
		this.value = 0;
		if(!this.initialized) {
			return;
		}
			
		this.kick.generate();
		this.value += this.kick.getMix();

		this.snare.generate();
		this.value += this.snare.getMix();
			
		this.hat.generate();
		this.value += this.hat.getMix();
	},
		
	getMix : function() { return this.value * this.amp; },
	
	once : function() {
		this.seq.once();
		return this;
	},
	
	retain : function(num) { 
		if(isNaN(num)) {
			this.seq.retain();
		}else{
			this.seq.retain(num); 
		}
	},
	set : function(newSequence, _timeValue) { 
		if(typeof this.seq === "undefined" || this.seq === null) {
			this.seq = Seq(newSequence, _timeValue).slave(this);
		}else{
			this.seq.sequences.note = newSequence.split("");//set(newSequence); 
		}
	},
	
	note : function(nt) {
		switch(nt) {
			case "x":
				this.kick.noteOn(this.frequency);
				break;
			case "o":
				this.snare.noteOn(this.frequency);
				break;
			case "*":
				this.hat.noteOn(this.frequency * 3.5); // multiply to make a higher pitched sound, 'cuz I can't get a better hihat sound in there
				break;
			default: break;
		}
	},
};