// GIBBER
// by Charlie Roberts
// 2011
// MIT License
// special thanks to audioLib.js

Array.prototype.remove = function(v) {
    return $.grep(this, function(e) {
        return e !== v;
    });
};

var Gibber = {
	active : true,
	bpm : 120,
	audioInit : false,
	_gens : {
		test : "blah",
	},
	
	init : function() {
		this.dev = Sink(audioProcess, 2);
		this.sampleRate = this.dev.sampleRate;		
		this.beat = (60000 / this.bpm) * (this.sampleRate / 1000);
		this.measure = this.beat * 4;
		
		for(var i = 0; i <= 32; i++) {
			window["_"+i] = this.measure / i;
		}
		
		this.samples = { // preload
			kick 	: atob(samples.kick),
		    snare 	: atob(samples.snare),
		    //hat 	: atob(samples.snare), 
		}
		this.callback = new audioLib.Callback();

		var letters = "abcdefghijklmnopqrstuvwxyz";
		for(var l = 0; l < letters.length; l++) {
			var lt = letters.charAt(l);
			(function() {
				var ltr = lt;
				Object.defineProperty(window, ltr, {
					get:function() { return window["____"+ltr];},
					set:function(newObj) {
						 if(typeof window["____"+ltr] !== "undefined") {
							 var variable = window["____"+ltr];
							 switch(variable.type) {
								 case "gen":
									 Gibber.genRemove(variable);
								 break;
								 case "mod":
									 Gibber.modRemove(variable, newObj);
								 break;
								 case "fx":
									 Gibber.fxRemove(variable, newObj);
								 break;
								 case "complex":
									 variable.replace(val);
								 break;
								 default: break;
							 }
						 }
					 	 window["____"+ltr] = val;
					},
				})
			})();
		}
	},
	
	observers : {
		"bpm": [],
	},
	
	genRemove : function(gen) {
		// easiest case, loop through all generators and replace the match. also delete mods and fx arrays
		// so that javascript can garbage collect that stuff. Should it add the fx / mods of previous osc?
		var idx = jQuery.inArray( gen, Gibber.generators);
		if(idx > -1) {
			Gibber.generators.splice(idx,1);
			gen.mods.length = 0;
			gen.fx.length = 0;
		}
	},
	
	modRemove : function(oldMod, newMod) {
	// loop through ugens / fx that the mods influence and replace with new value
	// also push ugens that are modded into the mods "modded" array for future reference
		var modToReplace = oldMod;
		for(var i = 0; i < modToReplace.modded.length; i++) {
			var moddedGen = modToReplace.modded[i];
			for(var j = 0; j < moddedGen.mods.length; j++) {
				var modCheck = moddedGen.mods[j].gen;
				if(modCheck == modToReplace) {
					if(newMod.type == "mod") {
						moddedGen.mods[j].gen =  newMod;
					}
					newMod.modded.push(moddedGen);
				}
			}
		}
	},
	
	fxRemove : function(oldFx, newFx) {
	// loop through gens affected by effect (for now, this should almost always be 1)
	// replace with new effect and add the gen to the gens array of the new effect
		var fxToReplace = oldFX;
		for(var i = 0; i < fxToReplace.gens.length; i++) {
			var fxgen = fxToReplace.gens[i];
			var idx = jQuery.inArray( fxToReplace, fxgen.fx );
			if(idx > -1) {
				fxgen.fx.splice(idx,1,newFX);
				newFX.gens.push(fxgen);
			}
		}
	},
	
	registerObserver : function(name, fn) {
		//console.log("Registering");
		this.observers[name].push(fn);
	},
	
	setBPM : function(_bpm) {
		var oldbpm = this.bpm;
		this.bpm = _bpm;
		this.beat = 60000 / this.bpm * (this.sampleRate / 1000);
		this.measure = this.beat * 4;
		
		for(var j = 0; j <= 32; j++) {
			window["_"+j] = this.measure / j;
		}
		
		var bpmObservers = this.observers.bpm;

		var percentChange = oldbpm / this.bpm;
		for(var i = 0; i < bpmObservers.length; i++) {
			var fcn = bpmObservers[i]; // all observers are callback functions to be called
			fcn(percentChange);
		}
	},
	
	clear : function() {
		this.generators.length = 0;
		this.callback.phase = 0;
		Master.fx.length = 0;
		Master.mods.length = 0;	
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
		//(function(_s) { console.log(this); eval(s); console.log(this); }).call(Gibber._gens, script);
	},
	
	automationModes : {
		"+" : "addition",
		"++": "absoluteAddition",
		"=" : "assignment",
		"*" : "modulation",
	},
	
	shorthands : {
		"freq": "frequency", 
		"amp": "mix",
	},
		
	modsAndEffects : {
		out : function() {
			this.generate();
			return this.getMix() * this.mix;
		},
		
		fxout : function(samp) {
			this.pushSample(samp,0);
			return (samp * (1 - this.mix)) + (this.mix * this.getMix(0));
		},
		
		chain : function(_effect) {
			for(var i = 0; i < arguments.length; i++) {
				var fx = arguments[i];
				this.fx.push(fx);
				fx.gens.push(this);	
			}
			return this;
		},
	
		removeFX : function(_id) {
			if(typeof _id === "undefined") {
				this.fx.length = 0;
			}else if(typeof _id === "number") {
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
			if(typeof _id === "undefined") {
				this.clearMods();
			}else if(typeof _id === "number") {
				this.mods[_id].gen.reset();
				this.automations[_id].amount = 0;
				this.mods.splice(_id, 1);
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
		
			this.mods.push( {param:name, gen:_source, name:_name, sourceName:_source.name, type:type} );
			this.automations.push(this.addAutomation(name, _source, 1, type));
			
			_source.modded.push(this);

			this[name + "_"] = 0;
			
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
	},
};

Gibber.addModsAndFX = function() {
    for ( var prop in Gibber.modsAndEffects) { this[prop] = Gibber.modsAndEffects[prop]; }	
};

Gibber.gens = Gibber.generators;
window.G = Gibber;

// audioLib additions
audioLib.Automation.modes.absoluteAddition = function(fx, param, value){
	fx.setParam(param, fx[param] + Math.abs(value));
};

Master = {
	mods : [],
	fx : [],
	automations : [],
};
Gibber.addModsAndFX.call(Master);

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
					if(i % 2 === 1 && g == 0) Gibber.callback.generate(); // not double buffered!!!
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

function Osc(args, isAudioGenerator) {
	var _freq = (typeof args[0] !== "undefined") ? args[0] : 440;
	
	var that = new audioLib.Oscillator(Gibber.sampleRate, _freq);
	that.type = "gen";	
	that.mix = (typeof args[1] !== "undefined") ? args[1] : .25;
	that.active = true;		
	that.value = 0;
	
	that.mods = [];
	that.fx = [];
	that.automations = [];

	that.stop = function() {
		this.active = false;
	};
	
	that.start = function() {
		this.active = true;
	};
	
	if(typeof isAudioGenerator === "undefined" || isAudioGenerator) {
		Gibber.audioInit = true;
		Gibber.generators.push(that);
	}
	
	Gibber.addModsAndFX.call(that);
	
	return that;
}

function Reverb(roomSize, damping, wet, dry) {
	roomSize 	= roomSize || .8;
	damping 	= damping || .3;
	wet 		= wet || .75;
	dry 		= dry || .5;
	
	var that = new audioLib.Reverb(Gibber.sampleRate, 1);
	that.name = "Reverb";
	that.type="fx";
	
	that.gens = [];
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
	
	Gibber.addModsAndFX.call(that);
	return that;
}

function Delay(time, feedback, mix) {
	var that = audioLib.Delay(Gibber.sampleRate);
	that.name = "Delay";
	that.type= "fx";
	
	that.gens = [];
	that.mods = [];
	that.automations = [];
	
	time = time || _4;
	time /= Gibber.sampleRate / 1000;
	feedback = feedback || .3;
	mix = isNaN(mix) ? .3 : mix;
	
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
	
	that.mix = mix;
	
	Gibber.addModsAndFX.call(that);
	return that;	
};

function LPF(cutoff, resonance, mix) {
	var that = audioLib.LP12Filter(Gibber.sampleRate);
	that.name = "LP";
	that.type="fx";
	
	that.gens = [];
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
	
	Gibber.addModsAndFX.call(that);
	
	
	return that;
}

function Trunc(bits, mix) {
    var that = audioLib.BitCrusher(Gibber.sampleRate);
	that.name = "Trunc";
	that.type="fx";
	
	that.gens = [];
	that.mods = [];
	that.automations = [];
	
	if(typeof bits === "Object") {
		that.effects[1].resolution = Math.pow(2, bits[0]-1);
		that.effects[0].resolution = Math.pow(2, bits[1]-1);
	}else{
		that.setParam("resolution", Math.pow(2, bits-1));
	}
	
	that.mix = mix || 1;
	
	Gibber.addModsAndFX.call(that);
	return that;
}

function Chorus(delay, depth, freq, mix) {
    var that = audioLib.Chorus(Gibber.sampleRate);
	that.name = "Chorus";
	that.type = "fx";
	
	that.gens = [];
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
	
	Gibber.addModsAndFX.call(that);	
	return that;
}

function Dist(gain, master) {
	
    var that = audioLib.Distortion(Gibber.sampleRate);
	that.name = "Dist";
	that.type = "fx";
	
	that.gens = [];
	that.mods = [];
	that.automations = [];
	
	if(typeof gain === "undefined") 	gain 	= 6;
	if(typeof master === "undefined") 	master  = 1;
	
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
	
	Gibber.addModsAndFX.call(that);	
	return that;
}


function LFO(freq, amount, shape, type) {
	var that = Osc(arguments, false);
	that.name = "LFO";
	that.type = "mod";
	that.mix = amount;
	that.waveShape = (typeof shape === "String") ? shape : 'sine';
	that.modded = [];
	return that;
};

function Sine(freq, volume) {	
	var that = Osc(arguments);
	that.name = "Sine";
	that.waveShape = 'sine';
	
	return that;
}

function Tri(freq, volume) {	
	var that = Osc(arguments);
	that.name = "Tri";
	that.waveShape = 'triangle';
	
	return that;
}

function Pulse(freq, volume) {	
	var that = Osc(arguments);
	that.name = "Square";
	that.waveShape = 'pulse';
	
	return that;
}

function Saw(freq, volume) {	
	var that = Osc(arguments);
	that.name = "Saw";	
	that.waveShape = 'sawtooth';
	
	return that;
}

function InvSaw(freq, volume) {	
	var that = Osc(arguments);
	that.name = "InvSquare";	
	that.waveShape = 'invSawtooth';
	
	return that;
}

function Square(freq, volume) {	
	var that = Osc(arguments);
	that.name = "Square";
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

// extend audioLib to close envelop at end of release time using isDead property.
// isDead is different from gate... once gate is closed the release section of the env
// begins. When isDead is true the state of the envelope does not advance

audioLib.ADSREnvelope.prototype.isDead = true;
audioLib.ADSREnvelope.prototype.generate = function(){
	if(!this.isDead) {
		this.states[this.state].call(this);
	}
	return this.value;
};

audioLib.ADSREnvelope.prototype.states[4] = function(){ // Timed release state of env
	this.value = Math.max(0, this.value - 1000 / this.sampleRate / this.release);

	if (this._st++ >= this.sampleRate * 0.001 * this.releaseTime){
		//console.log(this);
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
/*
s = Sine(240, .15);
e = Env(100);
s.mod("mix" , e, "*");
e.triggerGate();
*/
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
	
	return that;				
}

function Sched(_func, _time, _repeats) {
	var that = {
		func : _func,
		time : _time,
		repeats: _repeats,
		name : "Sched",
		type : "mod",
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
	that.stop = Sink.doInterval(_callback(), that.time);

	return that;
}

function Chord(_notation, _octave) {
	var chord = [];
	var _chord = ChordFactory.createNotations(_notation, _octave);
	
	for(var i = 0; i < _chord.length; i++) {
		chord[i] = Note.getFrequencyForNotation(_chord[i]);
	}
	
	return chord;
}

// http://snippets.dzone.com/posts/show/849
Array.prototype.shuffle = function() {
		for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
}

function Step(steps, stepTime) {
	steps 	 = steps || [1,0];
	stepTime = stepTime || _4;
	var that = new audioLib.StepSequencer(Gibber.sampleRate, (stepTime / Gibber.sampleRate) * 1000, steps, 0.0);
	
	that.name = "Step";
	that.type = "mod";
	function bpmCallback() {
		return function() {
			that.speed = that.stepTime * Gibber.measure;
			that.stepLength = that.speed;
		}
	}
	
	that.modded =[];
	Gibber.registerObserver("bpm", bpmCallback());
	
	Gibber.addModsAndFX.call(that);	
	return that;
}
//var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z;
