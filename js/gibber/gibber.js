var GND = {
	active : true,
	
	init : function() {
		this.dev = audioLib.AudioDevice(audioProcess, 2),
		this.sampleRate = this.dev.sampleRate;
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
	
};

GND.gens = GND.generators;

function Osc(args, isLFO) {
	var _freq = (typeof args[0] !== "undefined") ? args[0] : 440;
	
	that = new audioLib.Oscillator(GND.sampleRate, _freq),
		
	that.amp = (typeof args[1] !== "undefined") ? args[1] : .25;
	that.ampOffset = 0;
	that.active = true;
	
	that.out = function() {
		if(this.active) {
			this.generate();
			this.value = this.getMix() * (this.amp + this.ampOffset);
		}else{
			this.value = 0;
		}
		return this.value;
	}
	
	this.value = 0;
	that.mods = [];
	
	that.mod = function(_name, _source) {
		this.mods.push( {type:_name, gen:_source} );
	}
	
	that.stop = function() {
		this.active = false;
	}
	
	that.start = function() {
		this.active = false;
	}
	
	if(typeof isLFO === "undefined" || !isLFO) {
		GND.generators.push(that);
	}
	
	return that;
}

function LFO(freq, amount) {
	var that = Osc(arguments, true);
	that.waveShape = 'sine';
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

function invSaw(freq, volume) {	
	var that = Osc(arguments);
	that.waveShape = 'invSawtooth';
	
	return that;
}

function Square(freq, volume) {	
	var that = Osc(arguments);
	that.waveShape = 'square';
	
	return that;
}

function audioProcess(buffer, channelCount){
	var i, channel, val;
	for (i = 0; i < buffer.length; i+=channelCount){
		val = 0;
		if( GND.active ) {
			for(var l = 0; l < GND.generators.length; l++) {
				var gen = GND.generators[l];
				for(var m = 0; m < gen.mods.length; m++) {
					var mod = gen.mods[m];
					gen[mod.type] = mod.gen.out();
				}
				val += gen.out();	
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

function StepSequencer(stepTime, steps) {
	var that = new audioLib.StepSequencer(GND.sampleRate, stepTime, steps, 0.0);
	return that;
}
var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z;

audioLib.StepSequencer.prototype.out = function() {
	this.generate();
	return this.getMix();
}
