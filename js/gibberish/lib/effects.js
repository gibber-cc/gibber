define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.SoftClip = gibberish.createGenerator(["source", "amount", "amp"], "{0}( {1}, {2} ) * {3}");
			gibberish.make["SoftClip"] = this.makeSoftClip;
			gibberish.SoftClip = this.SoftClip;

			gibberish.generators.Filter24 = gibberish.createGenerator(["source", "cutoff", "resonance", "isLowPass"], "{0}( {1}, {2}, {3}, {4} )");
			gibberish.make["Filter24"] = this.makeFilter24;
			gibberish.Filter24 = this.Filter24;

			gibberish.generators.Delay = gibberish.createGenerator(["source", "time", "feedback"], "{0}( {1}, {2}, {3} )");
			gibberish.make["Delay"] = this.makeDelay;
			gibberish.Delay = this.Delay;

			gibberish.generators.Reverb = gibberish.createGenerator(["source", "roomSize", "damping", "wet", "dry" ], "{0}( {1},{2},{3},{4},{5} )");
			gibberish.make["Reverb"] = this.makeReverb;
			gibberish.Reverb = this.Reverb;

			gibberish.generators.AllPass = gibberish.createGenerator(["source", "time", "feedback"], "{0}( {1}, {2}, {3} )");
			gibberish.make["AllPass"] = this.makeAllPass;
			gibberish.AllPass = this.AllPass;

			gibberish.generators.Comb = gibberish.createGenerator(["source", "time", "feedback"], "{0}( {1}, {2}, {3} )");
			gibberish.make["Comb"] = this.makeComb;
			gibberish.Comb = this.Comb;
			
			gibberish.generators.BufferShuffler = gibberish.createGenerator(["source","chance", "rate", "length", "reverseChance", "pitchChance", "pitchMin", "pitchMax"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8} )");
			gibberish.make["BufferShuffler"] = this.makeBufferShuffler;
			gibberish.BufferShuffler = this.BufferShuffler;
			
			gibberish.generators.RingModulator = gibberish.createGenerator(["source", "frequency", "amp", "mix"], "{0}( {1}, {2}, {3}, {4} )");
			gibberish.make["RingModulator"] = this.makeRingModulator;
			gibberish.RingModulator = this.RingModulator;

			gibberish.generators.Decimator = gibberish.createGenerator(["source", "bitDepth", "sampleRate"], "{0}( {1}, {2}, {3} )");
			gibberish.make["Decimator"] = this.makeDecimator;
			gibberish.Decimator = this.Decimator;
			
			// sample, offset, feedback, delayModulationRate, delayModulationAmount
			gibberish.generators.Flanger = gibberish.createGenerator(["source", "offset", "feedback", "rate", "amount"], "{0}( {1}, {2}, {3}, {4}, {5} )");
			gibberish.make["Flanger"] = this.makeFlanger;
			gibberish.Flanger = this.Flanger;
			
			// the calls to dynamically create the bus generators are generated dynamically. that is fun to say.
			gibberish.make["Bus"] = this.makeBus;
			gibberish.Bus = this.Bus;
		},

		AllPass : function(time, feedback) {
			var that = {
				type:		"AllPass",
				category:	"FX",
				feedback:	feedback || .5,
				time:		time || 500,
				buffer:		new Float32Array(time || 500),
				source:		null,
			};
			Gibberish.extend(that, new Gibberish.ugen(that) );

			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"AllPass\"]();");
			window[that.name] = Gibberish.make["AllPass"](that.buffer, that.time, that.feedback);
			that._function = window[that.name];

			Gibberish.defineProperties( that, ["feedback"] );

			// todo: this doesn't seem to be working... the buffer might need to be resampled.
			(function(obj) {
				var _time = obj.time;
			    Object.defineProperty(that, "time", {
					get: function() { return _time; },
					set: function(value) {
						if(_time !== value) {
							_time = value;
							obj.buffer = new Float32Array(value);
							Gibberish.dirty(that);
						}
					},
				});
			})(that);

			return that;
		},

		makeAllPass : function(buffer, feedback) {
			//console.log("ALL PASS", _buffer.length, _feedback);
			var bufferLength = buffer.length;
			var index = -1;

			var output = function(inputSample) {
				index = ++index % bufferLength;
				var bufferSample = buffer[index];

				var out = -inputSample + bufferSample;
				buffer[index] = inputSample + (bufferSample * feedback);

				return out;
			};

			return output;
		},
		// adapted from audioLib.js, in turn adapted from Freeverb source code
		// NOTE : this is actually a lowpass-feedback-comb filter (https://ccrma.stanford.edu/~jos/pasp/Lowpass_Feedback_Comb_Filter.html)
		// TODO : rename accordingly?
		Comb : function(time, feedback, damping) {
			var that = {
				type:		"Comb",
				category:	"FX",
				feedback:	feedback || .84,
				time:		time || 1200,
				buffer:		new Float32Array(time || 1200),
				damping:	damping || .2,
				source:		null,
			};
			Gibberish.extend(that, new Gibberish.ugen(that));

			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Comb\"]();");
			window[that.name] = Gibberish.make["Comb"](that.buffer, that.feedback, that.damping);
			that._function = window[that.name];

			Gibberish.defineProperties( that, ["feedback"] );

			// todo: this doesn't seem to be working... the buffer might need to be resampled.
			// (function(obj) {
			// 	var _time = obj.time;
			//     Object.defineProperty(that, "time", {
			// 		get: function() { return _time; },
			// 		set: function(value) {
			// 			if(_time !== value) {
			// 				_time = value;
			// 				obj.buffer = new Float32Array(value);
			// 				that.dirty = true;
			// 				Gibberish.dirty = true;
			// 			}
			// 		},
			// 	});
			// })(that);

			return that;
		},

		makeComb : function(buffer, feedback, damping) {
			//console.log("COMB CHECK", _feedback, _damping, _buffer.length);
			var invDamping = 1 - damping;
			var time = buffer.length;
			var index = 0;
			var store = 0;

			var output = function(inputSample) {
				var currentPos = ++index % time;
				var sample = buffer[currentPos];
				store = (sample * .8) + (store * .2);
				buffer[currentPos] = inputSample + (store * feedback);

				return sample;
			};

			return output;
		},

		// adapted from audioLib.js
		Reverb : function(properties) {
			var that = {
				type:		"Reverb",
				category:	"FX",
				roomSize:	.5,
				damping:	.2223,
				wet:		.5,
				dry:		.55,				
				source:		null,
				tuning:		{
				    combCount: 		8,
				    combTuning: 	[1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617],

				    allPassCount: 	4,
				    allPassTuning: 	[556, 441, 341, 225],
				    allPassFeedback:0.5,

				    fixedGain: 		0.015,
				    scaleDamping: 	0.9,

				    scaleRoom: 		0.28,
				    offsetRoom: 	0.7,

				    stereoSpread: 	23
				},
				channelCount: 1,
			};
			Gibberish.extend(that, new Gibberish.ugen(that));
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			that.name = Gibberish.generateSymbol(that.type);

			that.combFilters = (function() {
				var combs	= [],
					num		= that.tuning.combCount,
					damp	= that.damping * that.tuning.scaleDamping,
					feed	= that.roomSize * that.tuning.scaleRoom + that.tuning.offsetRoom,
					sizes	= that.tuning.combTuning;

				for(var c = 0; c < that.channelCount; c++){
					for(var i = 0; i < 8; i++){
						combs.push( Gibberish.make["Comb"](new Float32Array(sizes[i] + c * that.tuning.stereoSpread), feed, damp) );
					}
				}
				return combs;
			})();;

			that.allPassFilters = (function() {
				var apfs = [],
				num		= that.tuning.allPassCount,
				feed	= that.tuning.allPassFeedback,
				sizes	= that.tuning.allPassTuning;

				for(var c = 0; c < that.channelCount; c++){
					for(var i = 0; i < num; i++){
						apfs.push( Gibberish.make["AllPass"](new Float32Array(sizes[i] + c * that.tuning.stereoSpread), feed) );
					}
				}
				return apfs;
			})();

			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Reverb\"]();");
			window[that.name] = Gibberish.make["Reverb"](that.combFilters, that.allPassFilters, that.tuning);
			that._function = window[that.name];

			Gibberish.defineProperties( that, ["time", "feedback"] );

			return that;
		},

		makeReverb : function(combFilters, allPassFilters, tuning) {
			var output = function(sample, roomSize, damping, wet, dry) {
				//if(phase++ % 500 == 0) console.log(roomSize, damping, wet, dry, input);			
				var input = sample * tuning.fixedGain;
				var out = 0;
				for(var i = 0; i < 8; i++) {
					out += combFilters[i](input);
				}

				for(var i = 0; i < 4; i++) {
					out = allPassFilters[i](out);
				}

				return out * wet + sample * dry;
			};

			return output;
		},

		Delay : function(time, feedback) {
			var that = {
				type:		"Delay",
				category:	"FX",
				feedback:	feedback || .5,
				time:		time || 22050,
				source:		null,
				buffer:		new Float32Array(88200),				
				bufferLength: 88200,
			};
			Gibberish.extend(that, new Gibberish.ugen(that));

			if(that.time >= 88200) {
				that.time = 88199;
				//console.log("MAX DELAY TIME = 88199 samples");
			}

			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Delay\"]();");
			window[that.name] = Gibberish.make["Delay"](that.buffer, that.bufferLength);
			that._function = window[that.name];

			Gibberish.defineProperties( that, ["time", "feedback"] );

			return that;
		},

		makeDelay : function(buffer, bufferLength) {
			var phase = 0;

			var output = function(sample, time, feedback) {
				var _phase = phase++ % bufferLength;

				var delayPos = (_phase + time) % bufferLength;				

				buffer[delayPos] = (sample + buffer[_phase]) * feedback;
				return sample + buffer[_phase];
			};

			return output;
		},


		SoftClip : function(amount, amp) {
			var that = {
				type:		"SoftClip",
				category:	"FX",
				amount:		amount,
				amp:		amp,
				source:		null,
			};
			Gibberish.extend(that, new Gibberish.ugen(that));

			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"SoftClip\"]();");
			window[that.name] = Gibberish.make["SoftClip"]();

			Gibberish.defineProperties( that, ["amount", "amp"] );

			return that;
		},

		makeSoftClip : function() {
			var abs = Math.abs;
			var log = Math.log;
			var ln2 = Math.LN2;

			var output = function(sample, amount) {
				var x = sample * amount;
				return (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
			};

			return output;
		},

		// adapted from Arif Ove Karlsne's 24dB ladder approximation: http://musicdsp.org/showArchiveComment.php?ArchiveID=141
		Filter24 : function(cutoff, resonance, isLowPass) {
			var that = {
				type:		"Filter24",
				category:	"FX",
				cutoff:		cutoff,
				resonance:	resonance,
				isLowPass:	typeof isLowPass === "undefined" ? true : isLowPass,
				source:		null,
			};
			Gibberish.extend(that, new Gibberish.ugen(that));

			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Filter24\"]();");
			window[that.name] = Gibberish.make["Filter24"]();

			Gibberish.defineProperties( that, ["cutoff", "resonance", "isLowPass"] );

			return that;
		},

		makeFilter24 : function() {
			var pole1 = 0,
				pole2 = 0,
				pole3 = 0,
				pole4 = 0;

			var output = function(sample, cutoff, resonance, isLowPass) {
				rez = pole4 * resonance; 

				if (rez > 1) {rez = 1;}
				sample = sample - rez;

				if (cutoff < 0) cutoff = 0;

				pole1 = pole1 + ((-pole1 + sample) * cutoff);
				pole2 = pole2 + ((-pole2 + pole1)  * cutoff);
				pole3 = pole3 + ((-pole3 + pole2)  * cutoff);
				pole4 = pole4 + ((-pole4 + pole3)  * cutoff);

				var out = isLowPass ? pole4 : sample - pole4;
				return out;
			};

			return output;
		},
		
		BufferShuffler : function(properties) {
			var that = {
				type:		"BufferShuffler",
				category:	"FX",
				chance: 	.25,		
				rate: 		11025,
				length:		22050,
				shouldRandomizeReverse : true,
				shouldRandomizePitch :   true,
				value : 0,
				readIndex : 0,
				writeIndex : -1,
				increment : 1,
				loopPhase : 0,
				isCrazy : false,
				crazyTime : 0,
				reverse : false,
				reverseChance : .5,
				pitchShifting : false,
				pitchChance : .5,
				pitchMin : .25,
				pitchMax : 2,
				mix : 1,
				phase : 0,
				fadeCount : 0,
				fading : false,
				shouldPrint : false,
			};
			
			Gibberish.extend(that, new Gibberish.ugen(that));
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}

			that.buffer = new Float32Array(that.length * 2);

			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"BufferShuffler\"]();");
			window[that.name] = Gibberish.make["BufferShuffler"](that.buffer);
			that._function = window[that.name];

			//Gibberish.defineProperties( that, ["time", "feedback"] );

			return that;
		},

		makeBufferShuffler : function(buffer) {
			var readIndex = 0;
			var writeIndex = 0;
			var randomizeCheckIndex = 0;
			var shuffleTimeKeeper = 0;
			var isShuffling = 0;
			var random = Math.random;
			var bufferLength = buffer.length;
			var fadeIndex = 0;
			var fadeAmount = 1;
			var isFadingWetIn = false;
			var isFadingDryIn = false;
			var reversed = false;
			var interpolate = Gibberish.interpolate;
			var pitchShifting = false;
			var speed = 1;

			
			var output = function(sample, chance, rate, length, reverseChance, pitchChance, pitchMin, pitchMax) {
				//if(writeIndex % 5000 === 0) console.log(chance, rate, length, randomizeCheckIndex);
				if(!isShuffling) {
					buffer[writeIndex++] = sample;
					writeIndex %= buffer.length;
					randomizeCheckIndex += !isShuffling;
					
					if(randomizeCheckIndex % rate == 0 && random() < chance) {
						reversed = random() < reverseChance;
						isShuffling = true;
						if(!reversed) {
							readIndex = writeIndex - length;
							if(readIndex < 0) readIndex = bufferLength + readIndex;
						}
						pitchShifting = random() < pitchChance;
						if(pitchShifting) {
							speed = window.rndf(pitchMin, pitchMax);
						}
						fadeAmount = 1;
						isFadingWetIn = true;
						isFadingDryIn = false;
						console.log("SHUFFLE");
					}
				}else if(++shuffleTimeKeeper % (length - 400) === 0) {
					isFadingWetIn = false;
					isFadingDryIn = true;
					fadeAmount = 1;
					shuffleTimeKeeper = 0;
				}
				
				var out, index;
				readIndex += reversed ? speed * -1 : speed;
				if(readIndex < 0) {
					readIndex += bufferLength;
				}else if( readIndex > bufferLength) {
					readIndex -= bufferLength;
				}
				var outSample = interpolate(buffer, readIndex);
				
				if(isFadingWetIn) {
					fadeAmount -= .0025;
					out = (outSample * (1 - fadeAmount)) + (sample * fadeAmount);
					if(fadeAmount <= .0025) isFadingWetIn = false;
				}else if(isFadingDryIn) {
					fadeAmount -= .0025;
					out = (outSample * (fadeAmount)) + (sample * (1 - fadeAmount));
					if(fadeAmount <= .0025) { 
						isFadingDryIn = false;
						isShuffling = false;
						reversed = false;
						speed = 1;
						pitchShifting = 0;
					}
				}else{
					out = isShuffling ? outSample : sample;
				}

				return out;
			};

			return output;
		},
		
		RingModulator : function(frequency, amp) {
			var that = {
				type:		"RingModulator",
				category:	"FX",
				frequency:	440,
				amp:		.5,
				mix:		.5,
				source:		null,
			};
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			that.modulation = Gibberish.make["Sine"]();
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"RingModulator\"]();");
			window[that.name] = Gibberish.make["RingModulator"](that.modulation);

			Gibberish.defineProperties( that, ["frequency", "amp", "mix"] );

			return that;
		},

		makeRingModulator : function(modulation) {	
			var phase = 0;
			var output = function(sample, frequency, amp, mix) {
				var x = modulation(frequency, amp);
				var wet = x * sample;
				var out = (wet * mix) + ( (1 - mix) * sample);
				
				return out;
			};

			return output;
		},
		
		
		// adapted from code / comments at http://musicdsp.org/showArchiveComment.php?ArchiveID=124
		Decimator : function(properties) {
			var that = {
				type:		"Decimator",
				category:	"FX",
				bitDepth:	16,
				sampleRate: 1,	// 44100 = 1
				source:		null,
			};
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			that.modulation = Gibberish.make["Sine"]();
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Decimator\"]();");
			window[that.name] = Gibberish.make["Decimator"](that.modulation);

			Gibberish.defineProperties( that, ["frequency", "bitDepth", "sampleRate"] );

			return that;
		},

		makeDecimator : function() {	
			var counter = 0;
			var hold = 0;
			var pow = Math.pow;
			var phase = 0;
			var floor = Math.floor;
			
			var output = function(sample, depth, rate) {
				counter += rate;
				
				if(counter >= 1) {
					var bitMult = pow( depth, 2.0 );
					
					counter -= 1;
					hold = floor( sample * bitMult )/ bitMult; 
				}
				
				return hold;
			};

			return output;
		},
		/*
			delayModulationDepth  	: amp of LFO for delay length modulation
			delayModulationRate		: speed of LFO to modulate delay length			
			delay  					: base time offset... LFO output is added to this value to get current read position
		*/
		Flanger : function(properties) {
			var that = {
				type:		"Flanger",
				category:	"FX",
				feedback:	.5,
				offset:		125,
				amount:		125,
				rate:		.25,
				source:		null,
				buffer:		new Float32Array(88200),				
				bufferLength: 88200,
			};
			
			Gibberish.extend(that, new Gibberish.ugen(that));
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			that.delayModulation = Gibberish.make["Sine"]();
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Flanger\"]();");
			window[that.name] = Gibberish.make["Flanger"](that.buffer, that.bufferLength, that.delayModulation, that.offset);
			that._function = window[that.name];

			Gibberish.defineProperties( that, ["amount", "feedback", "offset", "rate"] );

			return that;
		},

		makeFlanger : function(buffer, bufferLength, delayModulation, _offset) {
			var phase = 0;
			var readIndex = _offset * - 1;
			var writeIndex = 0;
			
			var output = function(sample, offset, feedback, delayModulationRate, delayModulationAmount) {
				var readPosition = readIndex++ + delayModulation(delayModulationRate, delayModulationAmount * .95);
				
				readIndex %= bufferLength;
				
				if(readPosition >= bufferLength) {
					readPosition -= bufferLength;
				}else if(readPosition < 0) {
					readPosition += bufferLength;
				}
				
				var delayedSample = Gibberish.interpolate(buffer, readPosition);
				
				buffer[writeIndex++] = sample + (delayedSample * feedback);
				writeIndex %= bufferLength;

				return sample + delayedSample;
			};

			return output;
		},
		
		Bus : function(effects) {
			var that = {
				senders : [],
				senderObjects: [],
				length	: 0,
				type	: "Bus",
				category: "Bus",
				amount	: 1,

				connect : function(bus) {
					this.destinations.push(bus);
					if(bus === Gibberish.MASTER) {
						Gibberish.connect(this);
					}else{
						bus.connectUgen(this, 1);
					}
					Gibberish.dirty(this);
					return this;
				},

				connectUgen : function(variable, amount) {
					amount = isNaN(amount) ? 1 : amount;
					
					this.senderObjects.push(variable);
					
					this.senders.push( { type:"*", operands:[variable, amount] } );
					
					variable.destinations.push(this);
					
					Gibberish.dirty(this);
				},
				
				disconnectUgen : function(ugen) {
					for(var i = 0; i < this.senders.length; i++) {
						if(this.senders[i].operands[0] === ugen) {
							this.senders.splice(i,1);
							this.senders.dirty = true;
							break;
						}
					}
					Gibberish.dirty(this);
				},

				send: function(bus, amount) {
					bus.connectUgen(this, amount);
				},
			};

			Gibberish.extend(that, new Gibberish.ugen(that));
			that.fx = effects || [];
			that.fx.parent = this;

			that.name = Gibberish.generateSymbol(that.type);
			//that.type = that.name;

			Gibberish.generators[that.type] = Gibberish.createGenerator(["senders"], "{0}( {1} )");

			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Bus\"]();");
			window[that.name] = Gibberish.make["Bus"](that.senders);

			//Gibberish.defineProperties( that, ["senders", "dirty"]);
			return that;
		},

		makeBus : function(_senders) { 
			var output = function(senders) {
				var out = 0;
				
				if(typeof senders !== "undefined") {
					for(var i = 0; i < senders.length; i++) {
						out += senders[i];
					}
				}

				return out;
			};

			return output;
		},
    }
});