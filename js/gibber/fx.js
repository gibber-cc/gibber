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

function Ring(freq, amt) {
	freq = (typeof freq !== "undefined") ? freq : 440;
	amt  = (typeof amt !== "undefined") ? amt : 1;	
	var that = {
		freq: freq,
		amt: amt,
	};
	
	that.name = "Ring";
	that.type="fx";
	
	that.osc  = Sine(that.freq, that.amt);
	that.osc.isControl = true;
	that.gens = [];
	that.mods = [];
	that.value = 0;
	that.mix = 1;
	
	(function(obj) {
	    Object.defineProperties(that, {
			"frequency" : {
		        get: function() {
		            return this.osc.frequency;
		        },
		        set: function(value) {
		            this.osc.frequency = value;
		        }
			},
			"amount" : {
		        get: function() {
		            return this.osc.mix;
		        },
		        set: function(value) {
		            this.osc.mix = value;
		        }
			},	
	    });
	})(that);
	
	
	that.pushSample = function(sample) {
		this.osc.generate();
		this.value = sample * this.osc.getMix();
		return this.value;
	}
	
	that.getMix = function() {
		return this.value;
	}
	Gibber.addModsAndFX.call(that);
	
	return that;
}
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

function Trunc(bits, mix) {
    var that = audioLib.BitCrusher(Gibber.sampleRate);
	that.name = "Trunc";
	that.type="fx";
	
	that.gens = [];
	that.mods = [];
	that.automations = [];
	
	bits = bits || 8;
	if(bits > 16) bits = 16;
	
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

// simple waveshaper using y = x / (1+|x|) 
// added a logarithmic volume adapter to the equation so that you can
// apply extreme amounts of clipping
// TODO: store base2 log for faster calculations
function Clip(amt) {
	var that = {
		amount: (typeof amt !== "undefined" && amt > 1) ? amt : 4,
		name : "Clip",
		type: "fx",
		gens :  [],
		mods :  [],
		value : 0,
		mix : 1,
		
		pushSample : function(sample) {
			var x = sample * this.amount;
			this.value = (x / (1 + Math.abs(x))) / (Math.log(this.amount) / Math.LN2);
			return this.value;
		},
		getMix : function() {
			return this.value;
		},
	};

	Gibber.addModsAndFX.call(that);
	
	return that;
}

function Gain(amt) {
	var that = new  audioLib.GainController(Gibber.sampleRate, amt);
	that.name = "Gain";
	that.type = "fx";
	
	that.gens = [];
	that.mods = [];
	
	Gibber.addModsAndFX.call(that);	
	return that;
}

function Comp(scaleBy, gain){
	var that = new audioLib.Compressor(Gibber.sampleRate, scaleBy, gain);
	that.name = "Comp";
	that.type = "fx";
	
	that.gens = [];
	that.mods = [];
	
	Gibber.addModsAndFX.call(that);	
	return that;
}

function Comb(delaySize, feedback, damping){
	var that = new audioLib.CombFilter(Gibber.sampleRate, delaySize, feedback, damping);
	that.name = "Comb";
	that.type = "fx";
	
	that.gens = [];
	that.mods = [];
	
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
