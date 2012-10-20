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

function Drums(_sequence, _timeValue, _amp, _freq) {
	return new _Drums(_sequence, _timeValue, _amp, _freq);
}

Drums.kits = {
	default: {
		kick:{ file:"audiofiles/kick.wav", 		symbol:'x', amp:1, pitch:1, pan:0 	},
		snare:{ file:"audiofiles/snare.wav", 	symbol:'o', amp:1, pitch:1, pan:.15 },
		hat:{ file:"audiofiles/hat.wav", 		symbol:'*', amp:1, pitch:1, pan:-.1 },
		openHat:{ file:"audiofiles/openHat.wav",symbol:'-', amp:1, pitch:1, pan:-.2 },
	},
	original: {
		kick:{ file:"audiofiles/kick.wav", 		symbol:'x', amp:1, pitch:1, pan:0 	},
		snare:{ file:"audiofiles/snare.wav", 	symbol:'o', amp:1, pitch:1, pan:.15 },
		hat:{ file:"audiofiles/hat.wav", 		symbol:'*', amp:1, pitch:1, pan:-.1 },
		openHat:{ file:"audiofiles/openHat.wav",symbol:'-', amp:1, pitch:1, pan:-.2 },
	},
	electronic: {
		kick:{ file:"audiofiles/electronic/kick.wav", symbol:'x', amp:1, pitch:1, pan:0 },
		snare:{ file:"audiofiles/electronic/snare.wav", symbol:'o', amp:1, pitch:1, pan:.15 },
		hat:{ file:"audiofiles/electronic/hat.wav", symbol:'*', amp:1, pitch:1, pan:-.1 },
		openHat:{ file:"audiofiles/electronic/openhat.wav", symbol:'-', amp:1, pitch:1, pan:-.2 },
	},
	beatbox: {

    in_tss: {file:'audiofiles/beatbox/^tss.wav' , symbol:'T', amp:1, pitch:1, pan: 0.1},
    f:      {file:'audiofiles/beatbox/f.wav'    , symbol:'f', amp:1, pitch:1, pan:-0.1},
    h:      {file:'audiofiles/beatbox/h.wav'    , symbol:'h', amp:1, pitch:1, pan: 0.1},
    s:      {file:'audiofiles/beatbox/s.wav'    , symbol:'s', amp:1, pitch:1, pan:-0.1},

    d:      {file:'audiofiles/beatbox/d.wav'    , symbol:'d', amp:1, pitch:1, pan: 0.8},
    t:      {file:'audiofiles/beatbox/t.wav'    , symbol:'t', amp:1, pitch:1, pan: 0.4},
    k:      {file:'audiofiles/beatbox/k.wav'    , symbol:'k', amp:1, pitch:1, pan:-0.1},
    in_k:   {file:'audiofiles/beatbox/^k.wav'   , symbol:'K', amp:1, pitch:1, pan:-0.4},
    eight:  {file:'audiofiles/beatbox/8.wav'    , symbol:'8', amp:1, pitch:1, pan:-0.8},

    psh:    {file:'audiofiles/beatbox/psh.wav'  , symbol:'p', amp:1, pitch:1, pan: 0.1},
    in_p:   {file:'audiofiles/beatbox/^p.wav'   , symbol:'P', amp:1, pitch:1, pan:-0.1},
    pf:     {file:'audiofiles/beatbox/pf.wav'   , symbol:'F', amp:1, pitch:1, pan: 0.2},
    phs:    {file:'audiofiles/beatbox/phs.wav'  , symbol:'H', amp:1, pitch:1, pan:-0.2},

    b:      {file:'audiofiles/beatbox/b.wav'    , symbol:'b', amp:1, pitch:1, pan: 0.3},
    dot:    {file:'audiofiles/beatbox/dot.wav'  , symbol:'.', amp:1, pitch:1, pan: 0.0},
    duf:    {file:'audiofiles/beatbox/duf.wav'  , symbol:'D', amp:1, pitch:1, pan:-0.3},

    o:      {file:'audiofiles/beatbox/o.wav'    , symbol:'o', amp:1, pitch:1, pan: 0.6},
    a:      {file:'audiofiles/beatbox/a.wav'    , symbol:'a', amp:1, pitch:1, pan: 0.8},
    u:      {file:'audiofiles/beatbox/u.wav'    , symbol:'u', amp:1, pitch:1, pan:-0.8},

    m:      {file:'audiofiles/beatbox/m.wav'    , symbol:'m', amp:1, pitch:1, pan:-0.6},
    n:      {file:'audiofiles/beatbox/n.wav'    , symbol:'n', amp:1, pitch:1, pan: 0.0},
	},
};

function _Drums (_sequence, _timeValue, _amp, _freq){
	Gibberish.extend(this, Gibberish.Bus());
	
	var _fx = typeof arguments[0] !== "undefined" ? arguments[0].fx : undefined;
	
	this.channels = 2;
	this.fx = [];
	this.fx.parent = this;
	
	this.children = [];
	
/**###Drums.pitch : property
Float. The overall pitch of the Drums. Each specific drum can also have its pitch set.
**/	
	this.pitch = 1;
	this.kit = Drums.kits['default'];
	if(typeof arguments[0] === "object") {
		if(arguments[0].kit) {
			this.kit = Drums.kits[arguments[0].kit];
			arguments[0].kit = this.kit;
		}
	}
	
	for(var key in this.kit) {
		var drum = this.kit[key];
		this[key] = { sampler: Gibberish.Sampler(drum.file), pitch:drum.pitch, amp:drum.amp };
		this[key].sampler.channels = 2;
		this[key].sampler.pan = drum.pan;
		this[key].sampler.send(this, 1);
		this[key].fx = this[key].sampler.fx;
		this.children.push( this[key].sampler );
		//Gibberish.extend(this.snare.sampler, props.snare); Gibberish.extend(this.snare, props.snare);
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

	var props = Gibber.applyPreset("Drums", arguments);
	console.log(props);
	//Gibberish.extend(this, props);
	//console.log(this.pitch);
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
	
	if(typeof props.snare !== "undefined") 	{ Gibberish.extend(this.snare.sampler, props.snare); Gibberish.extend(this.snare, props.snare); }
	if(typeof props.kick !== "undefined") 	{ Gibberish.extend(this.kick.sampler, props.kick); Gibberish.extend(this.kick, props.kick); }
	if(typeof props.hat !== "undefined") 	{ Gibberish.extend(this.hat.sampler, props.hat); Gibberish.extend(this.hat, props.hat); }
	if(typeof props.openHat !== "undefined") { Gibberish.extend(this.openHat.sampler, props.openHat); Gibberish.extend(this.openHat, props.openHat); }
 
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

Gibber.presets.Drums = {
	kickSnare: {
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
};

_Drums.prototype = {
	category  	: "complex",
	name  		: "Drums",
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
		for(var key in this.kit) {
			if(nt === this.kit[key].symbol) {
				this[key].sampler.note(this.pitch * this[key].pitch, this[key].amp);
				break;
			}
		}
	},
};
