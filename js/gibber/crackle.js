(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){	
	
function Crackle (damping, blend, color){
	this.name = "Crackle";
	this.type = "gen";
	this.value = 0;
	this.active = true;
	
	this.mods =[];
	this.fx =[];
	this.sends = [];
	this.masters =[];		
		
	Gibber.addModsAndFX.call(this);	
	Gibber.generators.push(this);
}

Crackle.prototype = {
	sampleRate : Gibber.sampleRate,
	type  : "mod",
	name  : "Crackle",
	mix   : .35,
	
	kill : function() {
		Gibber.genRemove(this);
		this.masters.length = 0;
		this.mods.length = 0;
		this.fx.length = 0;
		this.sends.length = 0;
	},
	
	generate : function() {		
		this.value = (Math.random() < .0001) ? 1 : 0;
	},
			
	getMix : function() { return this.value * this.mix; },
};

Crackle.prototype.__proto__ = new audioLib.GeneratorClass();

audioLib.generators('Crackle', Crackle);

audioLib.Crackle = audioLib.generators.Crackle;
 
}(audioLib));
audioLib.plugins('Crackle', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
	exports.init = initPlugin;
} else {
	initPlugin(audioLib);
}

}());

function Crackle(damping, blend, color) {
	return new audioLib.Crackle(damping, blend, color);
}
