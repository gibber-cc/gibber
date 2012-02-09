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
	
	for(var g = 0; g < Gibber.generators.length; g++) {
		var gen = Gibber.generators[g];
		//console.log("mod length = " + gen.mods.length);
		for(var m = 0; m < gen.mods.length; m++) {
			var mod = gen.mods[m];
			//gen[mod.type] = mod.gen.out();
			mod.gen.generateBuffer(buffer.length, channelCount);
		}
		gen.generateBuffer(buffer.length, channelCount);
	}
	
	for (i = 0; i < buffer.length; i+=channelCount){
		val = 0;
		if( Gibber.active ) {
			for(var l = 0; l < Gibber.generators.length; l++) {
				var gen = Gibber.generators[l];
	
				val += gen.generatedBuffer[i];	
			}
			//if(i == buffer.length / 2) console.log(val);
			buffer[i]   = val;
			buffer[i+1] = buffer[i];
		}else{
			buffer[i]   = 0;
			buffer[i+1] = 0;
		}
	}
};


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
	
	that.mod = function(_name, _source) {
		this.mods.push( {type:_name, gen:_source} );
		this.addAutomation(_name, _source, 1, 'addition');
		return this;
	}
	
	that.clear = function() {
		this.mods.length = 0;
	}
	
	that.stop = function() {
		this.active = false;
	}
	
	that.start = function() {
		this.active = false;
	}
	
	if(typeof isAudioGenerator === "undefined" || isAudioGenerator) {
		Gibber.generators.push(that);
	}
	
	return that;
}

function LFO(freq, amount, shape) {
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
