// GIBBER
// by Charlie Roberts
// 2011
// MIT License
// special thanks to audioLib.js

var Gibber = {
	active : true,
	bpm : 120,
	audioInit : false,
	root : "C4",
	mode : "aeolian",
	busses : [],
	modes :[ "major", "ionian", "dorian",  "phrygian", "lydian", "mixolydian", "minor", "aeolian", "locrian", "majorpentatonic", "minorpentatonic", "chromatic"],
	
	initDurations : function() {
		this.dev = Sink(audioProcess, 2);
		this.sampleRate = this.dev.sampleRate;		
		this.beat = (60000 / this.bpm) * (this.sampleRate / 1000);
		this.measure = this.beat * 4;
		
		for(var i = 0; i <= 64; i++) {
			window["_"+i] = this.measure / i;
		}
	},
	
	meta: function(obj) {
		var letters = "abcdefghijklmnopqrstuvwxyz";
		for(var l = 0; l < letters.length; l++) {
			var lt = letters.charAt(l);
			(function() {
				var ltr = lt;
				Object.defineProperty(obj, ltr, {
					get:function() { return obj["____"+ltr];},
					set:function(newObj) {
						if(newObj != null) {	// replace
							var endString = " created";
							 if(typeof obj["____"+ltr] !== "undefined" && obj["____"+ltr] != null) {
								 var variable = obj["____"+ltr];

								 switch(variable.type) {
									 case "gen":
										 Gibber.genReplace(variable, newObj);
									 break;
									 case "mod":
										 Gibber.modReplace(variable, newObj);
									 break;
									 case "fx":
										 Gibber.fxReplace(variable, newObj);
									 break;
									 case "control":
										 //console.log("Replacing Control");
										 Gibber.controlReplace(variable, newObj);
										 break;
									 case "complex":
										//console.log("Replacing " + variable.name);
										variable.replace(newObj); // rely on object prototype to handle removing members
									 break;
									 default: break;
								 }
							 }
							 if(newObj.name != undefined)
							 	G.log(newObj.name + endString);
							 
						 }else{		// kill
							 //console.log("killing");
							 if(typeof obj["____"+ltr] !== "undefined") {
								 var variable = obj["____"+ltr];
								 if(variable != null) {
									 if(variable.kill != undefined) {
										 variable.kill();
									 }
								 }
							 }
						 }
					 	 obj["____"+ltr] = newObj;
					},
				})
			})();
		}
		
		obj.kill = function() {
			for(var n in obj) {
				if(typeof obj[n].kill === "function") {
					obj[n].kill();
				}
			}
		};
	},
	
	killSingles : function(obj) {	// kill all single letter variables
		var letters = "abcdefghijklmnopqrstuvwxyz";
		for(var l = 0; l < letters.length; l++) {
			var ltr = letters.charAt(l);
			window[ltr] = null;
		}
	},
	
	
	init : function() {
		if(typeof Gibber.Environment !== "undefined") { // if we are using with the Gibber editing environment
			this.Environment.init();
		}

		this.samples = { // preload
			kick 	: atob(samples.kick),
		    snare 	: atob(samples.snare),
		    //hat 	: atob(samples.snare), 
		}
		
		this.callback = new audioLib.Callback();
		window.loop = function(cb, time) {
			var l = Gibber.callback.addCallback(cb, time, true);
			l.end = function() {
				Gibber.callback.callbacks = Gibber.callback.callbacks.removeObj(this);
			};
			return l;
		};
		this.meta(window);
	},
	
	observers : {
		"bpm": [],
	},
	
	getBus : function(_bus) {
		if(typeof _bus === "string") {
			for(var i = 0; i < Gibber.busses.length; i++) {
				var bus = Gibber.busses[i];
				if(bus.name == _bus) return bus;
			}
		}else{
			for(var i = 0; i < Gibber.busses.length; i++) {
				var bus = Gibber.busses[i];
				if(bus == _bus) return bus;
			}
		}
	},

	genRemove : function(gen) {
		var idx = jQuery.inArray( gen, Gibber.generators);
		if(idx > -1) {
			Gibber.generators.splice(idx,1);
			gen.mods.length = 0;
			gen.fx.length = 0;
		}
	},
	
	genReplace : function(gen, newGen) {
	// easiest case, loop through all generators and replace the match. also delete mods and fx arrays
	// so that javascript can garbage collect that stuff. Should it add the fx / mods of previous osc to replacement???
	// TODO: YES IT SHOULD ADD THE FX / MODS OF REPLACEMENT
		var idx = jQuery.inArray( gen, Gibber.generators);
		if(idx > -1) {
			Gibber.generators.splice(idx,1);
			gen.mods.length = 0;
			gen.fx.length = 0;
		}
		for(var i = 0; i < gen.masters.length; i++) {
			var master = gen.masters[i];
			for(var j = 0; j < master.slaves.length; j++) {
				if(master.slaves[j] == gen) {
					master.slave(newGen);
					master.slaves.splice(j,1);
				}
			}
		}
	},
	
	modReplace : function(oldMod, newMod) {
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
	
	modRemove : function(oldMod) {
	// loop through ugens / fx that the mods influence and delete
		var modToReplace = oldMod;
		for(var i = 0; i < modToReplace.modded.length; i++) {
			var moddedGen = modToReplace.modded[i];
			for(var j = 0; j < moddedGen.mods.length; j++) {
				var modCheck = moddedGen.mods[j].gen;
				if(modCheck == modToReplace) {
					moddedGen.mods.splice(j,1);
				}
			}
		}
	},
	
	
	fxReplace : function(oldFX, newFX) {
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
	
	fxRemove : function(oldFX) {
	// loop through gens affected by effect (for now, this should almost always be 1)
	// replace with new effect and add the gen to the gens array of the new effect
		var fxToReplace = oldFX;
		for(var i = 0; i < fxToReplace.gens.length; i++) {
			var fxgen = fxToReplace.gens[i];
			var idx = jQuery.inArray( fxToReplace, fxgen.fx );
			if(idx > -1) {
				fxgen.fx.splice(idx,1);
			}
		}
	},
	
	
	controlReplace: function(oldControl, newControl) {
		var controlToReplace = oldControl;

		for(var i = 0; i < controlToReplace.slaves.length; i++) {
			var slave = controlToReplace.slaves[i];
			newControl.slave(slave);
		}
		controlToReplace.slaves.length = 0;
		
		for(var i = 0; i < controlToReplace.mods.length; i++) {
			var mod = controlToReplace.mods[i];
			newControl.mods.push(mod);
		}
		controlToReplace.mods.length = 0;
		
		Gibber.callback.slaves.remove(oldControl);	
	},
	
	controlRemove: function(oldControl) {
		console.log("removing control");
		var controlToReplace = oldControl;

		for(var i = 0; i < controlToReplace.slaves.length; i++) {
			var slave = controlToReplace.slaves[i];
			slave.masters.length = 0;
		}
		controlToReplace.slaves.length = 0;
		
		for(var i = 0; i < controlToReplace.mods.length; i++) {
			var mod = controlToReplace.mods[i];
		}
		controlToReplace.mods.length = 0;
		Gibber.callback.slaves.remove(oldControl);
	},
	
	
	registerObserver : function(name, fn) {
		//console.log("Registering " + fn);
		this.observers[name].push(fn);
	},
	
	
	setBPM : function(_bpm) {
		var oldbpm = this.bpm;
		this.bpm = _bpm;
		this.beat = 60000 / this.bpm * (this.sampleRate / 1000);
		this.measure = this.beat * 4;
		
		for(var j = 0; j <= 64; j++) {
			window["_"+j] = this.measure / j;
		}
		
		var bpmObservers = Gibber.observers.bpm;

		var percentChange = oldbpm / this.bpm;
		for(var i = 0; i < bpmObservers.length; i++) {
			var fnc = bpmObservers[i]; // all observers are callback functions to be called
			fnc(percentChange);
		}
	},
	
	clear : function() {
		for(var g = 0; g < Gibber.generators.length; g++) {
			Gibber.generators[g].kill();
		}
		for(var c = 0; c < Gibber.controls.length; g++) {
			Gibber.controls[c].kill();
		}
		for(var cc = 0; cc < Gibber.callback.slaves.length; cc++) {
			Gibber.callback.slaves[cc].kill();
		}
		Gibber.callback.sequence = [];
		
		Gibber.killSingles();
				
		this.generators.length = 0;
		this.callback.phase = 0;
		this.controls.length = 0;
		this.busses.length = 0;
		this.callback.callbacks.length = 0;
		Master.fx.length = 0;
		Master.mods.length = 0;
		Gibber.log("Cleared Gibber graph.");	
	},
	
	stop : function() {
		this.active = false;
	},
	start : function() {
		this.active = true;
	},
	
	generators : [],
	controls : [],
	pop : function() { this.generators.pop(); },
	
	shapes : {
	    triangle : 'triangle',
		sine : 'sine',
		square : 'square',
		saw : 'sawtooth',
	},
	
	runScript : function(script) {
		try {
			eval(script);
		}catch(e) {
			G.log(e.toString());
			console.log(e);
		}
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
		send : function(_bus, amount) {
			var bus = { 
				bus : Gibber.getBus(_bus),
				amount : amount,
			};
			
			bus.bus.senders.push(this);
			
			this.sends.push(bus);
		},
		
		out : function() {
			this.generate();
			return this.getMix() * this.mix;
		},
		
		fxout : function(samp) {
			this.pushSample(samp,0);
			// if(Gibber.debug) {
			// 				console.log("this.mix = " + this.mix);
			// 				console.log("value = " + this.getMix());
			// 				console.log("output = " + (samp * (1 - this.mix)) + (this.mix * this.getMix(0)));
			// 			}
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
		
			if(typeof _source.mods === "undefined") {
				_source.mods = [];
			}
			
			_source.store = {};
			_source.modded.push(this);
			_source.param = name;
			_source.name = _name;
			_source.type = type;
			
			this.mods.push(_source);			
			
			Gibber.genRemove(_source);
			return this;
		},
	
		clearMods : function() {
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

Gibber.initDurations();

// audioLib additions
audioLib.Automation.modes.absoluteAddition = function(fx, param, value){
	fx.setParam(param, fx[param] + Math.abs(value));
};

Master = {
	mods : [],
	fx : [],
	automations : [],
	mix : 1,
};
Gibber.addModsAndFX.call(Master);

function Osc(args, isAudioGenerator) {
	var _freq = (typeof args[0] !== "undefined") ? args[0] : 440;
	
	var that = new audioLib.Oscillator(Gibber.sampleRate, _freq);
	that.type = "gen";	
	
	that.mix = (typeof args[1] !== "undefined") ? args[1] : .2;
	that.active = true;		
	that.value = 0;
	if(typeof args[2] === "string") {
		that.waveShape = args[2];
	}
	
	that.mods = [];
	that.fx = [];
	that.sends = [];	
	that.modded = []; // for use as modulation source
	that.masters = [];
	
	that.freq = function(_freq) {
		this.frequency = _freq;
	};
	
	that.kill = function() {
		Gibber.genRemove(this);
		if(this.masters != undefined) 	this.masters.length = 0;
		if(this.mods != undefined)		this.mods.length = 0;
		if(this.fx != undefined)		this.fx.length = 0;
	};

	that.stop = function() {
		this.active = false;
		return this;
	};
	
	that.start = function() {
		this.active = true;
		return this;		
	};
	
	if(typeof isAudioGenerator === "undefined" || isAudioGenerator) {
		Gibber.audioInit = true;
		Gibber.generators.push(that);
	}
	
	that.silent = function() {
		Gibber.genRemove(this);
		return this;
	};
	
	that.sssh = that.silent;
	
	Gibber.addModsAndFX.call(that);
	
	return that;
}

function LFO(freq, amount, shape, type) {
	var that = Osc(arguments, false);
	that.isControl = true;
	that.name = "LFO";
	that.type = "mod";
	that.mix = amount;
	that.waveShape = (typeof shape === "String") ? shape : 'sine';
	that.modded = [];
	that.mods = [];
	Gibber.addModsAndFX.call(that);	

	return that;
};

function Sine(freq, volume, shouldAdd) {	
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

// audioLib.ADSREnvelope.prototype.isDead = true;
// audioLib.ADSREnvelope.prototype.generate = function(){
// 	if(!this.isDead) {
// 		this.states[this.state].call(this);
// 	}
// 	return this.value;
// };
// 
// audioLib.ADSREnvelope.prototype.states[4] = function(){ // Timed release state of env
// 	this.value = Math.max(0, this.value - 1000 / this.sampleRate / this.release);
// 
// 	if (this._st++ >= this.sampleRate * 0.001 * this.releaseTime){
// 		//console.log(this);
// 		this._st	= 0;
// 		this.state	= 0;
// 		this.gate = false;
// 		this.isDead = true;
// 		this.value = 0;
// 	}
// }
// 
// audioLib.ADSREnvelope.prototype.triggerGate = function(isOpen){
// 	isOpen		= typeof isOpen === 'undefined' ? !this.gate : isOpen;
// 	this.gate	= isOpen;
// 	this.state	= isOpen ? 0 : this.releaseTime === null ? 3 : 5;
// 	this._st	= 0;
// 	if(isOpen) this.isDead = false;
// };
/*
s = Sine(240, .15);
e = Env(100);
s.mod("mix" , e, "*");
e.triggerGate();
*/
audioLib.ADSREnvelope.prototype.states[1] = function(){ // Timed Decay
	var delayAmt = (1 - this.sustain) / ( (Gibber.sampleRate / 1000) * this.decay);
	this.value -= delayAmt;
	if(this.value <= this.sustain) {
		if(this.sustainTime === 0) {
			this.state = 2;
		}else{
			this.state= 4;
		}
	}
 	//this.value = Math.max(this.sustain, this.value - 1000 / this.sampleRate / this.release);
}; 

// list of values / durations passed as arguments
function Env2 () {
	that = {};
	that.value = 0;
	that.position = 0;
	that.values = [];
	that.durations = [];
	that.shouldLoop = false;
	that.phase = 0;
	that.active = true;
	that.increment = 0;
	that.modded =[];
	
	for(i = 0; i < arguments.length - 1; i+=2) {
		that.values.push(arguments[i]);
		that.durations.push(arguments[i + 1]);		
	}
	
	that.increment = (that.values[that.position] - that.value) / that.durations[that.position];
	
	that.generate = function() {
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
				}
				this.increment = (this.values[this.position] - this.value) / this.durations[this.position];
			}
			this.value += this.increment;
		}
	}
		
	function bpmCallback() {
		return function(percentageChangeForBPM) {
			for(var i = 0; i < this.durations.length; i++) {
				this.durations[i] *= percentageChangeForBPM;
			}
		}
	}
	
	Gibber.registerObserver("bpm", bpmCallback());
	
	Gibber.addModsAndFX.call(that);	
	
	that.out = function() {
		this.generate();
		return this.value;
	};
	
	return that;
}


 
function Env(attack, decay, sustain, release, sustainTime, releaseTime) {
	if(arguments.length > 1) {
		if(typeof attack === "undefined") 	attack 		= 100;
		if(typeof decay  === "undefined") 	decay  		= 50;
		if(typeof sustain === "undefined") 	sustain 	= 0;	// sustain is a amplitude value, not time\
	}else{
		if(typeof attack === "undefined") 	sustain 	= 0;
		if(typeof decay  === "undefined") 	attack  	= 100;
		if(typeof sustain === "undefined") 	decay 		= 50;
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

function Sched(_func, _time, _repeats) {
	var that = {
		func : _func,
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
