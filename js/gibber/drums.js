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

function Drums(_sequence, _timeValue, _amp, _freq) {
	return new _Drums(_sequence, _timeValue, _amp, _freq);
}


function _Drums (_sequence, _timeValue, _amp, _freq){
	this.kick  = Gibberish.Sampler("http://127.0.0.1/~charlie/gibber/audiofiles/kick.wav");//new audioLib.Sampler(Gibber.sampleRate);
	this.snare = Gibberish.Sampler("http://127.0.0.1/~charlie/gibber/audiofiles/snare.wav");//new audioLib.Sampler(Gibber.sampleRate);		
	this.hat   = Gibberish.Sampler("http://127.0.0.1/~charlie/gibber/audiofiles/hat.wav");//new audioLib.Sampler(Gibber.sampleRate);
	this.openHat = Gibberish.Sampler("http://127.0.0.1/~charlie/gibber/audiofiles/openhat.wav");//new audioLib.Sampler(Gibber.sampleRate);
	
	this.bus = Gibberish.Bus();
	
	this.kick.connect(this.bus);
	this.snare.connect(this.bus);
	this.hat.connect(this.bus);
	this.openHat.connect(this.bus);	
	
	this.kick.pitch = 0;
	this.snare.pitch = 0;	
	this.hat.pitch = 0;
	this.openHat.pitch = 0;
	
	this.bus.connect(Master);
	
	this.amp   = isNaN(_amp) ? .4 : _amp;
	this.frequency = isNaN(_freq) ? 440 : _freq;
	
	this.active = true;
	this.masters = [];
	this.pitch = 1; // pitch is a mod to frequency; only used when the value is set
	
	this.sequenceInit =false;
	this.initialized = false;
	this.seq = null;
	
	var that = this; // closure so that d.shuffle can be sequenced
	this.shuffle = function() { console.log("SHUFFLE"); that.seq.shuffle(); };
	this.reset = function() { that.seq.reset(); };
	
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
	
	//this.seq = {};
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
	//if(this.pitch != 1) this.pitch = arguments[0].pitch;
	
	if(this.seq !== null) {
		this.seq.doNotAdvance = false;
		this.seq.advance();
	}
}

_Drums.prototype = {
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
				this.kick.note(this.pitch + this.kick.pitch);
				break;
			case "o":
				this.snare.note(this.pitch + this.snare.pitch);
				break;
			case "*":
				this.hat.note(this.pitch + this.hat.pitch);
				break;
			case "-":
				this.openHat.note(this.pitch + this.openHat.pitch);
				break;
			default: break;
		}
	},
};