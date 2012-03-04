/* 	
Charlie Roberts 2012 MIT License

Requires gibber.js and audioLib.js.

x = kick
o = snare
* = closed hat

Usage: d = Drums("x*o*xx.*");

TODO : ADD REPLACE METHOD
TODO : ADD REPLACE METHOD
TODO : ADD REPLACE METHOD
TODO : ADD REPLACE METHOD

*/
(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){	
	
// TODO: This should use a Seq object as prototype if possible.
function Drums (_sequence, _timeValue, _mix, _freq){
	this.kick  = new audioLib.Sampler(Gibber.sampleRate);
	this.snare = new audioLib.Sampler(Gibber.sampleRate);		
	this.hat   = new audioLib.Sampler(Gibber.sampleRate);
	this.mix   = isNaN(_mix) ? 0.175 : _mix;
	this.frequency = isNaN(_freq) ? 440 : _freq;
	
	this.value = 0;
	this.active = true;
	this.mods = [];
	this.fx = [];
	this.sends = [];
	this.masters = [];
	
	this.sequenceInit =false;
	this.initialized = false;
	this.seq = null;
	
	Gibber.addModsAndFX.call(this);
	Gibber.generators.push(this);	
	
	if(typeof _sequence != "undefined") {
		this.seq = Seq(_sequence, _timeValue).slave(this);
	}
	
	var that = this; // closure so that d.shuffle can be sequenced
	this.shuffle = function() { that.seq.shuffle(); };
	
	this.reset = function(num)  { 
		if(isNaN(num)) {
			that.seq.reset();
		}else{
			that.seq.reset(num); 
		}
	};
	
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
	    });
	})(that);
}

Drums.prototype = {
	sampleRate : Gibber.sampleRate,
	type  : "complex",
	name  : "Drums",
		
	load : function (){
		// SAMPLES ARE PRELOADED IN GIBBER CLASS... but it still doesn't stop the hitch when loading these...
		this.kick.loadWav(Gibber.samples.kick);
		this.snare.loadWav(Gibber.samples.snare);
		this.hat.loadWav(Gibber.samples.snare); // TODO: CHANGE TO HIHAT SAMPLE
			
		this.initialized = true;
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
		
	getMix : function() { return this.value; },
	
	once : function() {
		this.seq.once();
		return this;
	},
	
	replace : function(replacement){
		Gibber.genRemove(this);
		Gibber.controls.remove(this.seq);
		
		for(var i = 0; i < this.masters.length; i++) {
			var master = this.masters[i];
			for(var j = 0; j < master.slaves.length; j++) {
				if(master.slaves[j] == this) {
					master.slave(replacement);
					master.slaves.splice(j,1);
				}
			}
		}
	},
	
	retain : function(num) { 
		if(isNaN(num)) {
			this.seq.retain();
		}else{
			this.seq.retain(num); 
		}
	},
	set : function(newSequence) { this.seq.set(newSequence); },
	
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

Drums.prototype.__proto__ = new audioLib.GeneratorClass();

audioLib.generators('Drums', Drums);

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
	var d = new audioLib.Drums(_sequence, _timeValue, _mix, _freq);
	d.load();
	return d;
}
