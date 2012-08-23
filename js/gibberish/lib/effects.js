define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.SoftClip = Gen({
				name:"SoftClip",
				acceptsInput:true,	
				props:{ amount: 50 },
				upvalues: { abs:Math.abs, log:Math.log, ln2:Math.LN2 },
				
				callback : function(sample, amount) {
					if(typeof sample[0] === "undefined") {
						var x = sample * amount;
						return (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
					}else{
						var x = [sample[0] * amount, sample[1] * amount];
						var l = log(amount) / ln2;
						x[0] = (x[0] / 1 + abs(x[0])) / l;
						x[1] = (x[1] / 1 + abs(x[1])) / l;						
						return x;
					}
				},
			});
	
			gibberish.Gain = Gen({
				name:"Gain",
				acceptsInput:true,	
				props:{ amp: 1 },
				
				callback: function(sample, amp) {
					if(typeof sample[0] === "undefined") {
						return sample * amp;
					}else{
						return [sample[0] * amp, sample[1] * amp];
					}
				},
			});
			
			gibberish.Delay = Gen({
				name:"Delay",
				acceptsInput:true,	
				props:{ time: 22050, feedback: .5, channels:2 },
				upvalues: { buffer:null, bufferLength:88200, phase:0 },
				
				callback : function(sample, time, feedback, channels) {
					var _phase = phase++ % bufferLength;

					var delayPos = (_phase + time) % bufferLength;				
					
					if(typeof sample[0] === "undefined") {
						buffer[delayPos] = (sample + buffer[_phase]) * feedback;
						return sample + buffer[_phase];
					}else{
						buffer[0][delayPos] = (sample[0] + buffer[0][_phase]) * feedback;
						buffer[1][delayPos] = (sample[1] + buffer[1][_phase]) * feedback;
						//buffer[delayPos] = ((sample[0] + sample[1]) / 2 + buffer[_phase]) * feedback;
						return [sample[0] + buffer[0][_phase], sample[1] + buffer[1][_phase]];
					}
				},
				
				init: function() {
					if(this.channels === 1) {
						this.function.setBuffer(new Float32Array(88200));
					}else{
						this.function.setBuffer( [new Float32Array(88200), new Float32Array(88200)] );
					}
					if(this.time > 88200) {
						this.time = 88200;
						console.log("WARNING: Delays cannot be greater than two seconds in length.");
					}
				},
			});
			
			gibberish.RingModulator = Gen({
				name:"RingModulator",
				acceptsInput:true,	
				props:{ frequency: 440, amp: .5, mix:.5,  },
				upvalues: { modulation:gen("Sine") },
				
				callback: function(sample, frequency, amp, mix) {
					var x = modulation(frequency, amp);
					var out;
					if(typeof sample[0] === "undefined") {
						var wet = x * sample;
						out = (wet * mix) + ( (1 - mix) * sample);
					}else{
						var wet1 = x * sample[0];
						var wet2 = x * sample[1];
						out = [(wet1 * mix) + ( (1 - mix) * sample[0]), (wet2 * mix) + ( (1 - mix) * sample[1])];
					}
					return out;
				},
			});
			
			// adapted from Arif Ove Karlsne's 24dB ladder approximation: http://musicdsp.org/showArchiveComment.php?ArchiveID=141
			gibberish.Filter24 = Gen({
				name:"Filter24",
				acceptsInput:true,	
				props:{ cutoff:.1, resonance: 3, isLowPass:true },
				upvalues: { pole1:0, pole2:0, pole3:0, pole4:0, pole11:0, pole22:0, pole33:0, pole44:0 },
				
				callback : function(sample, cutoff, resonance, isLowPass) {
					var out;
					if(typeof sample[0] === "undefined") {
						var rez = pole4 * resonance; 
						rez = rez > 1 ? 1 : rez;
						
						sample = sample - rez;

						cutoff = cutoff < 0 ? 0 : cutoff;
						cutoff = cutoff > 1 ? 1 : cutoff;

						pole1 = pole1 + ((-pole1 + sample) * cutoff);
						pole2 = pole2 + ((-pole2 + pole1)  * cutoff);
						pole3 = pole3 + ((-pole3 + pole2)  * cutoff);
						pole4 = pole4 + ((-pole4 + pole3)  * cutoff);

						out = isLowPass ? pole4 : sample - pole4;
					}else{
						out = [];
						var rezz = pole44 * resonance; 
						rezz = rezz > 1 ? 1 : rezz;
						
						cutoff = cutoff < 0 ? 0 : cutoff;
						cutoff = cutoff > 1 ? 1 : cutoff;
						
						sample[0] = sample[0] - rezz;

						pole11 = pole11 + ((-pole11 + sample[0]) * cutoff);
						pole22 = pole22 + ((-pole22 + pole11)  * cutoff);
						pole33 = pole33 + ((-pole33 + pole22)  * cutoff);
						pole44 = pole44 + ((-pole44 + pole33)  * cutoff);

						out[0] = isLowPass ? pole44 : sample[0] - pole44;
						
						rez = pole4 * resonance; 
						rez = rez > 1 ? 1 : rez;
						
						sample[1] = sample[1] - rez;

						pole1 = pole1 + ((-pole1 + sample[1]) * cutoff);
						pole2 = pole2 + ((-pole2 + pole1)  * cutoff);
						pole3 = pole3 + ((-pole3 + pole2)  * cutoff);
						pole4 = pole4 + ((-pole4 + pole3)  * cutoff);

						out[1] = isLowPass ? pole4 : sample[1] - pole4;
					}
					return out;
				},
			});
			
			// adapted from code / comments at http://musicdsp.org/showArchiveComment.php?ArchiveID=124
			gibberish.Decimator = Gen({
				name:"Decimator",
				acceptsInput:true,	
				props:{ bitDepth: 16, sampleRate: 1 },
				upvalues: { counter: 0, hold:0, holdd:0, pow:Math.pow, floor:Math.floor},
				
				callback : function(sample, depth, rate) {
					counter += rate;
					
					if(typeof sample[0] === "undefined") {
						if(counter >= 1) {
							var bitMult = pow( depth, 2.0 );
					
							counter -= 1;
							hold = floor( sample * bitMult )/ bitMult; 
						}
						return hold;
					}else{
						if(counter >= 1) {
							var bitMult = pow( depth, 2.0 );
					
							counter -= 1;
							hold  = floor( sample[0] * bitMult )/ bitMult;
							holdd = floor( sample[1] * bitMult )/ bitMult;
							
						}
						return [hold, holdd];
					}
				
				},
			});
			
			gibberish.Flanger = Gen({
				name:"Flanger",
				acceptsInput:true,	
				props:{ offset:300, feedback:0, rate:.25, amount:100 },
				upvalues: { 
					buffer:				null,
					bufferLength:		88200,
					delayModulation:	gen("Sine"),
					interpolate:		Gibberish.interpolate,
					readIndex:			-300,
					writeIndex:			0,
					phase:				0,
				},
				
				init : function() {
					this.buffer = new Float32Array(88200);
					this.function.setBuffer(this.buffer);
				},
				
				callback : function(sample, offset, feedback, delayModulationRate, delayModulationAmount) {
					var delayIndex = readIndex + delayModulation(delayModulationRate, delayModulationAmount * .95);
								
					if(delayIndex > bufferLength) {
						delayIndex -= bufferLength;
					}else if(delayIndex < 0) {
						delayIndex += bufferLength;
					}
								
					var delayedSample = interpolate(buffer, delayIndex);
									
					// TODO: no, feedback really is broekn. sigh.
					//var writeValue = sample + (delayedSample * feedback);
					//if(writeValue > 1 || isNaN(writeValue) || writeValue < -1) { console.log("WRITE VALUE", writeValue); }
									
					// TODO: this shouldn't be necessary, but writeValue (when using feedback) sometimes returns NaN
					// for reasons I can't figure out. 
					buffer[writeIndex] = sample; //isNaN(writeValue) ? sample : writeValue;
									
					if(++writeIndex >= bufferLength) writeIndex = 0;
					if(++readIndex  >= bufferLength) readIndex  = 0;				
									
					return sample + delayedSample;
					// 		//from old Gibber back when it worked correctly...
					// 		var r = this.readIndex + this.delayMod.out();
					// 		if(r > this.bufferSize) {
					// 			r = r - this.bufferSize;
					// 		}else if(r < 0) {
					// 			r = this.bufferSize + r;
					// 		}
					// 
					// 		var s = Sink.interpolate(this.buffer, r);
					// 
					// 		this.buffer[this.writeIndex++] = sample + (s * this.feedback);
					// 		if (this.writeIndex >= this.bufferSize) {
					// 			this.writeIndex = 0;
					// 		}
					// 
					// 		this.readIndex++;
					// 		if (this.readIndex >= this.bufferSize) {
					// 			this.readIndex = 0;
					// 		}
					// 
					// 		this.value = s + sample;
				},	
			});

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
			
			gibberish.generators.Bus = gibberish.createGenerator(["senders", "amp"], "{0}( {1}, {2} )");
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

			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"AllPass\"]();");
			window[that.symbol] = Gibberish.make["AllPass"](that.buffer, that.time, that.feedback);
			that._function = window[that.symbol];

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

			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Comb\"]();");
			window[that.symbol] = Gibberish.make["Comb"](that.buffer, that.feedback, that.damping);
			that._function = window[that.symbol];

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
			
			that.symbol = Gibberish.generateSymbol(that.type);

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

			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Reverb\"]();");
			window[that.symbol] = Gibberish.make["Reverb"](that.combFilters, that.allPassFilters, that.tuning);
			that._function = window[that.symbol];

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
		
// gibberish.generators.BufferShuffler = gibberish.createGenerator(["source","chance", "rate", "length", "reverseChance", "pitchChance", "pitchMin", "pitchMax"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8} )");
		
		BufferShuffler : function(properties) {
			var that = {
				type:		"BufferShuffler",
				category:	"FX",
				chance: 	.25,		
				rate: 		11025,
				length:		22050,
				reverseChance : .5,
				pitchChance : .5,
				pitchMin : .25,
				pitchMax : 2,
				mix : 1,
			};
			
			Gibberish.extend(that, new Gibberish.ugen(that));
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}

			that.buffer = new Float32Array(that.length * 2);

			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"BufferShuffler\"]();");
			window[that.symbol] = Gibberish.make["BufferShuffler"](that.buffer);
			that._function = window[that.symbol];

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
			var init = 0;

			
			var output = function(sample, chance, rate, length, reverseChance, pitchChance, pitchMin, pitchMax) {
				//if(writeIndex % 5000 === 0) console.log(chance, rate, length, randomizeCheckIndex);
				if(!isShuffling) {
					buffer[writeIndex++] = sample;
					writeIndex %= buffer.length;
					
					init = writeIndex === 0 ? 1 : init; // don't output buffered audio until a buffer is full... otherwise you just get a gap
					
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
					out = isShuffling && init ? outSample : sample;
				}

				return out;
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
				amp	: 1,
				channels : 2,

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
					
					if(this.senderObjects.indexOf(variable) === -1) {
						this.senderObjects.push(variable);

						this.senders.push( { type:"*", operands:[variable, amount] } );

						variable.destinations.push(this);
					}else{
						for(var i = 0; i < this.senders.length; i++) {
							var sender = this.senders[i];
							if(sender.operands[0] === variable) {
								sender.operands[1] = amount;
							}
						}
					}
					
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
					if(typeof this.senderObjects !== "undefined") {
						for(var i = 0; i < this.senderObjects.length; i++) {
							if(this.senderObjects[i] === ugen) {
								this.senderObjects.splice(i,1);
								break;
							}
						}
					}
					
					Gibberish.dirty(this);
				},

				send: function(bus, amount) {
					bus.connectUgen(this, amount);
				},
			};

			Gibberish.extend( that, new Gibberish.ugen(that) );
			that.fx = effects || [];
			that.fx.parent = this;
			
			that.mod = Gibberish.polyMod;
			that.removeMod = Gibberish.removePolyMod;
			
			that.symbol = Gibberish.generateSymbol( that.type );

			Gibberish.masterInit.push( that.symbol + " = Gibberish.make[\"Bus\"]();" );
			window[that.symbol] = Gibberish.make["Bus"]();
			
			Gibberish.defineProperties( that, ["amp"] );
			return that;
		},

		makeBus : function() { 
			var phase = 0;
			var output = function(senders, amp) {
				var out = [0,0];
				
				if(typeof senders !== "undefined") {
					for(var i = 0; i < senders.length; i++) {
						if(typeof senders[i] === "object") {
							//if(phase++ % 10000 === 0) console.log("OBJECT", senders[i][0], senders[i][1], amp);
							out[0] += senders[i][0];
							out[1] += senders[i][1];
						}else{
							//if(phase++ % 10000 === 0) console.log("NON-OBJECT", senders);
							
							out[0] += out[1] = senders[i];
						}
					}
				}
				out[0] *= amp;
				out[1] *= amp;
				return out;
			};

			return output;
		},
    }
});