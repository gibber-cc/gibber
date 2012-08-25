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
					// is this every really going to be needed?
					channels : function(val) {
						var buffers = this.function.getBuffer();
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
					var x = modulation(frequency, amp, 1);
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
				props: { time:1200, channels:2,  },
				upvalues:{
					buffer:null,
					index : 0,
					store : 0,
					store_ : 0,
					feedback: .84, bufferLength: null, damping:.2,
				},
				init: function() {
					if(this.channels === 1) {
						this.function.setBuffer(new Float32Array(this.time));
					}else{
						this.function.setBuffer( [new Float32Array(this.time), new Float32Array(this.time)] );
					}
					this.function.setBufferLength(this.time);
				},
				callback: function(sample, channels) {
					var currentPos = ++index % bufferLength;
					var out;
					if(channels === 2) {
						out = [
							buffer[0][currentPos],
							buffer[1][currentPos],
						];
						store = (out[0] * .8) + (store * .2);
						buffer[0][currentPos] = sample[0] + (store * feedback);
						
						store_ = (out[1] * .8) + (store_ * .2);
						buffer[1][currentPos] = sample[1] + (store_ * feedback);
					}else{
						out = buffer[currentPos];
						
						store = (out * .8) + (store * .2);
						buffer[currentPos] = sample + (store * feedback);
					}					
					return out;
				},
			});
			gibberish.AllPass2 = Gen({
				name:"AllPass2",
				acceptsInput: true,
				props: {  time:500, channels:2 },
				upvalues: { feedback:.5, buffer: null, index:-1, bufferLength:500 },
				
				init: function() {
					if(this.channels === 1) {
						this.function.setBuffer(new Float32Array(this.time));
					}else{
						this.function.setBuffer( [new Float32Array(this.time), new Float32Array(this.time)] );
					}
					this.function.setBufferLength(this.time);
				},
				
				callback: function(sample, channels) {
					index = ++index % bufferLength;
					var out;
					out = sample;
					
					if(channels === 2) {
						var bufferSample1 = buffer[0][index];
						var bufferSample2 = buffer[1][index];
						
						out = [
							-1 * sample[0] + bufferSample1,
							-1 * sample[1] + bufferSample2,
						];
						
						buffer[0][index] = sample[0] + (bufferSample1 * feedback);
						buffer[1][index] = sample[1] + (bufferSample2 * feedback);						
					}else{
						var bufferSample = buffer[index];

						out = -sample + bufferSample;
						buffer[index] = sample + (bufferSample * feedback);
					}
					
					return out;
				},
			});
			// TODO: this is vastly less efficient than the "old" version (which is still being used as Reverb). Why?
			// seems like it would have to be a problem with upvalues...
			gibberish.Reverb2 = Gen({
				name: "Reverb2",
				acceptsInput : true,
				props: { roomSize:.5, damping:.2223, wet:.5, dry:.55, channels:2 },
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

					    stereoSpread: 	23
					},
					combFilters : null,
					allPassFilters : null,			
				},
				init : function() {
					this.combFilters = (function(that) {
						var combs	= [],
							num		= that.tuning.combCount,
							damp	= that.damping *  that.tuning.scaleDamping,
							feed	= that.roomSize * that.tuning.scaleRoom + that.tuning.offsetRoom,
							sizes	= that.tuning.combTuning;

						for(var c = 0; c < that.channels; c++){
							for(var i = 0; i < 8; i++){
								var comb = Gibberish.LowPassComb(sizes[i] + c * that.tuning.stereoSpread);
								comb.function.setFeedback(feed);
								comb.function.setDamping(damp);
								combs.push( comb );
							}
						}
						return combs;
					})(this);;

					this.allPassFilters = (function(that) {
						var apfs = [],
						num		= that.tuning.allPassCount,
						feed	= that.tuning.allPassFeedback,
						sizes	= that.tuning.allPassTuning;

						for(var c = 0; c < that.channels; c++){
							for(var i = 0; i < num; i++){
								var ap = Gibberish.AllPass( sizes[i] + c * that.tuning.stereoSpread);
								apfs.push( ap );
							}
						}
						return apfs;
					})(this);
					this.function.setCombFilters( this.combFilters );
					this.function.setAllPassFilters( this.allPassFilters );					
				},
				callback : function(sample, roomSize, damping, wet, dry, channels) {
					//if(phase++ % 500 == 0) console.log(roomSize, damping, wet, dry, input);
					var out, input;
					// if(typeof sample[0] === "number") {
					// 	sample = (sample[0] + sample[1]) / 2;
					// }
					if(channels === 2) {
						input = [
							sample[0] * tuning.fixedGain,
							sample[1] * tuning.fixedGain,
						];
						out = [0,0];
						for(var i = 0; i < 8; i++) {
							var filt = combFilters[i].function(input);
							//var filt1 = combFilters[i+8].function(input[1]);							
							out[0] += filt[0];
							out[1] += filt[1];							
						}

						for(var i = 0; i < 4; i++) {
							out = allPassFilters[i].function(out);
							//out[1] = allPassFilters[i+4].function(out[1]);														
						}
						out[0] = out[0] * wet + sample[0] * dry;
						out[1] = out[1] * wet + sample[1] * dry;						
					}else{
						var input = sample * tuning.fixedGain;
						var out = 0;
						
						for(var i = 0; i < 8; i++) {
							out += combFilters[i].function(input);
						}

						for(var i = 0; i < 4; i++) {
							out = allPassFilters[i].function(out);
						}
						
						out = out * wet + sample * dry;
					}
					return out;
				},
			});
			
			gibberish.generators.Bus = gibberish.createGenerator(["senders", "amp", "channels"], "{0}( {1}, {2}, {3} )");
			gibberish.make["Bus"] = this.makeBus;
			gibberish.Bus = this.Bus;
			
			gibberish.generators.Reverb = gibberish.createGenerator(["source", "roomSize", "damping", "wet", "dry" ], "{0}( {1},{2},{3},{4},{5} )");
			gibberish.make["Reverb"] = this.makeReverb;
			gibberish.Reverb = this.Reverb;
			
			gibberish.generators.AllPass = gibberish.createGenerator(["source", "time", "feedback"], "{0}( {1}, {2}, {3} )");
			gibberish.make["AllPass"] = this.makeAllPass;
			gibberish.AllPass = this.AllPass;

			gibberish.generators.Comb = gibberish.createGenerator(["source", "time", "feedback"], "{0}( {1}, {2}, {3} )");
			gibberish.make["Comb"] = this.makeComb;
			gibberish.Comb = this.Comb;
		},
		
		AllPass : function(time, feedback) {
					var that = {
						type:		"AllPass",
						category:	"FX",
						feedback:	feedback || .5,
						time:		time || 500,
						channels:   2,
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
					var panner = Gibberish.pan();
					
					var output = function(sample, roomSize, damping, wet, dry) {
						//if(phase++ % 500 == 0) console.log(roomSize, damping, wet, dry, input);
						if(typeof sample[0] === "number") {			
							var input = ((sample[0] + sample[1]) / 2) * tuning.fixedGain;
						}else{
							var input = sample * tuning.fixedGain;
						}
						var out = 0;
						for(var i = 0; i < 8; i++) {
							out += combFilters[i](input);
						}
						
						for(var i = 0; i < 4; i++) {
							out = allPassFilters[i](out);
						}
						
						return [out * wet + sample[0] * dry,out * wet + sample[1] * dry];//panner(out * wet + sample * dry, 0);
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
				channels : 1,

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
			that.fx.parent = this;
			
			that.mod = Gibberish.polyMod;
			that.removeMod = Gibberish.removePolyMod;
			
			that.symbol = Gibberish.generateSymbol( that.type );

			Gibberish.masterInit.push( that.symbol + " = Gibberish.make[\"Bus\"]();" );
			window[that.symbol] = Gibberish.make["Bus"]();
			
			Gibberish.defineProperties( that, ["channels"] );
			return that;
		},

		makeBus : function() { 
			var phase = 0;
			var output = function(senders, amp, channels) {
				var out = [];
				
				if(typeof senders !== "undefined") {
					for(var channel = 0; channel < channels; channel++) {
						out[channel] = 0;
						for(var i = 0, ii = senders.length; i < ii; i++) {
							//if(phase++ % 1000 === 0 ) console.log("BUS", senders[i]);
							out[channel] += typeof senders[i][channel] !== "undefined" ? senders[i][channel] : senders[i][channel - 1];
						}
						out[channel] *= amp;
					}
				}
				
				return out;
			};

			return output;
		},
    }
});