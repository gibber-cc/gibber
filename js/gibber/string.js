(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){	
	
// 0 - 1 produced the best values for damping, but higher values can be used for very short sounds
function Pluck (damping, blend, color){
	this.name = "Pluck";
	this.type = "gen";
	this.frequency = 440;
	this.value = 0;
	this.active = true;
	
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
					return damping * 10;
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
	type  : "mod",
	name  : "Pluck",
	
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
