define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Synth = gibberish.createGenerator(["frequency", "amp", "attack", "decay", "pan"], "{0}( {1}, {2}, {3}, {4}, {5} )");
			gibberish.make["Synth"] = this.makeSynth;
			gibberish.Synth = this.Synth;
			
			gibberish.PolySynth = this.PolySynth;
			
			gibberish.generators.FMSynth = gibberish.createGenerator(["frequency", "cmRatio", "index", "attack", "decay", "amp", "pan"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7})");
			gibberish.make["FMSynth"] = this.makeFMSynth;
			gibberish.FMSynth = this.FMSynth;
			
			gibberish.PolyFM = this.PolyFM;
			
			gibberish.generators.Synth2 = gibberish.createGenerator(["frequency", "amp", "attack", "decay", "sustain", "release", "attackLevel", "sustainLevel", "cutoff", "resonance", "filterMult", "isLowPass", "pan"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, {11}, {12}, {13} )");
			gibberish.make["Synth2"] = this.makeSynth2;
			gibberish.Synth2 = this.Synth2;
			
			gibberish.generators.Mono = gibberish.createGenerator(["frequency", "amp1", "amp2", "amp3", "attack", "decay", "cutoff", "resonance", "filterMult", "isLowPass", "amp", "detune2", "detune3", "octave2", "octave3", "pan"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, {11}, {12}, {13}, {14}, {15}, {16} )");
			gibberish.make["Mono"] = this.makeMono;
			gibberish.Mono = this.Mono;
			
			
			gibberish.PolySynth2 = this.PolySynth2;
		},
		
		Synth : function(properties) {
			var that = { 
				type:		"Synth",
				category:	"Gen",
				waveform:	"Triangle",
				amp:		.5,				
				attack:		22050,
				decay:		22050,
				frequency:	0,
				glide:		0,
				pan: 		0,
				channels:	2,
				
				note : function(_frequency) {
					if(typeof this.frequency === "object") {
						prevFreq = this.frequency.operands[0];
					}else{
						prevFreq = this.frequency;
					}
					
					this.frequency = _frequency;
					this._function.setFrequency(this.frequency);
					if(this.env.getState() > 0) this.env.setState(0);
				
					if(this.glide > 0) {
						this.mod("frequency", Line(_frequency - prevFreq, 0, this.glide), "-");
					
						var oldMod = this.mods[this.mods.length - 1];
						
						var me = this;
						future( function() { me.removeMod(oldMod) }, this.glide );
					}
					
				},
			};
			
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			that.env = Gibberish.make["Env"](that.attack, that.decay);
			that.osc = Gibberish.make[that.waveform](that.frequency, that.amp);
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Synth\"]();");	
			that._function = Gibberish.make["Synth"](that.osc, that.env); // only passs ugen functions to make
			window[that.symbol] = that._function;
			
			Gibberish.defineProperties( that, ["frequency", "amp", "attack", "decay", "pan"] );
				
		    Object.defineProperty(that, "waveform", {
				get: function() { return waveform; },
				set: function(value) {
					if(waveform !== value) {
						waveform = value;
						that.osc = Gibberish.make[value]();
						Gibberish.dirty(that);
					}
				},
			});

			
			return that;
		},
		
		makeSynth: function(osc, env) { // note, storing the increment value DOES NOT make this faster!
			var phase = 0;
			var _frequency = 0;
			var panner = Gibberish.pan();
			
			var output = function(frequency, amp, attack, decay, pan ) {
				var val = osc(frequency, amp, 0, 1) * env(attack, decay);
				//if(phase++ % 22050 === 0) console.log(val, amp);
				return panner(val, pan);
			}
			output.setFrequency = function(freq) 	{ _frequency = freq; };
			output.getFrequency = function() 		{ return _frequency; };
			
			return output;
		},
		
		PolySynth : function(properties) {
			var that = Gibberish.Bus();
			
			Gibberish.extend(that, {
				waveform:		"Triangle",
				amp:			.25,
				attack:			10000,
				decay:			10000,
				maxVoices:		5,
				voiceCount:		0,
				glide:			0,
				mod:			Gibberish.polyMod,
				removeMod:		Gibberish.removePolyMod,
				pan:			0,
				
				note : function(_frequency) {
					var synth = this.children[this.voiceCount++];
					if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
					
					synth.note(_frequency);
					
					return synth;
				},
			});
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			that.children = [];
			
			for(var i = 0; i < that.maxVoices; i++) {
				var props = {
					attack: 	that.attack,
					decay:		that.decay,
					waveform:	that.waveform, 
					amp: 1,
				};
				
				var synth = this.Synth(props);
				synth.send(that, 1);

				that.children.push(synth);
			}
			
			Gibberish.polyDefineProperties( that, ["waveform", "attack", "decay", "glide", "pan"] );
			
			// (function() {
			// 	var _amp = that.amp;
			// 	Object.defineProperty(that, "amp", {
			// 		get: function() { return _amp; },
			// 		set: function(value) {
			// 			_amp = value;
			// 			that.send(Master, value);
			// 		},
			// 	});
			// })();
			
			return that;
		},
		
		FMSynth : function(properties) {
			var that = { 
				type:		"FMSynth",
				category:	"Gen",
				amp:		.25,
				cmRatio:	2,
				index:		5,			
				attack:		22050,
				decay:		22050,
				frequency:	0,
				glide: 		0,
				pan:		0,
				
				note : function(frequency) {
					if(typeof this.frequency === "object") {
						prevFreq = this.frequency.operands[0];
					}else{
						prevFreq = this.frequency;
					}
					
					this.frequency = frequency;
					this._function.setFrequency(frequency);
					this.env.start();
					
					if(this.glide > 0) {
						this.mod("frequency", Line(frequency - prevFreq, 0, this.glide), "-");
					
						var oldMod = this.mods[this.mods.length - 1];
						
						var me = this;
						future( function() { me.removeMod(oldMod) }, this.glide );
					}
				},
			};
			Gibberish.extend(that, new Gibberish.ugen(that));

			that.env = Gibberish.make["Env"]();
			that.carrier = Gibberish.make["Sine"]();
			that.modulator = Gibberish.make["Sine"]();
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"FMSynth\"]();");
			that._function = Gibberish.make["FMSynth"](that.carrier, that.modulator, that.env);
			window[that.symbol] = that._function;
						
			Gibberish.defineProperties( that, ["amp", "attack", "decay", "cmRatio", "index", "frequency", "pan"] );
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			return that;
		},
		
		makeFMSynth: function(_carrier, _modulator, _env) { // note, storing the increment value DOES NOT make this faster!	
			var carrier = _carrier;
			var modulator = _modulator;
			var envelope = _env;
			var phase = 0;
			var _frequency = 0; // needed for polyfm
			var panner = Gibberish.pan();
			var output = function(frequency, cmRatio, index, attack, decay, amp, pan) {
				var env = envelope(attack, decay);
				var mod = modulator(frequency * cmRatio, frequency * index, 0, 1) * env;
				//if(phase++ % 22050 === 0) console.log("MOD AMOUNT", mod, cmRatio, index, frequency);
				return panner( carrier( frequency + mod, 1, 0, 1 ) * env * amp, pan ); 
			}
			output.setFrequency = function(freq) {
				_frequency = freq;
			};
			output.getFrequency = function() { return _frequency; }
			
	
			return output;
		},
		
		PolyFM : function(properties) {
			var that = Gibberish.Bus();
				
			Gibberish.extend(that, {
				amp:		 	.25,
				cmRatio:		2,
				index:		 	5,			
				attack:			22050,
				decay:			22050,
				maxVoices:		5,
				voiceCount:		0,
				glide:			0,
				mod:			Gibberish.polyMod,
				removeMod:		Gibberish.removePolyMod,
				pan:			0,
				
				note : function(_frequency) {
					var synth = this.children[this.voiceCount++];
					if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
					synth.note(_frequency);
				},
			});
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			that.children = [];
			
			for(var i = 0; i < that.maxVoices; i++) {
				var props = {
					attack: 	that.attack,
					decay:		that.decay,
					cmRatio:	that.cmRatio,
					index:		that.index,
					amp: 		1,
				};
				
				var synth = this.FMSynth(props);
				synth.send(that, 1);

				that.children.push(synth);
			}
			
			Gibberish.polyDefineProperties( that, ["cmRatio", "index", "attack", "decay", "glide", "pan"] );
			
			// (function() {
			// 	var _amp = that.amp;
			// 	Object.defineProperty(that, "amp", {
			// 		get: function() { return _amp; },
			// 		set: function(value) {
			// 			_amp = value;
			// 			that.send(Master, value);
			// 		},
			// 	});
			// })();
			
			return that;
		},		
		
		Synth2 : function(properties) {
			var that = { 
				type:			"Synth2",
				category:		"Gen",
				waveform:		"Triangle",
				amp:			.1,
				attack:			10000,
				decay:			10000,
				release:		10000,
				sustain: 		null,
				attackLevel:  	1,
				sustainLevel: 	.5,
				cutoff:			.2,
				resonance:		2.5,
				filterMult:		.3,
				isLowPass:		true,
				frequency:		0,
				glide:			0,
				
				note : function(_frequency) {
					if(typeof this.frequency === "object") {
						prevFreq = this.frequency.operands[0];
					}else{
						prevFreq = this.frequency;
					}
					this.frequency = _frequency;
					this._function.setFrequency(_frequency);
					if(this.env.getState() > 1) this.env.setState(0);
					
					if(this.glide > 0) {
						this.mod("frequency", Line(_frequency - prevFreq, 0, this.glide), "-");
					
						var oldMod = this.mods[this.mods.length - 1];
						
						var me = this;
						future( function() { me.removeMod(oldMod) }, this.glide );
					}	
				},
			};
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			//that.env = Gibberish.make["ADSR"](that.attack, that.decay, that.sustain, that.release, that.attackLevel, that.sustainLevel);
			that.env = Gibberish.make["Env"](that.attack, that.decay); //, that.sustain, that.release, that.attackLevel, that.sustainLevel);
			that.osc = Gibberish.make[that.waveform](that.frequency, that.amp);
			that.filter = Gibberish.make["Filter24"](that.cutoff, that.resonance, that.isLowPass);
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Synth2\"]();");	
			that._function = Gibberish.make["Synth2"](that.osc, that.env, that.filter);
			window[that.symbol] = that._function;
			
			Gibberish.defineProperties( that, ["frequency", "amp", "attack","decay","sustain","release","attackLevel","sustainLevel","cutoff","resonance","filterMult", "waveform", "isLowPass"] );
			
			var waveform = that.waveform;
		    Object.defineProperty(that, "waveform", {
				get: function() { return waveform; },
				set: function(value) {
					if(waveform !== value) {
						waveform = value;
						that.osc = Gibberish.make[value]();
						Gibberish.dirty(that);
					}
				},
			});
			
			return that;
		},
		
		makeSynth2: function(osc, env, filter) {
			var phase = 0;
			var _frequency = 0;

			var output = function(frequency, amp, attack, decay, sustain, release, attackLevel, sustainLevel, cutoff, resonance, filterMult, isLowPass) {
				//var envResult = env(attack, decay, sustain, release, attackLevel, sustainLevel);
				var envResult = env(attack, decay);
				var val = filter( osc(frequency, amp), cutoff + filterMult * envResult, resonance, isLowPass) * envResult;
				//var val = osc(frequency,amp) * envResult;
				//if(phase++ % 22050 === 0) console.log("SYNTH 2", val, amp, frequency, envResult);
				return val;
			};
			output.setFrequency = function(freq) {
				_frequency = freq;
			};
			output.getFrequency = function() { return _frequency; }
			
			return output;
		},
		
		PolySynth2 : function(properties) {
			var that = Gibberish.Bus();
				
			Gibberish.extend(that, {
				waveform:		"Triangle",
				amp:			.25,				
				attack:			10000,
				decay:			10000,
				release:		10000,
				sustain: 		null,
				attackLevel:  	1,
				sustainLevel: 	.5,
				cutoff:			.1,
				resonance:		2.5,
				filterMult:		 .3,
				isLowPass:		true,
				maxVoices:		5,
				voiceCount:		0,
				glide:			0,
				mod:			Gibberish.polyMod,
				removeMod:		Gibberish.removePolyMod,
					
				note : function(_frequency) {
					var synth = this.children[this.voiceCount++];
					if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
					synth.note(_frequency);
				},
			});
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			that.children = [];
			
			for(var i = 0; i < that.maxVoices; i++) {
				var props = {
					attack: 		that.attack,
					decay:			that.decay,
					release:		that.release,
					sustain:		that.sustain,
					attackLevel:	that.attackLevel,
					sustainLevel:	that.sustainLevel,	
					cutoff:			that.cutoff,
					resonance:		that.resonance,
					filterMult:		that.filterMult,
					isLowPass:		that.isLowPass,
					glide:			that.glide,
					amp: 			1,
				};
				
				var synth = this.Synth2(props);
				synth.send(that, 1);

				that.children.push(synth);
			}
			
			Gibberish.polyDefineProperties( that, ["frequency", "amp", "attack", "decay", "sustain", "release","attackLevel","sustainLevel","cutoff","resonance","filterMult", "waveform", "glide", "isLowPass"] );
			
			// (function() {
			// 	var _amp = that.amp;
			// 	Object.defineProperty(that, "amp", {
			// 		get: function() { return _amp; },
			// 		set: function(value) {
			// 			_amp = value;
			// 			that.send(Master, value);
			// 		},
			// 	});
			// })();
			
			return that;
		},
		
		Mono : function(properties) {
			var that = { 
				type:			"Mono",
				category:		"Gen",
				waveform:		"Saw",
				amp:		.6,
				amp1:			1,
				amp2:			1,
				amp3:			1,
				attack:			10000,
				decay:			10000,
				cutoff:			.2,
				resonance:		2.5,
				filterMult:		.3,
				isLowPass:		true,
				frequency:		0,
				frequency2:		0,
				frequency3:		0,
				detune2:		.01,
				octave2:		1,
				detune3:		-.01,
				octave3:		-1,
				glide:			0,
				
				note : function(_frequency) {
					var prevFreq, prevFreq2, prevFreq3
	
					prevFreq  = typeof this.frequency  === "object" ? this.frequency.operands[0]  : this.frequency;
					prevFreq2 = typeof this.frequency2 === "object" ? this.frequency2.operands[0] : this.frequency2;
					prevFreq3 = typeof this.frequency3 === "object" ? this.frequency3.operands[0] : this.frequency3;										
	
					this.frequency = _frequency;
					
					if(this.env.getState() > 0) this.env.setState(0);
					
					if(this.glide > 0) {
						this.mod("frequency", Line(_frequency - prevFreq, 0, this.glide), "-");
						var oldMod = this.mods[this.mods.length - 1];
						
						//if(typeof this.frequency2 === "object") console.log("ALERT");
						this.mod("frequency2", Line(this.frequency2 - prevFreq2, 0, this.glide), "-");
						var oldMod2 = this.mods[this.mods.length - 1];
						
						this.mod("frequency3", Line(this.frequency3 - prevFreq3, 0, this.glide), "-");						
						var oldMod3 = this.mods[this.mods.length - 1];
																	
						var me = this;
						future( function() { me.removeMod(oldMod); me.removeMod(oldMod2); me.removeMod(oldMod3); }, this.glide );
					}	
				},
			};
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			that.env  = Gibberish.make["Env"](that.attack, that.decay);
			that.filter = Gibberish.make["Filter24"](that.cutoff, that.resonance, that.isLowPass);
			that.osc1 = Gibberish.make[that.waveform](that.frequency,  that.amp1);
			that.osc2 = Gibberish.make[that.waveform](that.frequency2, that.amp2);
			that.osc3 = Gibberish.make[that.waveform](that.frequency3, that.amp3);
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Mono\"]();");	
			that._function = Gibberish.make["Mono"](that.osc1, that.osc2, that.osc3, that.env, that.filter);
			window[that.symbol] = that._function;
			
			Gibberish.defineProperties( that, ["amp", "frequency", "amp1", "amp2", "amp3", "attack", "decay", "cutoff", "resonance", "filterMult", "isLowPass", "detune2", "detune3", "octave2", "octave3"] );
			
			// var waveform = that.waveform;
			// 		    Object.defineProperty(that, "waveform", {
			// 	get: function() { return waveform; },
			// 	set: function(value) {
			// 		if(waveform !== value) {
			// 			waveform = value;
			// 			that.osc = Gibberish.make[value]();
			// 			Gibberish.dirty(that);
			// 		}
			// 	},
			// });
			
			return that;
		},
		
		makeMono: function(osc1, osc2, osc3, env, filter) {
			var phase = 0;
			var output = function(frequency, amp1, amp2, amp3, attack, decay, cutoff, resonance, filterMult, isLowPass, masterAmp, detune2, detune3, octave2, octave3) {
				var frequency2 = frequency;
				if(octave2 > 0) {
					for(var i = 0; i < octave2; i++) {
						frequency2 *= 2;
					}
				}else if(octave2 < 0) {
					for(var i = 0; i > octave2; i--) {
						frequency2 /= 2;
					}
				}
					
				var frequency3 = frequency;
				if(octave3 > 0) {
					for(var i = 0; i < octave3; i++) {
						frequency3 *= 2;
					}
				}else if(octave3 < 0) {
					for(var i = 0; i > octave3; i--) {
						frequency3 /= 2;
					}
				}
				
				frequency2 += detune2 > 0 ? ((frequency * 2) - frequency) * detune2 : (frequency - (frequency / 2)) * detune2;
				frequency3 += detune3 > 0 ? ((frequency * 2) - frequency) * detune3 : (frequency - (frequency / 2)) * detune3;
							
				var oscValue = osc1(frequency, amp1) + osc2(frequency2, amp2) + osc3(frequency3, amp3);
				var envResult = env(attack, decay);
				var val = filter( oscValue, cutoff + filterMult * envResult, resonance, isLowPass) * envResult;
				
				return val * masterAmp;
			};
	
			return output;
		},
		
    }
});