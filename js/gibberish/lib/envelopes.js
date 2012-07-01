define([], function() {
    return {
		init: function(gibberish) {						
			gibberish.generators.Env = gibberish.createGenerator(["attack",  "decay"], "{0}({1}, {2})" ),
			gibberish.make["Env"] = this.makeEnv;
			gibberish.Env = this.Env;
			
			gibberish.generators.ADSR = gibberish.createGenerator(["attack",  "decay", "sustain", "release", "attackLevel", "sustainLevel"], "{0}({1},{2},{3},{4},{5},{6})" ),
			gibberish.make["ADSR"] = this.makeADSR;
			gibberish.ADSR = this.ADSR;
		},
		
		Env : function(attack, decay) {
			var that = { 
				type:		"Env",
				category:	"Gen",
				attack:		attack || 10000,
				decay:		decay || 10000,

				run: function() {
					//that._function.setPhase(0);
					that._function.setState(0);
					that._function.setPhase(0);					
				},
			};
			Gibberish.extend(that, new Gibberish.ugen());
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Env\"]();");
			window[that.name] = Gibberish.make["Env"]();
			that._function = window[that.name];
			that._function.setState(2);
			
			Gibberish.defineProperties( that, ["attack", "decay"] );
	
			return that;
		},
		
		makeEnv : function() {
			var phase = 0;
			var state = 0;
			var output = function(attack,decay) {
				if(state === 0){
					var incr = 1 / attack;
					phase += incr;
					if(phase >=1) {
						state++;
					}
				}else if(state === 1){
					var incr = 1 / decay;
					phase -= incr;
					if(phase <= 0) state++;;			
				}
				return phase;
			};
			output.setPhase = function(newPhase) { phase = newPhase; };
			output.setState = function(newState) { state = newState; };
			output.getState = function() { return state; };						
			output.start = function() { phase = 0; state = 0; }
			
			return output;
		},
		
		ADSR : function(attack, decay, sustain, release, attackLevel, sustainLevel) {
			var that = { 
				type:		"ADSR",
				category:	"Gen",	
				attack:		attack || 10000,
				decay:		decay || 10000,
				release:	release || 10000,
				sustain: 	typeof sustain === "undefined" ? null : sustain,
				attackLevel:  attackLevel || 1,
				sustainLevel: sustainLevel || .5,

				trigger: function() {
					that._function.setPhase(0);
					that._function.setState(0);
				},
			};
			Gibberish.extend(that, new Gibberish.ugen());
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"ADSR\"]();");
			window[that.name] = Gibberish.make["ADSR"]();
			that._function = window[that.name];
			
			Gibberish.defineProperties( that, ["attack", "decay", "sustain", "release", "attackLevel", "sustainLevel"] );
	
			return that;
		},
		
		makeADSR : function() {
			var phase = 0;
			var state = 0;
			var output = function(attack,decay,sustain,release,attackLevel,sustainLevel) {
				var val = 0;
				if(state === 0){
					val = phase / attack * attackLevel;
					if(++phase / attack === 1) {
						state++;
						phase = decay;
					}
				}else if(state === 1) {
					val = phase / decay * (attackLevel - sustainLevel) + sustainLevel;
					if(--phase <= 0) {
						if(sustain !== null){
							state += 1;
							phase = sustain;
						}else{
							state += 2;
							phase = release;
						}
					}
				}else if(state === 2) {
					val = sustainLevel;
					if(phase-- === 0) {
						state++;
						phase = release;
					}
				}else if(state === 3) {
					val = (phase-- / release) * sustainLevel;
					if(phase === 0) state++;
				}
				return val;
			};
			output.setPhase = function(newPhase) { phase = newPhase; };
			output.setState = function(newState) { state = newState; phase = 0; };
			output.getState = function() { return state; };	
			
			return output;
		},		
    }
});