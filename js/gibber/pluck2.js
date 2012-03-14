(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){	
	
// 0 - 1 produced the best values for damping, but higher values can be used for very short sounds
function Pluck2 (damping, blend, color){
	this.name = "Pluck2";
	this.type = "gen";
	this.frequency = 440;
	this.value = 0;
	this.active = true;
	
	this.mods =[];
	this.fx =[];
	this.sends = [];
	this.masters =[];		
	
	this.noise = Square();
	//this.noise = new audioLib.Noise();
	this.noise.silent();
	this.buffer = [];
	this.rbuffer = [];	
	this.lastValue = 0;
	this.rlastValue = 0;	
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

Pluck2.prototype = {
	sampleRate : Gibber.sampleRate,
	type  : "mod",
	name  : "Pluck2",
	
	note : function(n) {
		this.buffer = [];
		
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
			//this.buffer[i] = this.noise[this.color]();
			this.buffer[i] = this.noise.out();
		}
		this.rbuffer = this.buffer.slice(0);
	},
	
	kill : function() {
		Gibber.genRemove(this);
		this.masters.length = 0;
		this.mods.length = 0;
		this.fx.length = 0;
		this.sends.length = 0;
	},
	
generate : function() {		
	var val  = this.buffer.shift(); // remove from beginning
	var val2 = this.rbuffer.pop();  // remove from end

	if(isNaN(val)) val = 0;
	if(isNaN(val2)) val2 = 0;		
		
	var rnd = (Math.random() > this.blend) ? -1 : 1;

	var v1, v2;
	v1 = rnd * (val + this.lastValue) * this.dampingValue;
	v2 = rnd * (val2 + this.rlastValue) * this.dampingValue * -1;

	this.value = (v1 + v2) * .5;

	this.lastValue = v1;
	this.rlastValue = v2;		
		
	this.buffer.push(v1);			// push to end
	this.rbuffer.unshift(v2);		// push to beginning
},
			
	getMix : function() { return this.value; },
};

Pluck2.prototype.__proto__ = new audioLib.GeneratorClass();

audioLib.generators('Pluck2', Pluck2);

audioLib.Pluck2 = audioLib.generators.Pluck2;
 
}(audioLib));
audioLib.plugins('Pluck2', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
	exports.init = initPlugin;
} else {
	initPlugin(audioLib);
}

}());

function Pluck2(damping, blend, color) {
	return new audioLib.Pluck2(damping, blend, color);
}
