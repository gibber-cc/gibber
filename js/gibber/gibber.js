var Gibber = {
	active : true,
	
	init : function() {
		this.dev = audioLib.AudioDevice(audioProcess, 2),
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
	}
	
};

Gibber.gens = Gibber.generators;

function audioProcess(buffer, channelCount){
	var i, channel, val;
	
	if( Gibber.active ) {
		for(var g = 0; g < Gibber.generators.length; g++) {
			var gen = Gibber.generators[g];
			if(gen.active) {
				// run controls
				for(var m = 0; m < gen.mods.length; m++) {
					var mod = gen.mods[m];
					mod.gen.generateBuffer(buffer.length, channelCount);
				}
				
				// run oscillator
				gen.generateBuffer(buffer.length, channelCount);
				
				// run fx
				for(var e = 0; e < gen.fx.length; e++) {
					var effect = gen.fx[e];
					effect.append(gen.generatedBuffer);
				}
				
				for(var i = 0; i < buffer.length; i++) {
					buffer[i] += gen.generatedBuffer[i];
				}
			}
		}
	}
};

Gibber.automationModes = {
	"+" : "addition",
	"=" : "assignment",
	"*" : "modulation",
};

Gibber.shorthands = {
	"freq": "frequency", 
	"amp": "mix",
}
function Osc(args, isAudioGenerator) {
	var _freq = (typeof args[0] !== "undefined") ? args[0] : 440;
	
	var that = new audioLib.Oscillator(Gibber.sampleRate, _freq);
		
	that.mix = (typeof args[1] !== "undefined") ? args[1] : .25;

	that.active = true;
	
	// that.out = function() {
	// 	if(this.active) {
	// 		this.generate();
	// 		this.value = this.getMix() * (this.amp + this.ampOffset);
	// 	}else{
	// 		this.value = 0;
	// 	}
	// 	return this.value;
	// }
	
	that.value = 0;
	
	that.mods = [];
	that.fx = [];
	that.automations = [];
	
	that.chain = function(_effect) {
		for(var i = 0; i < arguments.length; i++) {
			this.fx.push(arguments[i]);
		}
	}
	
	that.mod = function(_name, _source, _type) {
		var name = (typeof Gibber.shorthands[_name] !== "undefined") ? Gibber.shorthands[_name] : _name;
		var type = (typeof _type !== "undefined") ? Gibber.automationModes[_type] : 'addition';
		this.mods.push( {type:name, gen:_source} );
		this.automations.push(this.addAutomation(name, _source, 1, type));
		// this.mods.push(function() {
		// 			_source.generate();
		// 			this[name] = _source.getMix();
		// 		})
		// this.addPreProcessing(function() {
		// 	_source.generate();
		// 	this[name] = _source.getMix();
		// });
		return this;
	}
	
	that.clear = function() {
		for(var i = 0; i < this.mods.length; i++) {
			this.mods[i].gen.reset();
			this.automations[i].amount = 0;
		}
		this.mods.length = 0;
		this.automations.length = 0;
	}
	
	that.stop = function() {
		this.active = false;
	}
	
	that.start = function() {
		this.active = true;
	}
	
	if(typeof isAudioGenerator === "undefined" || isAudioGenerator) {
		Gibber.generators.push(that);
	}
	
	return that;
}

function Delay(feedback, time, mix) {
	var that = audioLib.Delay.createBufferBased(2, Gibber.sampleRate);
	if(typeof feedback === "Object") {
		that.effects[1].feedback = feedback[0];
		that.effects[0].feedback = feedback[1];
	}else{
		that.effects[0].feedback = feedback;
		that.effects[1].feedback = feedback;
	}
	
	if(typeof time === "Object") {
		that.effects[1].time = time[0];
		that.effects[0].time = time[1];
	}else{
		that.effects[0].time = time;
		that.effects[1].time = time;
	}
	
	that.mix = mix;
	
	return that;	
};


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

function Trigger(_func, _time, _repeats) {
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
