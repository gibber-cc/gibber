/**#ADSR - Modulation
The cannonical four stage envelope.
## Example Usage##
`a = Sine();
e = ADSR();  
a.mod("amp", e, "=");  
e.trigger();

## Constructors
### syntax 1:
**param** *attack*: Integer in samples. The length of time in samples that it takes the envelope to reach its peak amplitude.
**param** *decay* : Integer in samples. The length of time in samples that it takes the envelope to decay from its peak to its sustain level.
**param** *sustain*: Integer in samples. The length of time the envelope maintains its sustain level
**param** *release* : Integer in samples. The length of time the envelope takes to fade from its sustain level to 0.
**param** *attackLevel* : Float. The peak level of the envelope, reached at the end of the attack stage.
**param** *sustainLevel* : Float. The sustain level of the envelope, reached at the end of the decay stage.
**/

/**###ADSR.run : method
Put the envelope at the start of its attack stage and run it.
**/

function ADSR(attack, decay, sustain, release, attackLevel, sustainLevel) {
	that = Gibberish.ADSR(G.time(attack), G.time(decay), G.time(sustain), G.time(release), attackLevel, sustainLevel);
	return that;
}

/**#Step- Modulation
A basic step sequencer
## Example Usage##
`a = Sine();
f = Step([140,280,100,200], _4);  
a.mod("frequency", f);  
`
## Constructors
### syntax 1:
**param** *values*: Array. An array of values to step through.
**param** *speed* : Integer in samples. The length of time for each step.
**/
function Step(steps, time) {
	that = Gibberish.Step(steps, G.time(time));
	return that;
}

/**#Line- Modulation
A simple one-directional ramp
## Example Usage##
`a = Sine();
l = Line(0, .5, _1, true);
a.mod("amp", l, "=");  
`
## Constructor
**param** *startingValue*: Float. The starting value for the Line.  
**param** *endingValue* : Float. The ending value for the Line.  
**param** *time* : Integer (samples). The time it takes to travel from the start value to the end value.  
**param** *shouldLoop* : Boolean. Whether or not the line should repeatedly travel from start to finish.
**/
function Line(start, end, time, loops){
	var that = Gibberish.Line(start, end, G.time(time), loops);
	
	return that;
}

function Follow(){
	if(arguments.length === 0) {
		G.log("Follow requires a dictionary of properties");
		return;
	}
	var that = Gibberish.Follow(arguments[0]);
	return that;
}

/**#Env- Modulation
A two-stage attack / decay envelope
## Example Usage##
`a = Sine();
l = Line(0, .5, _1, true);
a.mod("amp", l, "=");  
`
## Constructor
**param** *attack*: Integer in samples. The length of time in samples that it takes the envelope to reach its peak amplitude.
**param** *decay* : Integer in samples. The length of time in samples that it takes the envelope to decay from its peak to 0.
**/
/**###Env.run : method
Put the envelope at the start of its attack stage and run it.
**/
function Env(attack, decay){
	var that = Gibberish.Env(G.time(attack), G.time(decay));
	
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
