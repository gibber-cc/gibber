// Gibber - drums.js
// ========================

/**#Drums - Miscellaneous
Four different samplers linked to a single [Seq](javascript:Gibber.Environment.displayDocs('Seq '\)) for convenience. The four samplers feed into a single
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

function EDrums(_sequence, _timeValue, _amp, _freq) {
	return new _EDrums(_sequence, _timeValue, _amp, _freq);
}

function _EDrums (_sequence, _timeValue, _amp, _freq){
	Gibberish.extend(this, Gibberish.Bus());
	
	var _fx = typeof arguments[0] !== "undefined" ? arguments[0].fx : undefined;
	
	this.channels = 2;
	this.fx = [];
	this.fx.parent = this;
	
	this.children = [];
	
/**###Drums.pitch : property
Float. The overall pitch of the Drums. Each specific drum can also have its pitch set.
**/	

	if(typeof arguments[0] === "object") {
		/*if(arguments[0].kit) {
			this.kit = Drums.kits[arguments[0].kit];
			arguments[0].kit = this.kit;
		}*/
	}
	
	this.kit = {
		kick:   { symbol:'x', amp:2.5, pitch:1, pan:0 },
		snare:  { symbol:'o', amp:1, pitch:1, pan:.15 },
		//hat:    { symbol:'*', amp:1, pitch:1, pan:-.1 },
		//openHat:{ symbol:'-', amp:1, pitch:1, pan:-.2 },
	};
	
	
	for(var key in this.kit) {
		if(key === "openHat") break;
		var drum = this.kit[key];
		var _key = key.charAt(0).toUpperCase() + key.slice(1);
		this[key] = Gibberish[ _key ]( { amp:drum.amp } );
		this[key].channels = 1;
		//this[key].sampler.pan = drum.pan;
		this[key].send(this, 1);
		//this[key].fx = this[key].synth.fx;
		this.children.push( this[key] );
		//Gibberish.extend(this.snare.sampler, props.snare); Gibberish.extend(this.snare, props.snare);
	}
	
	this.mod = function(name, mod, type) {
		for(var key in this.kit) {
			if(key === 'openHat') break;
			var drum = this[key];
			drum.mod(name, mod, type);
		}
	}

// /**###Drums.kick : property
// [Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\)) (read-only).
// **/	
// 	this.kick 	 = { sampler: Gibberish.Sampler(this.kit.kick[0]), pitch: 1, amp: 1 } ;
// 	this.kick.sampler.channels = 2;
// 	this.kick.sampler.pan = -.1;
// /**###Drums.snare : property
// [Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\)) (read-only).
// **/	
// 	this.snare	 = { sampler: Gibberish.Sampler(this.kit.snare[0]), pitch: 1, amp: 1 };
// 	this.snare.sampler.channels = 2;
// 	this.snare.sampler.pan = .1;
// /**###Drums.hat : property
// [Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\)) (read-only).
// **/	
// 	this.hat	 = { sampler: Gibberish.Sampler(this.kit.hat[0]), pitch: 1, amp: 1 };
// /**###Drums.openHat : property
// [Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\)) (read-only).
// **/
// 	this.openHat = { sampler: Gibberish.Sampler(this.kit.openHat[0]), pitch: 1, amp: 1 };
	
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

	/*var props = Gibber.applyPreset("Drums", arguments);
	console.log(props);
	//Gibberish.extend(this, props);
	//console.log(this.pitch);*/
	if(typeof props === "undefined") {
		if(typeof _sequence != "undefined") {
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
	}else{
		if(props.note) props.note = props.note.split("");
		props.slaves = [this];
		props.doNotAdvance = true;
		if(this.seq === null) this.seq = Seq(props);
		//Gibberish.extend(this, props);
		//this.seq.slave(this);
	}
	
	if(typeof props === "undefined") props = {};
	
	if(props.pitch) this.pitch = props.pitch;
	
	if(typeof props.snare !== "undefined") 	{ Gibberish.extend(this.Snare.synth, props.snare); Gibberish.extend(this.snare, props.snare); }
	if(typeof props.kick !== "undefined") 	{ Gibberish.extend(this.Kick.synth, props.kick); Gibberish.extend(this.kick, props.kick); }
	if(typeof props.hat !== "undefined") 	{ Gibberish.extend(this.Hat.synth, props.hat); Gibberish.extend(this.hat, props.hat); }
	if(typeof props.openHat !== "undefined") { Gibberish.extend(this.OpenHat.synth, props.openHat); Gibberish.extend(this.openHat, props.openHat); }
 
	(function(obj) {
		var that = obj;
		var amp = .2;
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
					Gibberish.dirty(this);
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
	
	if(props.fx) {
		this.fx.parent = this;
		for(var i = 0; i < props.fx.length; i++) {
			this.fx.add( props.fx[i] );
		}
	}
}

Gibber.presets.EDrums = {}
/*	kickSnare: {
		note : 'xoxo',
		snare: { pitch:1, fx: [ Reverb() ], amp:2.5 },
		kick : { pitch:1, fx: [ Delay(1/16, .5)  ] },
		speed: 1/4,
	},
	weird : {
		note: 'x*o*x-o*',
		snare: { pitch: -1, amp:1.5, fx: [ Ring(880, 1), Delay(1/6, .5) ] },
		kick:  { pitch: 1, fx: [ Clip(5000), Flanger(), Schizo('paranoid') ] },
		hat:   { pitch: 2, fx: [ Crush(8, .1), Schizo('paranoid') ] },		
		openHat:   { pitch: -2, },
		speed:1/8,
	}
};*/

_EDrums.prototype = {
	category  	: "complex",
	name  		: "EDrums",
	mod			: Gibberish.polyMod,
	removeMod	: Gibberish.removePolyMod,
		
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
			case 'x':
				this.kick.note();
			break;
			case 'o':
				this.snare.note();
			break;
			case '*':
				this.hat.note(7000, 14000);
			break;
			case '-':
				this.hat.note(15000, 36000);
			break;
			default:
			break;
		}
		/*for(var key in this.kit) {
			if(nt === this.kit[key].symbol) {
				this[key].note();
				break;
			}
		}*/
	},
};