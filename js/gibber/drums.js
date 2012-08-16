// Gibber - drums.js
// ========================

/**#Drums
Four different samplers linked to a single [Seq](javascript:Gibber.Environment.displayDocs('Seq'\)) for convenience. The four samplers feed into a single
[Bus](javascript:Gibber.Environment.displayDocs('Bus'\)); this means you can change the amplitude / apply
fx to each sampler individually or make changes to the Bus. Similarly, you can change the pitch of individual samplers and for the Drums as a whole.

## Example Usage ##
`d = Drums('x*o*x*o-', _8);
d.amp = .4;
d.snare.amp = 1.2;
d.snare.fx.add( Delay(_16) );
d.fx.add( Flanger() );
d.shuffle(); // shuffle the underlying sequence`

## Constructor
**param** *sequence*: String. Uses x for kick, o for snare, * for closed hihat, - for open hihat
**param** *timeValue*: Int. A duration in samples for each drum hit. Commonly uses Gibber time values such as _4, _8 etc.  
**param** *amp*: Float. Default = .175. Volume for drums  
**param** *freq*: Int. The audioLib.js samplers use 440 as a fundamental frequency. You can raise or lower the pitch of samples by changing this value.  

example usage:  
`d = Drums("x*o*x*o-", _8);`

note that most Drum methods mirror that of Seq. 
**/

function Drums(_sequence, _timeValue, _amp, _freq) {
	return new _Drums(_sequence, _timeValue, _amp, _freq);
}

function _Drums (_sequence, _timeValue, _amp, _freq){
	Gibberish.extend(this, Gibberish.Bus());

/**###Drums.pitch : property
Float. The overall pitch of the Drums. Each specific drum can also have its pitch set.
**/	
	this.pitch = 1;
	
/**###Drums.kick : property
[Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\)) (read-only).
**/	
	this.kick 	 = { sampler: Gibberish.Sampler("audiofiles/kick.wav"), pitch: 1, amp: 1 } ;
/**###Drums.snare : property
[Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\)) (read-only).
**/	
	this.snare	 = { sampler: Gibberish.Sampler("audiofiles/snare.wav"), pitch: 1, amp: 1 };
/**###Drums.hat : property
[Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\)) (read-only).
**/	
	this.hat	 = { sampler: Gibberish.Sampler("audiofiles/hat.wav"), pitch: 1, amp: 1 };
/**###Drums.openHat : property
[Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\)) (read-only).
**/
	this.openHat = { sampler: Gibberish.Sampler("audiofiles/openHat.wav"), pitch: 1, amp: 1 };

	this.kick.sampler.send(this,  1);
	this.snare.sampler.send(this, 1);
	this.hat.sampler.send(this,   1);
	this.openHat.sampler.send(this, 1);	
	
	// these are convenience wrappers. to mod, you must use this.kick.sampler etc.
	this.kick.fx = this.kick.sampler.fx;
	this.snare.fx = this.snare.sampler.fx;
	this.hat.fx = this.hat.sampler.fx;
	this.openHat.fx = this.openHat.sampler.fx;
	
	this.connect(Master);
		
	this.active = true;
	this.masters = [];
	
	this.sequenceInit =false;
	this.initialized = false;
	
/**###Drums.seq : property
[Seq](javascript:Gibber.Environment.displayDocs('Seq'\)) (read-only). The underlying sequencer driving the drums. Most methods of this are wrapped,
for example, you can simply call `drums.play()` instead of having to call `drums.seq.play`.
**/
	this.seq = null;
	
	var that = this; // closure so that d.shuffle can be sequenced
	
/**###Drums.shuffle : method	
**description** : shuffle() randomizes the order of notes in the Drums object. The order can be reset using the reset() method.
**/
	this.shuffle = function() { that.seq.shuffle(); };
	
/**###Drums.reset : method
**param** *memory location* Int. Optional. If Drums has retained an order, you can recall it by passing its number here. Otherwise the Drums sequence is reset to its original order
	
**description** : reset order of Drumssequence to its original order or to a memorized set of positions
**/
	this.reset 	= function() { that.seq.reset(); };
/**###Drums.stop : method
**description** : stop the Drums sequencer from running and reset the position counter to 0
**/	
	this.stop 	= function() { that.seq.stop(); };
/**###Drums.play : method
**description** : start the Drums sequencer running
**/
	this.play 	= function() { that.seq.play(); };	
	
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
					//this.bus.amp = value;
		        }
			},
			
	    });
	})(this);
	
/**###Drums.amp : property
Float. The overall amplitude of the Drums. Each specific drum can also have its amplitude set.
**/	
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
	
/**###Drums.kill : method
**description** : Remove a Drums instance from the audio graph
**/
	kill : function() {
		Master.disconnectUgen(this);
		this.destinations.remove(Master);
		this.masters.length = 0;
		this.seq.stop();
	},
	
/**###Drums.once : method
**description** : Play the Drums sequence once and then stop.
**/
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
	
/**###Drums.note : method	
**param** *note* : String. The note you want the drum to play. Can be x, o, *, -.  
**description** : shuffle() randomizes the order of notes in the Drums object. The order can be reset using the reset() method.
**/
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