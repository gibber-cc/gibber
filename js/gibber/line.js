(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){	
	
function Line (time, start, end){
	this.time = time || _1;
	this.start = start || 0;
	this.end = end || 1;
	this.value = 0;
	this.active = true;
	
	this.modded =[];
	
	this.increment = (this.end - this.start) / this.time;
	Gibber.addModsAndFX.call(this);		
}

Line.prototype = {
	sampleRate : Gibber.sampleRate,
	type  : "mod",
	name  : "Line",
	
	kill : function() {
		for(var i = 0; i < this.modded.length; i++) {
			this.modded[i].mods.remove(this);
		}
		this.modded = [];
	},
	
	generate : function() {		
		if(this.active) {
			this.value += this.increment;
			if(this.value >= this.end) {
				this.active = false;
				this.kill();
			}
		}
	},
		
	getMix : function() { return this.value; },
};

Line.prototype.__proto__ = new audioLib.GeneratorClass();

audioLib.generators('Line', Line);

audioLib.Line = audioLib.generators.Line;
 
}(audioLib));
audioLib.plugins('Line', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
	exports.init = initPlugin;
} else {
	initPlugin(audioLib);
}

}());

function Line(time, start, end) {
	return new audioLib.Line(time, start, end);
}
