//  Gibber.js - fx.js
// ========================


// ###Bus
// Create a bus holding fx that signals can be routed to 
//
// param **name**: String Optional name that can be used to refer to the new bus.  
// param **---**: variable length object list. A comma delimited list of effects to attach to the bus.  
//
// example usage:  
//	`b = Bus( Delay(_4), Reverb() );  
//  s = Synth();  
//	s.send( b, .5 ); 
//
// alternatively:  
//	`b = Bus( "rev", Delay(_4), Reverb() );  
//  s = Synth();  
//	s.send( "rev", .5 );  `
//
// Note that when Reverb is placed on a bus it defaults to outputting only the wet signal; this is different from how it behaves in an fx chain.

function Bus() { // name is id, fx is array, ahem, fx
	var bus = {};
	bus.fx = [];
	
	var fxStart = (typeof arguments[0] === "string") ? 1 : 0;
	for(var i = fxStart; i < arguments.length; i++) {
		var fx = arguments[i];
		if(fx.name === "Reverb") {
			fx.wet = 1;
			fx.dry = 0;
		}
		bus.fx.push(fx);
	}
	
	bus.name = (typeof arguments[0] === "string") ? arguments[0] : null;
	bus.value = 0;
		
	bus.senders = [];
	Gibber.busses.push(bus);
	
	bus.kill = function() {
		for(var i = 0; i < this.senders.length; i++) {
			var gen = this.senders[i];
			for(var j = 0; j < gen.sends.length; j++) {
				if(gen.sends[j] == this) {
					gen.sends.splice(j, 1);
					break;
				}
			}
		}
		for(var i = 0; i < Gibber.busses.length; i++) {
			var _bus = Gibber.busses[i];
			if(this == _bus) {
				Gibber.busses.splice(i, 1);
			}
		}
	};
	
	return bus;
}

// ##Reverb#
// A wrapper for the reverb from audioLib.js
//
// param **roomSize**: Float. Default = .8. The size of the room being emulated  
// param **damping**: Float. Default = .3. Attenuation of high frequencies that occurs  
// param **wet**: Float. Default = .75. The amount of processed signal that is output  
// param **dry**: Float. Default = .5. The amount of dry signal that is output  
//
// example usage:    
// `s = Synth();  
//  s.fx.add( Reverb() );  `

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

// ###Delay
// A wrapper for the Delay from audioLib.js
//
// param **time**: Int. Default = _4. The number of samples betweeen echoes, usually expressed in Gibber time variables
// param **feedback**: Float. Default = .3. How much of the output is fed back into the input of hte delay  
//
// example usage:    
// `s = Synth();  
//  s.fx.add( Delay() );  `

function Delay(time, feedback, mix) {
	var that = audioLib.Delay(Gibber.sampleRate);
	that.name = "Delay";
	that.type= "fx";
	
	that.gens = [];
	that.mods = [];
	that.automations = [];
	
	that.time = time || _4;
	that.time /= Gibber.sampleRate / 1000;
	feedback = feedback || .3;
	mix = isNaN(mix) ? .3 : mix;
	
	if(typeof feedback === "Object") {
		that.effects[1].feedback = feedback[0];
		that.effects[0].feedback = feedback[1];
	}else{
		that.setParam("feedback", feedback);
	}
	
	if(typeof time === "Object") {
		that.effects[1].time = that.time[0];
		that.effects[0].time = that.time[1];
	}else{
		that.setParam("time", that.time);
	}
	
	that.bpmCallback = function(obj) {
		var _that = obj;
		return function(percentageChangeForBPM) {
			_that.time *= percentageChangeForBPM;
			_that.setParam("time", _that.time);			
		}
	};
	
	Gibber.registerObserver( "bpm", that.bpmCallback(that) );
	
	
	that.mix = mix;
	
	Gibber.addModsAndFX.call(that);
	return that;	
};

// ###Ring
// A Ring Modulator by thecharlie
//
// param **frequency**: Float. Default = 440. The frequency of the sine wave that the signal is multiplied by  
// param **amount**: Float. Default = 1. The amplitude of the sine wave the signal is multiplied by  
//
// example usage:    
// `s = Synth();  
//  s.fx.add( Ring(220, .5) );  `

function Ring(frequency, mix) {
	frequency = (typeof freq !== "undefined") ? frequency : 440;
	mix  = (typeof mix !== "undefined") ? mix : 1;	
	var that = {
		frequency: frequency,
		mix: mix,
	};
	
	that.name = "Ring";
	that.type="fx";
	
	that.osc  = Sine(that.frequency, that.amount).silent();
	that.osc.amp = 1;
	that.osc.isControl = true;
	that.gens = [];
	that.mods = [];
	that.value = 0;
	
	(function(obj) {
	    Object.defineProperties(obj, {
			"frequency" : {
		        get: function() {
		            return obj.osc.frequency;
		        },
		        set: function(value) {
		            obj.osc.frequency = value;
		        }
			},	
	    });
	})(that);
	
	
	that.pushSample = function(sample) {
		this.osc.generate();		
		this.value = sample * this.osc.sine();
		return this.value;
	}
	
	that.getMix = function() {
		return this.value;
	}
	
	that.setParam = function(param, value){
		this[param] = value;
	}
	
	Gibber.addModsAndFX.call(that);
	
	return that;
}

// ###Crush
// A bit-crusher from audioLib.js  
//
// param **resolution**: Float. Default = 8. The number of bits to truncate the output to  
//
// example usage:    
// `d = Drums("xoxo");  
//  d.fx.add( LPF(420, .5) );  `

function Crush(resolution, mix) {
    var that = audioLib.BitCrusher(Gibber.sampleRate);
	if(typeof arguments[0] === "object") {
		var obj = arguments[0];
		
		for(key in obj) {
			that[key] = obj[key];
		}
	}
	
	that.name = "Crush";
	that.type = "fx";
	
	that.gens = [];
	that.mods = [];
	that.automations = [];
	
	resolution = resolution || 8;
	if(resolution > 16) resolution = 16;
	
	if(typeof resolution === "Object") {
		that.effects[1].resolution = Math.pow(2, resolution[0] - 1);
		that.effects[0].resolution = Math.pow(2, resolution[1] - 1);
	}else{
		that.setParam("resolution", Math.pow(2, resolution - 1));
	}
	
	that.mix = mix || 1;
	
	Gibber.addModsAndFX.call(that);
	return that;
}

// ###Clip
// A simple waveshaping distortion using y = x / (1+|x|) by thecharlie
//
// param **amount**: Float. Default = 4. The amount of distortion
// Clip also has a logarithmic volume adapter to the equation so that you can
// apply extreme amounts of clipping
// TODO: store base2 log for faster calculations
//
// example usage:    
// `d = Drums("xoxo");  
//  d.fx.add( Clip(1000) );  `

window.Dist = window.Clip = function(amount, amp) {
	var that = {
		amount: (typeof amount !== "undefined" && amount > 1) ? amount : 4,
		name : "Clip",
		type: "fx",
		gens :  [],
		mods :  [],
		value : 0,
		mix : 1,
		amp : isNaN(amp) ? 1 : amp,
		
		pushSample : function(sample) {
			var x = sample * this.amount;
			this.value = (x / (1 + Math.abs(x))) / (Math.log(this.amount) / Math.LN2);
			return this.value;
		},
		getMix : function() {
			return this.value * this.amp;
		},
	};
	
	if(typeof arguments[0] === "object") {
		var obj = arguments[0];
		
		for(key in obj) {
			that[key] = obj[key];
		}
	}
	
	Gibber.addModsAndFX.call(that);
	
	return that;
}
// ###Comb Filter 
// A wrapper around the Comb filter from audiolib.js
//
// param **delaySize**: Int. The offset in samples for the comb filter
// param **feedback**: Float. feedback of samples into filter
// param **damping**: Float. Default = .2. damping for feedback
//
// example usage:    
// `d = Drums("xoxo");  
//  d.fx.add( Clip(1000) );  `

function Comb(delaySize, feedback, damping){
	var that;
	if(typeof arguments[0] === "object") {
		var obj = arguments[0];
		that = new audioLib.CombFilter(Gibber.sampleRate, obj.delaySize, obj.feedback, obj.damping);

	}else{
		that = new audioLib.CombFilter(Gibber.sampleRate, delaySize, feedback, damping);
	}
	
	that.name = "Comb";
	that.type = "fx";
	
	that.gens = [];
	that.mods = [];
	
	Gibber.addModsAndFX.call(that);	
	return that;
}

// ###LPF
// A low-pass filter from audioLib.js  
//
// param **cutoff**: Float. Default = 300. The cutoff frequency of the filter  
// param **resonance**: Float. Default = 3. Emphasis of the cutoff frequency  
//
// example usage:    
// `d = Drums("xoxo");  
//  d.fx.add( LPF(420, .5) );  `

function LPF(cutoff, resonance, mix) {
	var that = audioLib.LP12Filter(Gibber.sampleRate);
	that.name = "LPF";
	that.type="fx";
	
	that.gens = [];
	that.mods = [];
	that.automations = [];
	that.trig = Gibber.trig;	
	
	cutoff = isNaN(cutoff) ? 300 : cutoff;
	resonance = isNaN(resonance) ? 3 : resonance;
	
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


function HPF(cutoff, Q) {
	var that;
	if(typeof arguments[0] === "object") {
		var obj = arguments[0];
		
		if(isNaN(obj.cutoff)) obj.cutoff = 1000;
		if(isNaN(obj.Q)) obj.Q = .5;
		
		that = new audioLib.BiquadFilter.HighPass(Gibber.sampleRate, obj.cutoff, obj.Q);		
	}else{
		if(isNaN(cutoff)) cutoff = 1000;
		if(isNaN(Q)) Q = .5;		
		that = new audioLib.BiquadFilter.HighPass(Gibber.sampleRate, cutoff, Q);
		that.Q = Q;
		that.cutoff = cutoff;
	}
	that.name = "HPF";
	that.type = "fx";
	
	that.gens = [];
	that.mods = [];
	that.mix = isNaN(that.mix) ? 1 : that.mix;
	
	Gibber.addModsAndFX.call(that);
	(function(obj) {
	    Object.defineProperties(obj, {
			"cutoff" : {
		        get: function() {
		            return cutoff;
		        },
		        set: function(value) {
		            cutoff = value;
					var	w0	= 2* Math.PI*cutoff/Gibber.sampleRate,
						cosw0	= Math.cos(w0),
						sinw0   = Math.sin(w0),
						alpha   = sinw0/(2*this.Q),
						b0	=  (1 + cosw0)/2,
						b1	= -(1 + cosw0),
						b2	=   b0,
						a0	=   1 + alpha,
						a1	=  -2*cosw0,
						a2	=   1 - alpha;
					this.reset(Gibber.sampleRate, b0/a0, b1/a0, b2/a0, a1/a0, a2/a0);
		        }
			},	
	    });
	})(that);

	return that;
}