//  Gibber.js - string.js
// ========================


(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){	

// ###Pluck
// A Karplus-Strong implementation by thecharlie
//
// param **damping**: Float. Default = 0. The speed at which the string decays. Note that higher frequencies decay faster than lower frequencies in the (basic) Karplus-Strong implementation
// param **blend**: Float. Default = 1. 1 gives string sounds, .5 gives noisy sounds, 0 gives weird sounds  
// param **color**: String. Default = "white". The type of noise used in the alogrithm. The options are "white", "pink", and "brown"
//
// example usage:    
// `p = Pluck(0, 1, "pink");  
//  p.note( "A3" );  `

function Pluck (damping, blend, color, vol){
	this.frequency = 440;
	this.value = 0;
	this.active = true;
	this.mix = vol || 1;
	
	this.mods =[];
	this.fx =[];
	this.sends = [];
	this.masters =[];		
	
	this.noise = new audioLib.Noise();
	this._buffer = [];
	this.lastValue = 0;
	if(typeof damping === "string") {
		color = damping;
		damping = 0;
	}
	this.damping = (isNaN(damping)) ? 0 : damping / 100;
	this.dampingValue = .5 - this.damping;
	this.blend = (isNaN(blend)) ? 1 : blend;
	
	this.color = (typeof color === "undefined") ? "white" : color;
	
	Gibber.addModsAndFX.call(this);	
	Gibber.generators.push(this);
	
	(function(obj) {
		var that = obj;
		var damping = that.damping;
	
	    Object.defineProperties(that, {
			"damping" : { 
				get: function() {
					return damping * 100;
				},
				set: function(value) {
					damping = value / 100;
					that.dampingValue = .5 - damping;
				}
			},
		});
	})(this);
}

Pluck.prototype = {
	sampleRate : Gibber.sampleRate,
	name : "Pluck",
	type : "gen",
	
	// ####note
	// play a note
	// 
	// param **note**: Default: NONE. Either a frequency or a note name such as "C#3"
	note : function(n) {
		this._buffer = [];
		
		switch(typeof n) {
			case "number" :
			break;
			case "string" :
				n = teoria.note(n).fq();
			break;
			default:
				n = n.fq();
				break;
		}

		var _size = Math.floor(44100 / n);
		for(var i = 0; i < _size ; i++) {
			this._buffer[i] = this.noise[this.color]();
		}
	},
	
	// ####kill
	// remove the generator from the graph and destroy all attached fx
	
	kill : function() {
		Gibber.genRemove(this);
		this.masters.length = 0;
		this.mods.length = 0;
		this.fx.length = 0;
		this.sends.length = 0;
	},
	
	generate : function() {		
		var val = this._buffer.shift();
		if(isNaN(val)) val = 0;
		var rnd = (Math.random() > this.blend) ? -1 : 1;
		
		this.value = rnd * (val + this.lastValue) * this.dampingValue;
		
		this.lastValue = this.value;
		
		this._buffer.push(this.value);
	},
			
	getMix : function() { return this.value; },
};

Pluck.prototype.__proto__ = new audioLib.GeneratorClass();

audioLib.generators('Pluck', Pluck);

audioLib.Pluck = audioLib.generators.Pluck;
 
}(audioLib));
audioLib.plugins('Pluck', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
	exports.init = initPlugin;
} else {
	initPlugin(audioLib);
}

}());

function Pluck(damping, blend, color) {
	return new audioLib.Pluck(damping, blend, color);
}
