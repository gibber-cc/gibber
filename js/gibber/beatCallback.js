/* 	
Charlie Roberts 2012 MIT License
Execute a callback in relation to a continuously running clock, on a particular beat.

Usage:
c = audioLib.Callback;
c.addCallback("Gibber.setBPM(120)", _4);	// time is measured in samples

This will set the bpm to 120 at the start of the next quarter beat
*/

(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){

function Callback() {
	this.measureLengthInSamples = _1;
	
	function bpmCallback() {
		var that = this;
		return function(percentageChangeForBPM) {
			that.measureLengthInSamples = _1;
		}
	}
	
	Gibber.registerObserver("bpm", bpmCallback.call(this));
}

Callback.prototype = {
	callbacks : [],
	phase : 0,
	measureLengthInSamples : 0,
	value : 0,
	
	addCallback : function(callback, subdivision) {		
		var currentSubdivision = Math.floor(this.phase / subdivision); // 0
		var nextSubdivision = (currentSubdivision + 1) * subdivision; // 1 * _1 = 88200
		//console.log("Current Subdivison = " + currentSubdivision + " : next subdivision = " + nextSubdivision + " : phase = " + this.phase);
		
		function _callback() {
			var call = callback;
			return function() {
				stop();
				//console.log("here is " + call);
				eval(call);

			}
		}
		//console.log("time till event = " + ((nextSubdivision - this.phase) / (Gibber.sampleRate / 1000)) ) // 88200 - 88187 / 441
		var stop = Sink.doInterval(_callback(), ((nextSubdivision - this.phase) / (Gibber.sampleRate / 1000)) );
	},
	
	generate : function() {
		this.phase++;
		if(this.phase > this.measureLengthInSamples) { 
			this.phase = 0;
			for(var i = 2; i <= 4; i++) {
				$("#n" + i).css("color", "#444");
			}
			$("#n1").css("color", "red");
		}else{
			if(this.phase % _4 == 0) {
				var subdivision = Math.floor(this.phase / _4) + 1;
				$("#n" + subdivision).css("color", "red");
			}
		}
	},
	
	getMix : function() { return this.value; }, // not used but just in case
}

audioLib.generators('Callback', Callback);

audioLib.Callback = audioLib.generators.Callback;

}(audioLib));
audioLib.plugins('Callback', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
	exports.init = initPlugin;
} else {
	initPlugin(audioLib);
}

}());
