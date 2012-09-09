define([], function() {
    return {
		init: function(gibberish) {
			gibberish.SoftClip = Gen({
				name:"SoftClip",
				acceptsInput:true,	
				props:{ amount: 50, channels:1 },
				upvalues: { abs:Math.abs, log:Math.log, ln2:Math.LN2, isStereo:null },
				
				callback : function(sample, amount, channels) {
					for(var channel = 0; channel < channels; channel++) {
						var x = sample[channel] * amount;
						sample[channel] = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
					}
					return sample;
				},
			});
	
			gibberish.Gain = Gen({
				name:"Gain",
				acceptsInput:true,	
				props:{ amp: 1, channels: 1, },
				
				callback: function(sample, amp, channels) {
					for(var channel = 0; channel < channels; channel++) {
						sample[channel] *= amp;
					}
					return sample;
				},
			});
			
			gibberish.Delay = Gen({
				name:"Delay",
				acceptsInput:true,	
				props:{ time: 22050, feedback: .5, channels:1 },
				upvalues: { buffers:null, bufferLength:88200, phase:0 },
				
				callback : function(sample, time, feedback, channels) {
					var _phase = phase++ % bufferLength;

					var delayPos = (_phase + time) % bufferLength;			
					
					for(var channel = 0; channel < channels; channel++) {
						buffers[channel][delayPos] =  (sample[channel] + buffers[channel][_phase]) * feedback;
						sample[channel] += buffers[0][_phase];
					}
					return sample;
				},
				
				init: function() {
					var buffers = [];
					for(var i = 0; i < this.channels; i++) {
						buffers.push( new Float32Array(88200) );
					}
					this.function.setBuffers(buffers);
					
					if(this.time > 88200) {
						this.time = 88200;
						console.log("WARNING: Delays cannot be greater than two seconds in length.");
					}
				},
				setters : {
					channels : function(val) {
						var buffers = this.function.getBuffers();
						if(val >= buffers.length) {
							for(var i = 0; i < val - buffers.length; i++) {
								buffers.push(new Float32Array(88200));
							}
						}
					}
				}
			});
			
			gibberish.RingModulator = Gen({
				name:"RingModulator",
				acceptsInput:true,	
				props:{ frequency: 440, amp: .5, mix:.5, channels:1 },
				upvalues: { modulation:gen("Sine") },
				
				callback: function(sample, frequency, amp, mix, channels) {
					var x = modulation(frequency, amp, 1)[0];
					for(var channel = 0; channel < channels; channel++) {
						var wet = x * sample[channel];
						sample[channel] = (wet * mix) + (1 - mix) * sample[channel];
					}
					return sample;
				},
			});
			
			// adapted from Arif Ove Karlsne's 24dB ladder approximation: http://musicdsp.org/showArchiveComment.php?ArchiveID=141
			gibberish.Filter24 = Gen({
				name:"Filter24",
				acceptsInput:true,	
				props:{ cutoff:.1, resonance: 3, isLowPass:true, channels:1 },
				upvalues: { pole1:0, pole2:0, pole3:0, pole4:0, pole11:0, pole22:0, pole33:0, pole44:0 },
				
				callback : function(sample, cutoff, resonance, isLowPass, channels) {
					for(var channel = 0; channel < channels; channel++) {
						var rezz = pole44 * resonance; 
						rezz = rezz > 1 ? 1 : rezz;
						
						cutoff = cutoff < 0 ? 0 : cutoff;
						cutoff = cutoff > 1 ? 1 : cutoff;
						
						sample[channel] = sample[channel] - rezz;

						pole11 = pole11 + ((-pole11 + sample[channel]) * cutoff);
						pole22 = pole22 + ((-pole22 + pole11)  * cutoff);
						pole33 = pole33 + ((-pole33 + pole22)  * cutoff);
						pole44 = pole44 + ((-pole44 + pole33)  * cutoff);

						sample[channel] = isLowPass ? pole44 : sample[channel] - pole44;
					}
					return sample;
				},
			});
			
			// adapted from code / comments at http://musicdsp.org/showArchiveComment.php?ArchiveID=124
			gibberish.Decimator = Gen({
				name:"Decimator",
				acceptsInput:true,	
				props:{ bitDepth: 16, sampleRate: 1, channels:1 },
				upvalues: { counter: 0, hold:[], pow:Math.pow, floor:Math.floor},
				
				callback : function(sample, depth, rate, channels) {
					counter += rate;
					
					for(var channel = 0; channel < channels; channel++) {
						if(counter >= 1) {
							var bitMult = pow( depth, 2.0 );
							hold[channel]  = floor( sample[channel] * bitMult ) / bitMult;
							counter--;
						}
						sample[channel] = hold[channel];
					}
					
					return sample;
				},

			});
			
			gibberish.Flanger = Gen({
				name:"Flanger",
				acceptsInput:true,	
				props:{ offset:300, feedback:0, rate:.25, amount:300, channels:1 },
				upvalues: { 
					buffers:			null,
					bufferLength:		88200,
					delayModulation:	gen("Sine"),
					interpolate:		Gibberish.interpolate,
					readIndex:			-100,
					writeIndex:			0,
					phase:				0,
				},
				init : function() {
					this.function.setReadIndex( this.offset * -1);
					this.buffers = [];
					for(var i = 0; i < this.channels; i++) {
						this.buffers.push( new Float32Array(88200) );
					}
					this.function.setBuffers(this.buffers);

				},
				setters : {
					channels : function(val) {
						var buffers = this.function.getBuffers();
						if(val >= buffers.length) {
							for(var i = 0; i < val - buffers.length; i++) {
								buffers.push(new Float32Array(88200));
							}
						}
					}
				},
				callback : function(sample, offset, feedback, delayModulationRate, delayModulationAmount, channels) {
					var delayIndex = readIndex + delayModulation(delayModulationRate, delayModulationAmount * .95, 1)[0];

					if(delayIndex > bufferLength) {
						delayIndex -= bufferLength;
					}else if(delayIndex < 0) {
						delayIndex += bufferLength;
					}
					
					for(var channel = 0; channel < channels; channel++) {
						var delayedSample = interpolate(buffers[channel], delayIndex);
									
						buffers[channel][writeIndex] = sample[channel];
						
						sample[channel] += delayedSample;
					}

					if(++writeIndex >= bufferLength) writeIndex = 0;
					if(++readIndex  >= bufferLength) readIndex  = 0;

					return sample;
				},	
			});
			
			gibberish.BufferShuffler = Gen({
				name:"BufferShuffler",
				acceptsInput: true,
				props: { chance:.25, rate:11025, length:22050, reverseChange:.5, pitchChance:.5, pitchMin:.25, pitchMax:2, channels:1 },
				upvalues: {
					buffers : null,
					readIndex : 0,
					writeIndex : 0,
					randomizeCheckIndex : 0,
					shuffleTimeKeeper : 0,
					isShuffling : 0,
					random : Math.random,
					bufferLength : 88200,
					fadeIndex : 0,
					fadeAmount : 1,
					isFadingWetIn : false,
					isFadingDryIn : false,
					reversed : false,
					interpolate : Gibberish.interpolate,
					pitchShifting : false,
					speed : 1,
					isBufferFull : false,
				},
				
				init: function() {
					this.buffers = [];
					for(var i = 0; i < this.channels; i++) {
						this.buffers.push( new Float32Array(88200) );
					}
					this.function.setBuffers(this.buffers);
				},
				setters : {
					channels : function(val) {
						var buffers = this.function.getBuffers();
						if(val >= buffers.length) {
							for(var i = 0; i < val - buffers.length; i++) {
								buffers.push(new Float32Array(88200));
							}
						}
					}
				},
				callback : function(sample, chance, rate, length, reverseChance, pitchChance, pitchMin, pitchMax, channels) {
					if(!isShuffling) {
						for(var channel = 0; channel < channels; channel++) {
							buffers[channel][writeIndex] = sample[channel];
						}
						writeIndex++
						writeIndex %= bufferLength;

						isBufferFull = writeIndex === 0 ? 1 : isBufferFull; // don't output buffered audio until a buffer is full... otherwise you just get a gap
						
						randomizeCheckIndex++;

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
					
					readIndex += reversed ? speed * -1 : speed;
					if(readIndex < 0) {
						readIndex += bufferLength;
					}else if( readIndex > bufferLength) {
						readIndex -= bufferLength;
					}
					
					for(var channel = 0; channel < channels; channel++) {
						var outSample = interpolate(buffers[channel], readIndex);
						
						if(isFadingWetIn) {						
							fadeAmount -= .0025;
							sample[channel] = (outSample * (1 - fadeAmount)) + (sample[channel] * fadeAmount);
							if(fadeAmount <= .0025) isFadingWetIn = false;
						}else if(isFadingDryIn) {						
							fadeAmount -= .0025;
							sample[channel] = (outSample * (fadeAmount)) + (sample[channel] * (1 - fadeAmount));
							
							if(fadeAmount <= .0025) { 
								isFadingDryIn = false;
								isShuffling = false;
								reversed = false;
								speed = 1;
								pitchShifting = 0;
							}
						}else{
							sample[channel] = isShuffling && isBufferFull ? outSample : sample[channel];
						}
					}
					return sample;
				},
			});
			
			// adapted from audioLib.js, in turn adapted from Freeverb source code
			// https://ccrma.stanford.edu/~jos/pasp/Lowpass_Feedback_Comb_Filter.html)
			gibberish.LowPassComb = Gen({
				name:"LowPassComb",
				acceptsInput: true,
				props: { time:1200 },
				upvalues:{
					buffers:new Float32Array(1200),
					index : 0,
					store : [0,0,0,0,0,0,0,0],
					channels : 1,
					feedback: .84,
					bufferLength: null,
					damping:.2,
				},
				init: function() {
					var buffers = [];
					for(var i = 0; i < this.channels; i++) {
						buffers.push( new Float32Array(this.time) );
					}
					this.function.setBuffers(buffers);
					//console.log(this.function.getBuffers());
					this.function.setBufferLength(this.time);
					this.function.setStore([0,0,0,0,0,0,0,]);
				},
				setters : {
					channels : function(val) {
						var buffers = this.function.getBuffers();
						if(val >= buffers.length) {
							for(var i = 0; i < val - buffers.length; i++) {
								buffers.push(new Float32Array(this.time));
							}
						}
						this.function.setBuffers(buffers);
					}
				},
				callback: function(sample) {
					var currentPos = ++index % bufferLength;
					for(var channel = 0; channel < channels; channel++) {
						//console.log(buffers, channel, channels);
						//if(index % 22050 === 0) console.log('pos', currentPos);
						var out = buffers[0][currentPos];
						//if(index % 22050 === 0) console.log("out",out);
						
						store[channel] = (out * .8) + (store[channel] * .2);
						//if(index % 22050 === 0) console.log("store", store[channel]);
						
						buffers[channel][currentPos] = sample[channel] + (store[channel] * feedback);
						sample[channel] = out;	
					}
					//if(index % 22050 === 0) console.log(sample);
					return sample;
				},
			});
			/*
			gibberish.AllPass = Gen({
				name:"AllPass",
				acceptsInput: true,
				props: {  channels:1, time:500,  },
				upvalues: { 
					feedback:.5,
					buffers: null,
					index:-1,
					bufferLength:500,
				},
				
				init: function() {
					var buffers = [];
					for(var i = 0; i < this.channels; i++) {
						buffers.push( new Float32Array(this.time) );
					}
					this.function.setBuffers(buffers);
					this.function.setBufferLength(this.time);
				},
				setters : {
					channels : function(val) {
						var buffers = this.function.getBuffers();
						if(val >= buffers.length) {
							for(var i = 0; i < val - buffers.length; i++) {
								buffers.push(new Float32Array(this.time));
							}
						}
						this.function.setBuffers(buffers);
					}
				},
				callback: function(sample, channels) {
					index = ++index % bufferLength;
					
					for(var channel = 0; channel < channels; channel++) {
						var bufferSample = buffers[channel][index];
						//if(index % 10000 === 0) console.log(bufferSample);

						var out = -1 * sample[channel] + bufferSample;
						buffers[channel][index] = sample[channel] + (bufferSample * feedback);
						
						sample[channel] = out;
					}
					
					return sample;
				},
			});
			// TODO: this is vastly less efficient than the "old" version (which is still being used as Reverb). Why?
			// seems like it would have to be a problem with upvalues...
			/*gibberish.Reverb = Gen({
				name: "Reverb",
				acceptsInput : true,
				props: { roomSize:.5, damping:.2223, wet:.5, dry:.55, channels:1 },
				upvalues: {
					tuning:	{
					    combCount: 		8,
					    combTuning: 	[1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617],

					    allPassCount: 	4,
					    allPassTuning: 	[556, 441, 341, 225],
					    allPassFeedback:0.5,

					    fixedGain: 		0.015,
					    scaleDamping: 	0.9,

					    scaleRoom: 		0.28,
					    offsetRoom: 	0.7,

					    stereoSpread: 	23,
					},
					phase : 0,
					combFilters : null,
					allPassFilters : null,
					apf1:null,apf2:null,apf3:null,apf0:null,
					//apf1:gen("AllPass", true),apf2:gen("AllPass", true),apf3:gen("AllPass", true),apf0:gen("AllPass", true),
					apf5:null,apf6:null,apf7:null,apf4:null,
				},
				init : function() {
					var combFilters = (function(that) {
						var combs	= [],
							num		= 8,
							damp	= that.damping *  .9,
							feed	= that.roomSize * .28 + .7,
							sizes	= [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];

						for(var c = 0; c < that.channels; c++){
							combs[c] = [];
							for(var i = 0; i < 8; i++){
								var comb = Gibberish.LowPassComb(sizes[i] + c * 23);
								comb.function.setFeedback(feed);
								comb.function.setDamping(damp);
								combs[c].push( comb.function );
							}
						}
						return combs;
					})(this);
					//console.log(this.function);
					//var allPassFilters = (function(that) {
						var apfs = [],
						num		= this.tuning.allPassCount,
						feed	= this.tuning.allPassFeedback,
						sizes	= this.tuning.allPassTuning;

						for(var c = 0; c < this.channels; c++){
							//apfs[c] = [];
							for(var i = 0; i < 4; i++){
								this.function["setApf"+((c * 4) +i)](Gibberish.AllPass( sizes[i] + c * this.tuning.stereoSpread).function);
								//apfs[c][i] = ( ap.function );
							}
						}
						//return apfs;
						//})(this);
					this.function.setCombFilters( combFilters );
					console.log("INIT");
					//this.function.setAllPassFilters( allPassFilters );
				},
				callback : function(sample, roomSize, damping, wet, dry, channels) {
					for(var channel = 0; channel < channels; channel++) {
						var input = typeof sample[channel] === "number" ? sample[channel] : sample[channel - 1];
						input *= tuning.fixedGain;
						
						var out = 0;
						
						for(var i = 0; i < 8; i++) {
							var filt = combFilters[channel][i]([input]);
							out += filt[0];				
						}
						
						if(channel===0) {
							out = apf0(out, 1);
							out = apf1(out, 1);
							out = apf2(out, 1);
							out = apf3(out, 1);
						}else{
							out = apf4(out, 1);
							out = apf5(out, 1);
							out = apf6(out, 1);
							out = apf7(out, 1);
						}
						for(var i = 0; i < 4; i++) {
							out = allPassFilters[channel][i](out, 1);	
						}
						out = out * wet + input * dry;
						sample[channel] = out;
					}
					return sample;
				},
			});
			*/
			gibberish.generators.Bus = gibberish.createGenerator(["senders", "amp", "channels", "pan"], "{0}( {1}, {2}, {3}, {4} )");
			gibberish.make["Bus"] = this.makeBus;
			gibberish.Bus = this.Bus;
			
			gibberish.generators.Reverb = gibberish.createGenerator(["source", "roomSize", "damping", "wet", "dry", "channels" ], "{0}( {1},{2},{3},{4},{5},{6} )");
			gibberish.make["Reverb"] = this.makeReverb;
			gibberish.Reverb = this.Reverb;
			
			gibberish.generators.AllPass = gibberish.createGenerator(["source", "time", "feedback", "channels"], "{0}( {1}, {2}, {3}, {4} )");
			gibberish.make["AllPass"] = this.makeAllPass;
			gibberish.AllPass = this.AllPass;

			gibberish.generators.Comb = gibberish.createGenerator(["source", "time", "feedback", "channels"], "{0}( {1}, {2}, {3}, {4} )");
			gibberish.make["Comb"] = this.makeComb;
			gibberish.Comb = this.Comb;
		},
		
		AllPass : function(time, feedback) {
					var that = {
						type:		"AllPass",
						category:	"FX",
						feedback:	feedback || .5,
						time:		time || 500,
						channels:   1,
						buffers:	[new Float32Array(time || 500),new Float32Array(time || 500)],
						source:		null,
					};
					Gibberish.extend(that, new Gibberish.ugen(that) );

					that.symbol = Gibberish.generateSymbol(that.type);
					Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"AllPass\"]();");
					window[that.symbol] = Gibberish.make["AllPass"](that.buffers, that.time, that.feedback);
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

				makeAllPass : function(buffers, bufferLength, feedback ) {
					console.log("ALL PASS", bufferLength, feedback);
					//var bufferLength = buffer.length;
					var index = -1;

					var output = function(sample, channels) {
						index = ++index % bufferLength;
						for(var channel = 0; channel < channels; channel++) {
							var bufferSample = buffers[channel][index];
							//if(index % 10000 === 0) console.log(bufferSample);

							var out = -1 * sample[channel] + bufferSample;
							buffers[channel][index] = sample[channel] + (bufferSample * feedback);
						
							sample[channel] = out;
						}
						return sample;
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
						buffers:	[new Float32Array(time || 1200), new Float32Array(time || 1200)],
						damping:	damping || .2,
						channels:	1,
						source:		null,
					};
					Gibberish.extend(that, new Gibberish.ugen(that));

					that.symbol = Gibberish.generateSymbol(that.type);
					Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Comb\"]();");
					window[that.symbol] = Gibberish.make["Comb"](that.buffers, that.feedback, that.damping, that.time);
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

				makeComb : function(buffers, feedback, damping) {
					//console.log("COMB CHECK", feedback, damping, bufferLength);
					var invDamping = 1 - damping;
					var bufferLength = buffers[0].length;
					console.log(buffers[0]);
					var index = 0;
					var store = [0,0,0,0,0,0,0];

					var output = function(sample, channels) {
						var currentPos = ++index % bufferLength;
						for(var channel = 0; channel < channels; channel++) {
							//console.log(buffers, channel, channels);
							//if(index % 22050 === 0) console.log('pos', currentPos);
							var out = buffers[0][currentPos];
							//if(index % 22050 === 0) console.log("out",out);
						
							store[channel] = (out * .8) + (store[channel] * .2);
							//if(index % 22050 === 0) console.log("store", store[channel]);
						
							buffers[channel][currentPos] = sample[channel] + (store[channel] * feedback);
							sample[channel] = out;	
						}
						//if(index % 22050 === 0) console.log(sample);
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
						channels: 1,
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

						for(var c = 0; c < that.channels; c++){
							combs[c] = [];
							for(var i = 0; i < 8; i++){
								combs[c].push( Gibberish.make["Comb"]([new Float32Array(sizes[i] + c * that.tuning.stereoSpread)], feed, damp) );
							}
						}
						return combs;
					})();;

					that.allPassFilters = (function() {
						var apfs = [],
						num		= that.tuning.allPassCount,
						feed	= that.tuning.allPassFeedback,
						sizes	= that.tuning.allPassTuning;

						for(var c = 0; c < that.channels; c++){
							apfs[c] = [];
							for(var i = 0; i < num; i++){
								apfs[c].push( Gibberish.make["AllPass"]([new Float32Array(sizes[i] + c * that.tuning.stereoSpread)], sizes[i], feed) );
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
					//var panner = Gibberish.pan();
					
					var output = function(sample, roomSize, damping, wet, dry, channels) {
						for(var channel = 0; channel < channels; channel++) {
							var input = typeof sample[channel] === "number" ? sample[channel] : sample[channel - 1];
							input *= tuning.fixedGain;
							//console.log("???");
							var out = input;
						
							for(var i = 0; i < 8; i++) {
								var filt = combFilters[channel][i]([input], 1);
								out += filt[0];				
							}
							
							for(var i = 0; i < 4; i++) {
								out = allPassFilters[channel][i]([out], 1)[0];	
							}
							out = out * wet + sample[channel] * dry;
							sample[channel] = out;
						}
						return sample;
						
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
				pan : 0,

				connect : function(bus) {
					this.destinations.push(bus);
					if(bus === Gibberish.MASTER) {
						console.log("CONNECTING TO MASTER", this)
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
						
						//this.senders.push(variable);
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
			that.fx.parent = that;
			
			that.mod = Gibberish.polyMod;
			that.removeMod = Gibberish.removePolyMod;
			
			that.symbol = Gibberish.generateSymbol( that.type );

			Gibberish.masterInit.push( that.symbol + " = Gibberish.make[\"Bus\"]();" );
			window[that.symbol] = Gibberish.make["Bus"](Gibberish.pan());
			
			Gibberish.defineProperties( that, ["channels", "pan"] );
			return that;
		},

		makeBus : function(panner) { 
			var phase = 0;
			var output = function(senders, amp, channels, pan) {
				var out = [];
				
				if(typeof senders !== "undefined") {
					for(var channel = 0; channel < channels; channel++) {
						out[channel] = 0;
						for(var i = 0, ii = senders.length; i < ii; i++) {
							//if(phase++ % 1000 === 0 ) console.log("BUS", senders[i][channel]);
							out[channel] += typeof senders[i][channel] !== "undefined" ? senders[i][channel] : senders[i][channel - 1];
						}
						out[channel] *= amp;
					}
				}
				
		        return channels === 2 ? [panner(out[0], pan)[0], panner(out[1], pan)[1]] : [out];
				
				//return out;
			};

			return output;
		},
    }
});