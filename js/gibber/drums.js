/* 	
Charlie Roberts 2012 MIT License

Requires gibber.js and audioLib.js.

x = kick
o = snare
* = closed hat

Usage: d = Drums("x*o*xx.*");
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
	
	this.sequenceInit =false;
	this.initialized = false;
	
	Gibber.addModsAndFX.call(this);
	Gibber.generators.push(this);
	
	// this.send = function(busName, amount) {
	// 	console.log("CALLING SEND FROM");
	// 	console.log(this);
	// 	this.sends.push({ 
	// 		bus : Gibber.getBus(busName),
	// 		amount : amount,
	// 	});
	// };
	
	
	if(typeof _sequence != "undefined") {
		this.seq = Seq(_sequence, _timeValue, this);
	}
	
	(function(obj) {
		var that = obj;
		var speed = that.speed;

	    Object.defineProperties(that, {
			"speed" : {
		        get: function() {
		            return speed;
		        },
		        set: function(value) {
		            speed = value;
					if(this.seq != null) {
						this.seq.speed = speed;
					}
		        }
			},
	    });
	})(this);
}

Drums.prototype = {
	sampleRate : Gibber.sampleRate,
	type  : "gen",
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
	
	reset : function(num)  { 
		if(isNaN(num)) {
			this.seq.reset();
		}else{
			this.seq.reset(num); 
		}
	},
	
	retain : function(num) { 
		if(isNaN(num)) {
			this.seq.retain();
		}else{
			this.seq.retain(num); 
		}
	},
	
	shuffle : function() { this.seq.shuffle(); },
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
