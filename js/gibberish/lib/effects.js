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
					
							hold = floor( sample * bitMult )/ bitMult; 
							
							counter--;
						}
						return hold;
					}else{
						if(counter >= 1) {
							var bitMult = pow( depth, 2.0 );
					
							hold  = floor( sample[0] * bitMult )/ bitMult;
							holdd = floor( sample[1] * bitMult )/ bitMult;
							
							counter--;
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
					if(this.channels === 1) {
						this.function.setBuffer(new Float32Array(88200));
					}else{
						this.function.setBuffer( [new Float32Array(88200), new Float32Array(88200)] );
					}
				},
				
				callback : function(sample, offset, feedback, delayModulationRate, delayModulationAmount) {
					var delayIndex = readIndex + delayModulation(delayModulationRate, delayModulationAmount * .95);
								
					if(delayIndex > bufferLength) {
						delayIndex -= bufferLength;
					}else if(delayIndex < 0) {
						delayIndex += bufferLength;
					}
					
					if(typeof sample[0] === "undefined") {
						var delayedSample = interpolate(buffer, delayIndex);
									
						// TODO: no, feedback really is broken. sigh.
						//var writeValue = sample + (delayedSample * feedback);
						//if(writeValue > 1 || isNaN(writeValue) || writeValue < -1) { console.log("WRITE VALUE", writeValue); }
									
						// TODO: this shouldn't be necessary, but writeValue (when using feedback) sometimes returns NaN
						// for reasons I can't figure out. 
						buffer[writeIndex] = sample; //isNaN(writeValue) ? sample : writeValue;
						sample += delayedSample;
					}else{
						var delayedSample = [];
						delayedSample[0] = interpolate(buffer[0], delayIndex);
						delayedSample[1] = interpolate(buffer[1], delayIndex);
									
						buffer[0][writeIndex] = sample[0]; //isNaN(writeValue) ? sample : writeValue;
						buffer[1][writeIndex] = sample[1];
						
						sample[0] += delayedSample[0];
						sample[1] += delayedSample[1];						
					}
					
					if(++writeIndex >= bufferLength) writeIndex = 0;
					if(++readIndex  >= bufferLength) readIndex  = 0;

					return sample;
				},	
			});
			
			gibberish.BufferShuffler = Gen({
				name:"BufferShuffler",
				acceptsInput: true,
				props: { chance:.25, rate:11025, length:22050, reverseChange:.5, pitchChance:.5, pitchMin:.25, pitchMax:2, channels:2 },
				upvalues: {
					buffer : null,
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
					if(this.channels === 1) {
						this.function.setBuffer(new Float32Array(88200));
					}else{
						this.function.setBuffer( [new Float32Array(88200), new Float32Array(88200)] );
					}
				},
				
				callback : function(sample, chance, rate, length, reverseChance, pitchChance, pitchMin, pitchMax, channels) {
					var isStereo = typeof sample[0] === "number";
					if(!isShuffling) {
						if(isStereo) {
							//console.log(buffer);
							buffer[0][writeIndex] = sample[0];
							buffer[1][writeIndex++] = sample[1]
							//console.log("BLAH");
						}else{
							buffer[writeIndex++] = sample;
						}	
						writeIndex %= bufferLength;
					
						isBufferFull = writeIndex === 0 ? 1 : isBufferFull; // don't output buffered audio until a buffer is full... otherwise you just get a gap
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
					
					var outSample;
					if(isStereo) {
						outSample = [
							interpolate(buffer[0], readIndex),
							interpolate(buffer[1], readIndex),
						];
					}else{
						outSample = interpolate(buffer, readIndex);
					}
				
					if(isFadingWetIn) {						
						fadeAmount -= .0025;
						if(isStereo){
							out = [];
							out[0] = (outSample[0] * (1 - fadeAmount)) + (sample[0] * fadeAmount);
							out[1] = (outSample[1] * (1 - fadeAmount)) + (sample[1] * fadeAmount);							
						}else{
							out = (outSample * (1 - fadeAmount)) + (sample * fadeAmount);
						}
						if(fadeAmount <= .0025) isFadingWetIn = false;
					}else if(isFadingDryIn) {						
						fadeAmount -= .0025;
						if(isStereo){
							out = [];
							out[0] = (outSample[0] * (fadeAmount)) + (sample[0] * (1 - fadeAmount));
							out[1] = (outSample[1] * (fadeAmount)) + (sample[1] * (1 - fadeAmount));
						}else{
							out = (outSample * (fadeAmount)) + (sample * (1 - fadeAmount));
						}
						if(fadeAmount <= .0025) { 
							isFadingDryIn = false;
							isShuffling = false;
							reversed = false;
							speed = 1;
							pitchShifting = 0;
						}
					}else{
						if(isStereo) {
							out = [
								isShuffling && isBufferFull ? outSample[0] : sample[0],
								isShuffling && isBufferFull ? outSample[1] : sample[1],
							];
						}else{
							out = isShuffling && isBufferFull ? outSample : sample;
						}
					}
					return out;
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
				callback: function(sample) {
					var currentPos = ++index % bufferLength;
					var out;
					if(typeof sample[0] === "number") {
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
			gibberish.AllPass = Gen({
				name:"AllPass",
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
				
				callback: function(sample) {
					index = ++index % bufferLength;
					var out;
					out = sample;
					
					if(typeof sample[0] === "number") {
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
			gibberish.Reverb = Gen({
				name: "Reverb",
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
				callback : function(sample, roomSize, damping, wet, dry) {
					//if(phase++ % 500 == 0) console.log(roomSize, damping, wet, dry, input);
					var out, input;
					// if(typeof sample[0] === "number") {
					// 	sample = (sample[0] + sample[1]) / 2;
					// }
					if(typeof sample[0] === "number") {
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
			/*Reverb : function(properties) {
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
			
			
			/*gibberish.generators.Reverb = gibberish.createGenerator(["source", "roomSize", "damping", "wet", "dry" ], "{0}( {1},{2},{3},{4},{5} )");
			gibberish.make["Reverb"] = this.makeReverb;
			gibberish.Reverb = this.Reverb;*/
			
			gibberish.generators.Bus = gibberish.createGenerator(["senders", "amp"], "{0}( {1}, {2} )");
			gibberish.make["Bus"] = this.makeBus;
			gibberish.Bus = this.Bus;
		},

		// adapted from audioLib.js
		/*Reverb : function(properties) {
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
		*/
		
// gibberish.generators.BufferShuffler = gibberish.createGenerator(["source","chance", "rate", "length", "reverseChance", "pitchChance", "pitchMin", "pitchMax"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8} )");
				
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