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
	this.pitch = 1;
	
	this.kick 	 = { sampler: Gibberish.Sampler("audiofiles/kick.wav"), pitch: 1, amp: 1 } ;
	this.snare	 = { sampler: Gibberish.Sampler("audiofiles/snare.wav"), pitch: 1, amp: 1 }
	this.hat	 = { sampler: Gibberish.Sampler("audiofiles/hat.wav"), pitch: 1, amp: 1 }
	this.openHat = { sampler: Gibberish.Sampler("audiofiles/openHat.wav"), pitch: 1, amp: 1 }

	this.bus = Gibberish.Bus();

	this.kick.sampler.send(this.bus,  1);
	this.snare.sampler.send(this.bus, 1);
	this.hat.sampler.send(this.bus,   1);
	this.openHat.sampler.send(this.bus, 1);	
	
	// these are convenience wrappers. to mod, you must use this.kick.sampler etc.
	this.kick.fx = this.kick.sampler.fx;
	this.snare.fx = this.snare.sampler.fx;
	this.hat.fx = this.hat.sampler.fx;
	this.openHat.fx = this.openHat.sampler.fx;
	
	this.bus.connect(Master);
		
	this.fx = this.bus.fx;
	
	this.active = true;
	this.masters = [];
	
	this.sequenceInit =false;
	this.initialized = false;
	this.seq = null;
	
	var that = this; // closure so that d.shuffle can be sequenced
	this.shuffle = function() { that.seq.shuffle(); };
	this.reset 	= function() { that.seq.reset(); };
	this.stop 	= function() { that.seq.stop(); };
	
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
					this.bus.amp = value;
		        }
			},
			
	    });
	})(this);
	
	this.amp   = isNaN(_amp) ? .2 : _amp;
	
	if(this.seq !== null) {
		this.seq.doNotAdvance = false;
		this.seq.advance();
	}
}

_Drums.prototype = {
	category  	: "complex",
	name  		: "Drums",
		
	replace : function(replacement) {
		this.kill();
		if(typeof this.seq !== "undefined" && this.seq !== null) {
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
				this.kick.sampler.note(this.pitch * this.kick.pitch, this.kick.amp);
				break;
			case "o":
				this.snare.sampler.note(this.pitch * this.snare.pitch, this.snare.amp);
				break;
			case "*":
				this.hat.sampler.note(this.pitch * this.hat.pitch, this.hat.amp);
				break;
			case "-":
				this.openHat.sampler.note(this.pitch * this.openHat.pitch, this.openHat.amp);
				break;
			default: break;
		}
	},
};