// GIBBER
// by Charlie Roberts
// 2011
// MIT License
// special thanks to audioLib.js

var Gibber = {
	active : true,
	
	init : function() {
		this.dev = Sink(audioProcess, 2),
		this.sampleRate = this.dev.sampleRate;		
	},
	
	clear : function() {
		this.generators.length = 0;
	},
	
	stop : function() {
		this.active = false;
	},
	start : function() {
		this.active = true;
	},
	
	generators : [],
	pop : function() { this.generators.pop(); },
	
	shapes : {
		triangle : 'triangle',
		sine : 'sine',
		square : 'square',
		saw : 'sawtooth',
	},
	
	runScript : function(script) {
		eval(script);
	},
	
	chain : function(_effect) {
		for(var i = 0; i < arguments.length; i++) {
			this.fx.push(arguments[i]);
		}
		
		return this;
	},
	
	clearFX : function() {
		this.fx.length = 0;
		
		return this;
	},
	
	removeFX : function(_id) {
		if(typeof _id === "Number") {
			this.fx.splice(_id, 1);
		}else{
			for(var i = 0; i < this.fx.length; i++) {
				var effect = this.fx[i];
				if(effect.name == _id) {
					this.fx.splice(i, 1);
				}
			}
		}
		return this;
	},
	
	removeMod : function(_id) {
		if(typeof _id === "Number") {
			this.mod.splice(_id, 1);
		}else{
			for(var i = 0; i < this.mods.length; i++) {
				var mod = this.mods[i];
				if(mod.name == _id) {
					this.mods.splice(i, 1);
				}
			}
		}
		return this;
	},
	
	mod : function(_name, _source, _type) {
		var name = (typeof Gibber.shorthands[_name] !== "undefined") ? Gibber.shorthands[_name] : _name;
		var type = (typeof _type !== "undefined") ? Gibber.automationModes[_type] : 'addition';
		
		this.mods.push( {type:name, gen:_source, name:_name, sourceName:_source.name} );
		this.automations.push(this.addAutomation(name, _source, 1, type));

		return this;
	},
	
	clearMods : function() {
		for(var i = 0; i < this.mods.length; i++) {
			this.mods[i].gen.reset();
			this.automations[i].amount = 0;
		}
		this.mods.length = 0;
		this.automations.length = 0;
		
		return this;
	},
	
	trig : function (onOff) {
		if(typeof onOff === "undefined") onOff = true;
		
		for(var i = 0; i < this.mods.length; i++) {
			var mod = this.mods[i];
			if(mod.sourceName == "Env") {
				mod.gen.triggerGate(onOff);
			}
		}
	},
};

Gibber.gens = Gibber.generators;

// audioLib additions
audioLib.BufferEffect.prototype.mod = Gibber.mod;

audioLib.BufferEffect.prototype.clearMods = Gibber.clearMods;

audioLib.Automation.modes.absoluteAddition = function(fx, param, value){
	fx.setParam(param, fx[param] + Math.abs(value));
};

Master = {
	mod: Gibber.mod,
	chain: 	 	Gibber.chain,
	clearFX: 	Gibber.clearFX,
	clearMods: 	Gibber.clearMods,
	removeFX: 	Gibber.removeFX,
	removeMod: 	Gibber.removeMod,
	mods : [],
	fx : [],
	automations : [],
};

function audioProcess(buffer, channelCount){
	var i, channel, val;
	
	if( Gibber.active ) {
		for(var g = 0; g < Gibber.generators.length; g++) {
			var gen = Gibber.generators[g];
			if(gen.active) {
				// run controls
				for(var m = 0; m < gen.mods.length; m++) {
					var mod = gen.mods[m];
					mod.gen.generateBuffer(buffer.length / channelCount);
				}
				
				// run oscillator
				gen.generateBuffer(buffer.length, channelCount);
				
				// run fx
				for(var e = 0; e < gen.fx.length; e++) {
					var effect = gen.fx[e];
					for(var f = 0; f < effect.mods.length; f++) {
						var mod = effect.mods[f];
						mod.gen.generateBuffer(buffer.length / channelCount);
					}
					
					effect.append(gen.generatedBuffer);
				}
				
				for(var i = 0; i < buffer.length; i++) {
					buffer[i] += gen.generatedBuffer[i];
				}
			}
		}
		// Master output
		for(var e = 0; e < Master.fx.length; e++) {
			var effect = Master.fx[e];
			for(var f = 0; f < effect.mods.length; f++) {
				var mod = effect.mods[f];
				mod.gen.generateBuffer(buffer.length / channelCount);
			}
					
			effect.append(buffer);
		}
		
	}
};

Gibber.automationModes = {
	"+" : "addition",
	"++": "absoluteAddition",
	"=" : "assignment",
	"*" : "modulation",
};

Gibber.shorthands = {
	"freq": "frequency", 
	"amp": "mix",
};

function Osc(args, isAudioGenerator) {
	var _freq = (typeof args[0] !== "undefined") ? args[0] : 440;
	
	var that = new audioLib.Oscillator(Gibber.sampleRate, _freq);
		
	that.mix = (typeof args[1] !== "undefined") ? args[1] : .25;

	that.active = true;
		
	that.value = 0;
	
	that.mods = [];
	that.fx = [];
	that.automations = [];
	
	that.mod 	= Gibber.mod;
	that.chain  = Gibber.chain;
	that.clearFX   = Gibber.clearFX;
	that.clearMods = Gibber.clearMods;
	that.removeFX  = Gibber.removeFX;
	that.removeMod = Gibber.removeMod;
	that.trig 	   = Gibber.trig;

	that.stop = function() {
		this.active = false;
	};
	
	that.start = function() {
		this.active = true;
	};
	
	if(typeof isAudioGenerator === "undefined" || isAudioGenerator) {
		Gibber.generators.push(that);
	}
	
	return that;
}

function Reverb(roomSize, damping, wet, dry) {
	roomSize 	= roomSize || .8;
	damping 	= damping || .3;
	wet 		= wet || .75;
	dry 		= dry || .5;
	
	var that = audioLib.Reverb.createBufferBased(2, Gibber.sampleRate);
	that.name = "Reverb";
	
	that.mods = [];
	that.automations = [];
	
	if(typeof roomSize === "Object") {
		that.effects[1].roomSize = roomSize[0];
		that.effects[0].roomSize = roomSize[1];
	}else{
		that.setParam("roomSize", roomSize);
	}
	
	if(typeof damping === "Object") {
		that.effects[1].damping = damping[0];
		that.effects[0].damping = damping[1];
	}else{
		that.setParam("damping", damping);
	}
	
	if(typeof wet === "Object") {
		that.effects[1].wet = wet[0];
		that.effects[0].wet = wet[1];
	}else{
		that.setParam("wet", wet);
	}
	
	if(typeof dry === "Object") {
		that.effects[1].dry = dry[0];
		that.effects[0].dry = dry[1];
	}else{
		that.setParam("dry", dry);
	}
	
	return that;
}

function Delay(time, feedback, mix) {
	var that = audioLib.Delay.createBufferBased(2, Gibber.sampleRate);
	that.name = "Delay";
	
	that.mods = [];
	that.automations = [];
	
	time = time || 500;
	feedback = feedback || .3;
	mix = mix || .3;
	
	if(typeof feedback === "Object") {
		that.effects[1].feedback = feedback[0];
		that.effects[0].feedback = feedback[1];
	}else{
		that.setParam("feedback", feedback);
	}
	
	if(typeof time === "Object") {
		that.effects[1].time = time[0];
		that.effects[0].time = time[1];
	}else{
		that.setParam("time", time);
	}
	
	that.mix = mix || .3;
	
	return that;	
};

function LP(cutoff, resonance, mix) {
	var that = audioLib.LP12Filter.createBufferBased(2, Gibber.sampleRate);
	that.name = "LP";
	
	that.mods = [];
	that.automations = [];
	that.trig = Gibber.trig;	
	
	if(typeof cutoff === "Object") {
		that.effects[1].cutoff = cutoff[0];
		that.effects[0].cutoff = cutoff[1];
	}else{
		that.setParam("cutoff", cutoff);
	}
	
	if(typeof time === "Object") {
		that.effects[1].resonance = resonance[0];
		that.effects[0].resonance = resonance[1];
	}else{
		that.setParam("resonance", resonance);
	}
	
	that.mix = mix || .3;
	
	return that;
}

function Trunc(bits, mix) {
    var that = audioLib.BitCrusher.createBufferBased(2, Gibber.sampleRate);
	that.name = "Trunc";
	
	that.mods = [];
	that.automations = [];
	
	if(typeof bits === "Object") {
		that.effects[1].resolution = Math.pow(2, bits[0]-1);
		that.effects[0].resolution = Math.pow(2, bits[1]-1);
	}else{
		that.setParam("resolution", Math.pow(2, bits-1));
	}
	
	that.mix = mix || 1;
	
	return that;
}

function Chorus(delay, depth, freq, mix) {
    var that = audioLib.Chorus.createBufferBased(2, Gibber.sampleRate);
	that.name = "Chorus";
	
	that.mods = [];
	that.automations = [];
	
	delay = delay || 10;
	depth = depth || .2;
	freq  = freq  || 5;
	
	if(typeof delay === "Object") {
		that.effects[0].delay = delay[0];
		that.effects[1].delay = delay[1];
	}else if(typeof delay !== "undefined"){
		that.setParam("delay", delay);
	}
	
	if(typeof depth === "Object") {
		that.effects[0].depth = depth[0];
		that.effects[1].depth = depth[1];
	}else if(typeof depth !== "undefined"){
		that.setParam("depth", depth);
	}
	
	if(typeof freq === "Object") {
		that.effects[0].freq = freq[0];
		that.effects[1].freq = freq[1];
	}else if(typeof freq !== "undefined"){
		that.setParam("freq", freq);
	}
	
	that.mix = mix || 1;
	
	return that;
}

function Dist(gain, master) {
    var that = audioLib.Distortion.createBufferBased(2, Gibber.sampleRate);
	that.name = "Dist";
	
	that.mods = [];
	that.automations = [];
	
	if(typeof gain === "undefined") 	gain 	= 10;
	if(typeof master === "undefined") 	master  = 4;
	
	if(typeof gain === "Object") {
		that.effects[1].gain = gain[0];
		that.effects[0].gain = gain[1];
	}else{
		that.setParam("gain", gain);
	}
	
	if(typeof master === "Object") {
		that.effects[1].master = master[0];
		that.effects[0].master = master[1];
	}else{
		that.setParam("master", master);
	}
	
	
	//that.master = mix || 1;
	
	return that;
}


function LFO(freq, amount, shape, type) {
	var that = Osc(arguments, false);
	that.mix = amount;
	that.waveShape = (typeof shape === "String") ? shape : 'sine';
	return that;
};

function Sine(freq, volume) {	
	var that = Osc(arguments);
	that.waveShape = 'sine';
	
	return that;
}

function Tri(freq, volume) {	
	var that = Osc(arguments);
	that.waveShape = 'triangle';
	
	return that;
}

function Pulse(freq, volume) {	
	var that = Osc(arguments);
	that.waveShape = 'pulse';
	
	return that;
}

function Saw(freq, volume) {	
	var that = Osc(arguments);
	that.waveShape = 'sawtooth';
	
	return that;
}

function InvSaw(freq, volume) {	
	var that = Osc(arguments);
	that.waveShape = 'invSawtooth';
	
	return that;
}

function Square(freq, volume) {	
	var that = Osc(arguments);
	that.waveShape = 'square';
	
	return that;
}

function assign(param, name) {
	if(typeof param === "Object") {
		this.effects[1][name] = param[0];
		this.effects[0][name] = param[1];
	}else{
		this.setParam(name, param);
	}
}

// extend audioLib to close envelop at end of release time
audioLib.ADSREnvelope.prototype.isDead = true;
audioLib.ADSREnvelope.prototype.generate = function(){
	if(!this.isDead) {
		this.states[this.state].call(this);
	}
	return this.value;
};

audioLib.ADSREnvelope.prototype.states[4] = function(){ // Timed release
	this.value = Math.max(0, this.value - 1000 / this.sampleRate / this.release);

	if (this._st++ >= this.sampleRate * 0.001 * this.releaseTime){
		console.log(this);
		this._st	= 0;
		this.state	= 0;
		this.gate = false;
		this.isDead = true;
		this.value = 0;
	}
}

audioLib.ADSREnvelope.prototype.triggerGate = function(isOpen){
	isOpen		= typeof isOpen === 'undefined' ? !this.gate : isOpen;
	this.gate	= isOpen;
	this.state	= isOpen ? 0 : this.releaseTime === null ? 3 : 5;
	this._st	= 0;
	if(isOpen) this.isDead = false;
};

function Env(attack, decay, sustain, release, sustainTime, releaseTime) {
	if(arguments.length > 1) {
		if(typeof attack === "undefined") 	attack 		= 100;
		if(typeof decay  === "undefined") 	decay  		= 50;
		if(typeof sustain === "undefined") 	sustain 	= .25;	// sustain is a amplitude value, not time\
	}else{
		if(typeof attack === "undefined") 	sustain 	= .25;
		if(typeof decay  === "undefined") 	attack  	= 100;
		if(typeof sustain === "undefined") 	decay 		= 50;	// sustain is a amplitude value, not time
	}
	
	if(typeof release  === "undefined") release  		= 50;
	if(typeof releaseTime  === "undefined") releaseTime = 50;		
	if(typeof sustainTime  === "undefined") sustainTime = 50;
	
	var that = audioLib.ADSREnvelope(Gibber.sampleRate, attack, decay, sustain, release, sustainTime, releaseTime);
	
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
	
	that.mods = [];
	that.automations = [];
			
	that.mix = this.mix || 1;
	
	return that;				
}

function Sched(_func, _time, _repeats) {
	var that = {
		func : _func,
		time : _time,
		repeats: _repeats,
	};
	
	function _callback() {
		return function() {
			if(that.repeats) {
				that.func();
			}else{
				that.func();
				that.stop();
			}
		}
	}
	that.stop = Sink.doInterval(_callback(), 500);

	return that;
}

function Step(stepTime, steps) {
	var that = new audioLib.StepSequencer(Gibber.sampleRate, stepTime, steps, 0.0);
	return that;
}
var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z;

audioLib.StepSequencer.prototype.out = function() {
	this.generate();
	return this.getMix();
}
