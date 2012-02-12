/* 	
Charlie Roberts 2012 MIT License
Check for a callback to execute at given sample intervals.

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
		// Current Subdivison = 0 : next subdivision = 88200 : phase = 88187
		
		var currentSubdivision = Math.floor(this.phase / subdivision); // 0
		var nextSubdivision = (currentSubdivision + 1) * subdivision; // 1 * _1 = 88200
		console.log("Current Subdivison = " + currentSubdivision + " : next subdivision = " + nextSubdivision + " : phase = " + this.phase);
		
		function _callback() {
			var call = callback;
			return function() {
				stop();
				console.log("here is " + call);
				eval(call);

			}
		}
		console.log("time till event = " + ((nextSubdivision - this.phase) / (Gibber.sampleRate / 1000)) ) // 88200 - 88187 / 441
//		var stop = Sink.doInterval(_callback(), (nextSubdivision - this.phase) );
		var stop = Sink.doInterval(_callback(), ((nextSubdivision - this.phase) / (Gibber.sampleRate / 1000)) );
	},
	
	generate : function() {
		this.phase++;
		if(this.phase > this.measureLengthInSamples) this.phase = 0;
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
