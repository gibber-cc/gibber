/* 	
Charlie Roberts 2012 MIT License
Execute a callback in relation to a continuously running clock, on a particular beat.
TODO: This is also now the master clock in Gibber and should be abstracted.

Usage:
c = audioLib.Callback;
c.addCallback("Gibber.setBPM(120)", _4);	// time is measured in samples

This will set the bpm to 120 at the start of the next quarter beat

TODO: There is now an audio stutter when changing tempo. I'm guessing this is due to checking the large number
of past events in the sequence array that are no longer even being used. How can we regularly cull this array?
*/
function Callback() {
	this.measureLengthInSamples = _1;
	this.sequence = [];
	
	function bpmCallback(obj) {
		var that = obj;
		return function(percentageChangeForBPM) {
			that.measureLengthInSamples = _1;
			var init = false;
			var _phase = that.phase;
			that.phase = Math.floor(that.phase * (1 / percentageChangeForBPM));
			
			for(var i = 0; i < that.sequenceNumbers.length; i++) {
				var pos = that.sequenceNumbers[i];
				if(typeof that.sequence[pos] !== "undefined") {
					var newPhase = Math.floor(pos * (1 / percentageChangeForBPM));
					that.sequence[newPhase] = that.sequence[pos].slice(0);
					that.sequenceNumbers.splice(i, 1, newPhase);
					delete that.sequence[pos];
				}
			}
		}
	}
	
	Gibber.registerObserver("bpm", bpmCallback(this));
}

Callback.prototype = {
	callbacks : [],
	slaves : [],
	phase : 0, // phase for beats / measure / callbacks
	cphase: 0, // phase for controls
	measureLengthInSamples : 0,
	value : 0,
	init : false,
	beat : 0,
	sequenceNumbers: [],
	numberOfBeats : 4,
	
	addEvent : function(position, sequencer) {
		//console.log("ADDING", this.phase + position);
		if(this.sequence[this.phase + position] === undefined) {
			this.sequence[this.phase + position] = [];
		}
		
		this.sequence[this.phase + position].push(sequencer);
		
		if(this.sequenceNumbers.indexOf(this.phase + position) === -1) {
			this.sequenceNumbers.push(this.phase + position);
		}

		return this.phase + position;
	},
	
	addCallback : function(callback, subdivision, shouldLoop, shouldWait) {		
		if(typeof shouldWait === 'undefined') shouldWait = true;
		if(typeof shouldLoop === 'undefined') shouldLoop = false;
		var currentSubdivision = Math.floor(this.phase / subdivision); // 0
		var nextSubdivision = (currentSubdivision + 1) * subdivision; // 1 * _1 = 88200

		function _callback() {
			var call = callback;
			var loop = shouldLoop;
			return function() {
				if(typeof call === "string") {
					eval(call);
				}else{
					call();
				}
				return loop;
			}
		}

		this.callbacks.push(_callback());
		
		return this.callbacks[this.callbacks.length - 1];
	},

	generate : function() {
		if(this.phase % _1 === 0){	// must happen first to correctly schedule new sequencers
			this.beat = 0;
			for(var i = 2; i <= 4; i++) {
				$("#beat" + i).css("background-color", "#000");
			}
			$("#beat1").css("background-color", "#3c3434");
			if(this.callbacks.length != 0) {
				for(var j = 0; j < this.callbacks.length; j++) {
					try{
						var check = this.callbacks[j]();
						if(!check) this.callbacks.splice(j,1);
					}catch(e) {
						G.log(e.toString());
						console.log(e);
						this.callbacks.splice(j,1);
					}
				}
			}
		}else{
			if(this.phase % _4 === 0) {
				this.beat++;
				
				var subdivision = this.beat + 1;
				for(var i = 1; i <= 4; i++) {
					$("#beat" + i).css("background-color", "#000");
				}
				
				$("#beat" + subdivision).css("background-color", "#3c3434");
			}
		}
		
		if(this.sequence[this.phase] != undefined) {	// play events
			var events = this.sequence[this.phase];
			for(var i = 0; i < events.length; i++) {
				var seq = events[i];
				seq.advance();
			}
		}
		
		this.phase++;
	},
}