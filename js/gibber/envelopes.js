// audioLib.ADSREnvelope.prototype.states[1] = function(){ // Timed Decay
// 	var delayAmt = (1 - this.sustain) / ( (Gibber.sampleRate / 1000) * this.decay);
// 	this.value -= delayAmt;
// 	if(this.value <= this.sustain) {
// 		if(this.sustainTime === 0) {
// 			this.state = 2;
// 		}else{
// 			this.state= 4;
// 		}
// 	}
//  	//this.value = Math.max(this.sustain, this.value - 1000 / this.sampleRate / this.release);
// }; 

// list of values / durations passed as arguments

function ADSR() {
	that = Env2(arguments);
	// start value = 0, 
	// attackTime, 
	// attack level = 1,
	// decay time,
	// sustain level = .5,
	// release time,
	// release level = 0
	return that;
}

function Step(steps, time) {
	that = Gibberish.Step(steps, time);
	return that;
}

function Env2() {
	that = {
		value : 0,
		position : 0,
		values : [],
		durations : [],
		shouldLoop : false,
		phase : 0,
		active : true,
		increment : 0,
		modded : [],
		endFunction : null,
		mix: 1,
		end : function(func) { 
			if(typeof func === "function") this.endFunction = func; 
			return this;
		},
		
		generate : function() {
			if(this.active) {
				this.phase++;
				if(this.phase >= this.durations[this.position]) {
					this.phase = 0;
					this.position++;
					if(this.position >= this.durations.length) {
						// TODO: INTERESTING. Because this.active is set to false during one cycle, the value
						// is not restored in the audio callback. Oddly enough, this creates the expected behavior.
						this.active= false;
						this.position = 0;
						//G.log("NOT ACTIVE");
						if(this.endFunction != null) {
							this.endFunction();
						}
					}
					this.increment = (this.values[this.position] - this.value) / this.durations[this.position];
				}
				this.value += this.increment;
			}
		},
		
		trigger : function() {
			var start = (arguments.length % 2 === 0) ? 0 : 1;
			if(start) that.value = arguments[0];
			this.phase = 0;
			this.position = 0;
		},
		
		advance : function() {
			this.phase = 0;
			this.position++;
			
			this.increment = (this.values[this.position] - this.value) / this.durations[this.position];
		},
	};
	
	var start = (arguments.length % 2 === 0) ? 0 : 1;
	if(start) that.value = arguments[0];
	
	for(i = start; i < arguments.length - 1; i+=2) {
		that.values.push(arguments[i]);
		that.durations.push(arguments[i + 1]);		
	}

	that.increment = (that.values[that.position] - that.value) / that.durations[that.position];

	function bpmCallback() {
		return function(percentageChangeForBPM) {
			for(var i = 0; i < this.durations.length; i++) {
				this.durations[i] *= percentageChangeForBPM;
			}
		}
	}
	
	Gibber.registerObserver("bpm", bpmCallback());
	
	Gibber.addModsAndFX.call(that);	
	
	// define after addModsAndFX since it overrides the out function assigned by it
	that.out = function() {
		this.generate();
		return this.value;
	};
	
	return that;
}

function Env(attack, decay, sustain, release, sustainTime, releaseTime) {
	if(arguments.length > 1) {
		if(typeof attack === "undefined") 	attack 		= 10;
		if(typeof decay  === "undefined") 	decay  		= 250;
		if(typeof sustain === "undefined") 	sustain 	= 0;	// sustain is a amplitude value, not time\
	}else{
		if(typeof attack === "undefined") 	sustain 	= 0;
		if(typeof decay  === "undefined") 	attack  	= 10;
		if(typeof sustain === "undefined") 	decay 		= 250;
	}
	
	if(typeof release  === "undefined") release  		= 50;
	if(typeof releaseTime  === "undefined") releaseTime = null;		
	if(typeof sustainTime  === "undefined") sustainTime = 0;
	
	var that = audioLib.ADSREnvelope(Gibber.sampleRate, attack, decay, sustain, release, sustainTime, releaseTime);
	that.name = "Env";
	that.type = "mod";
	
	that.looping = false;
	that._releaseTime = releaseTime;
	that._sustainTime = sustainTime;
	
	that.loop = function(shouldLoop) {
		if(typeof shouldLoop === "undefined") shouldLoop = true; // since default for Env is false...
		
		if(!shouldLoop) {
			this._releaseTime = releaseTime;
			this._sustainTime = sustainTime;
			this.releaseTime = null;
			this.sustainTime = null;
		}else{
			this.releaseTime = this._releaseTime;
			this.releaseTime = this._releaseTime;			
		}
	}
	that.name = "Env";
	
	that.modded = [];
	that.mods = [];
	that.automations = [];
			
	that.mix = this.mix || 1;
	Gibber.addModsAndFX.call(that);	
	
	return that;				
}
