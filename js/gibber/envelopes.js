// list of values / durations passed as arguments

function ADSR(attack, decay, sustain, release, attackLevel, sustainLevel) {
	that = Gibberish.ADSR(attack, decay, sustain, release, attackLevel, sustainLevel);
	return that;
}

function Step(steps, time) {
	that = Gibberish.Step(steps, time);
	return that;
}

function Line(start, end, time, loops){
	var that = Gibberish.Line(start, end, time, loops);
	
	return that;
}

function Env(attack, decay){
	var that = Gibberish.Env(attack, decay);
	
	return that;
}

// TODO: recreate this in Gibberish as a multi-break-point envelope
function Env2() {
	that = {
		value : 0,
		position : 0,
		values : [],
		durations : [],
		shouldLoop : false,
		phase : 0,
		active : true,
		increment : 0,
		modded : [],
		endFunction : null,
		mix: 1,
		end : function(func) { 
			if(typeof func === "function") this.endFunction = func; 
			return this;
		},
		
		generate : function() {
			if(this.active) {
				this.phase++;
				if(this.phase >= this.durations[this.position]) {
					this.phase = 0;
					this.position++;
					if(this.position >= this.durations.length) {
						// TODO: INTERESTING. Because this.active is set to false during one cycle, the value
						// is not restored in the audio callback. Oddly enough, this creates the expected behavior.
						this.active= false;
						this.position = 0;
						//G.log("NOT ACTIVE");
						if(this.endFunction != null) {
							this.endFunction();
						}
					}
					this.increment = (this.values[this.position] - this.value) / this.durations[this.position];
				}
				this.value += this.increment;
			}
		},
		
		trigger : function() {
			var start = (arguments.length % 2 === 0) ? 0 : 1;
			if(start) that.value = arguments[0];
			this.phase = 0;
			this.position = 0;
		},
		
		advance : function() {
			this.phase = 0;
			this.position++;
			
			this.increment = (this.values[this.position] - this.value) / this.durations[this.position];
		},
	};
	
	var start = (arguments.length % 2 === 0) ? 0 : 1;
	if(start) that.value = arguments[0];
	
	for(i = start; i < arguments.length - 1; i+=2) {
		that.values.push(arguments[i]);
		that.durations.push(arguments[i + 1]);		
	}

	that.increment = (that.values[that.position] - that.value) / that.durations[that.position];

	function bpmCallback() {
		return function(percentageChangeForBPM) {
			for(var i = 0; i < this.durations.length; i++) {
				this.durations[i] *= percentageChangeForBPM;
			}
		}
	}
	
	Gibber.registerObserver("bpm", bpmCallback());
	
	Gibber.addModsAndFX.call(that);	
	
	// define after addModsAndFX since it overrides the out function assigned by it
	that.out = function() {
		this.generate();
		return this.value;
	};
	
	return that;
}