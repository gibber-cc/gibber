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
	this.amp   = isNaN(_amp) ? .2 : _amp;

	this.sounds = {
		kick 	: { sampler: Gibberish.Sampler("http://127.0.0.1/~charlie/gibber/audiofiles/kick.wav"), pitch:1, amp:this.amp },
		snare	: { sampler: Gibberish.Sampler("http://127.0.0.1/~charlie/gibber/audiofiles/snare.wav"),pitch:1, amp:this.amp },
		hat		: { sampler: Gibberish.Sampler("http://127.0.0.1/~charlie/gibber/audiofiles/hat.wav"), 	pitch:1, amp: this.amp }, 
		openHat	: { sampler: Gibberish.Sampler("http://127.0.0.1/~charlie/gibber/audiofiles/openhat.wav"), pitch:1, amp:this.amp },
	}
	
	this.bus = Gibberish.Bus();

	this.sounds.kick.sampler.send(this.bus, this.amp);
	this.sounds.snare.sampler.send(this.bus, this.amp);
	this.sounds.hat.sampler.send(this.bus, this.amp);
	this.sounds.openHat.sampler.send(this.bus, this.amp);	
	
	this.bus.connect(Master);
	
	Gibberish.extend(this, this.sounds);
	
	this.fx = this.bus.fx;
	
	// this enables this.kick.pitch = 2, this.kick.fx.add( Reverb() ) etc.
	this.kick = this.sounds.kick;
	this.kick.fx = this.sounds.kick.sampler.fx;
	this.snare = this.sounds.snare;
	this.snare.fx = this.sounds.snare.sampler.fx;
	this.hat = this.sounds.hat;
	this.hat.fx = this.sounds.hat.sampler.fx;
	this.openHat = this.sounds.openHat;
	this.openHat.fx = this.sounds.openHat.sampler.fx;
	
	this.active = true;
	this.masters = [];
	this.pitch = 1; // pitch is a mod to frequency; only used when the value is set
	
	this.sequenceInit =false;
	this.initialized = false;
	this.seq = null;
	
	var that = this; // closure so that d.shuffle can be sequenced
	this.shuffle = function() { that.seq.shuffle(); };
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
			
			"amp" : {
		        get: function() {
		            return amp;
		        },
		        set: function(value) {
					amp = value;
					for(var sound in this.sounds) {
						this.sounds[sound].sampler.disconnect();
						this.sounds[sound].sampler.send(this.bus, this.amp);
					}
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
	category  	: "complex",
	name  		: "Drums",
		
	load : function (){
		// SAMPLES ARE PRELOADED IN GIBBER CLASS... but it still doesn't stop the hitch when loading these...
		this.kick.loadWav(Gibber.samples.kick);
		this.snare.loadWav(Gibber.samples.snare);
		this.hat.loadWav(Gibber.samples.snare); // TODO: CHANGE TO HIHAT SAMPLE
				
		this.initialized = true;
	},
		
	replace : function(replacement) {
		this.kill();
		if(typeof this.seq != "undefined") {
			this.seq.kill();
		}
		for( var i = 0; i < this.masters.length; i++) {
			replacement.masters.push(this.masters[i]);
		}
	},
		
	kill : function() {
		Master.disconnectUgen(this.bus);
		this.bus.destinations.remove(Master);
		this.masters.length = 0;
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
			this.seq.note = newSequence.split("");//set(newSequence); 
		}
	},
	
	note : function(nt) {
		switch(nt) {
			case "x":
				this.sounds.kick.sampler.note(this.pitch * this.sounds.kick.pitch);
				break;
			case "o":
				this.sounds.snare.sampler.note(this.pitch * this.sounds.snare.pitch);
				break;
			case "*":
				this.sounds.hat.sampler.note(this.pitch * this.sounds.hat.pitch);
				break;
			case "-":
				this.sounds.openHat.sampler.note(this.pitch * this.sounds.openHat.pitch);
				break;
			default: break;
		}
	},
};