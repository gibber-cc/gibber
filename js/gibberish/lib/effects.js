define([], function() {
    return {
		init: function(gibberish) {
			// 0 for LP, 1 for HP ported from http://musicdsp.org/showArchiveComment.php?ArchiveID=237
			// TODO: should the cutoff be moddable? seems pretty cheap...
			gibberish.OnePole = Gen({
			  name:"OnePole",
			  acceptsInput: true,
			  props: { cutoff:440, mode: 0, channels: 2,  },
			  upvalues: { a0:null, b1:null, out:[]},
  
			  init : function() {
			  	var x = Math.exp(-2.0 * Math.PI * this.cutoff / 44100);
			    this.function.setA0( 1.0 - x );
			    this.function.setB1( -x );
			    for(var i = 0; i < this.channels; i++) {
			    	this.function.getOut()[i] = 0;
			    }
			  },
  
			  callback : function(sample, cutoff, mode, channels) {
			  	 for(var i = 0; i < channels; i++) {
			     		var lp = a0 * (sample[i] - out[i]);
			     		out[i] = mode ? lp : sample[i] - lp;
			     }
     
			     return out;
			  }
			});
			
			gibberish.MSG = Gen({
				name:"MSG",
				acceptsInput: true,
				props: { fm:.5, channels:2 },
				upvalues: { sin:Math.sin, pi_2:Math.PI / 2, piX2:Math.PI * 2, phase:0},
  
				callback : function(sample, fm, channels) {
			    	var debug;
				  	if(phase++ % 22050 === 0) {
				    	debug = true;
				    	//console.log(sample);
				    }
				  	for(var i = 0; i < channels; i++) {
				    	sample[i] = sin(sample[i] * pi_2 + (fm * sin(sample[i] * piX2)))	;
				    }
				    //if(debug) console.log(sample);
    
				    return sample;
			  	},
			});
			
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
				props:{ cutoff:.1, resonance: 3, isLowPass:true, channels:2 },
				upvalues: { poles:null, phase:0},
				
				init: function() {
					console.log("FILTER INIT");
					var poles  = [];
					for(var i = 0; i < this.channels; i++) {
						poles[i] = [0,0,0,0];
					}
					this.function.setPoles( poles );
				},	
				
				callback : function(sample, cutoff, resonance, isLowPass, channels) {
					for(var channel = 0; channel < channels; channel++) {
						var _poles = poles[channel];
						var rezz = _poles[3] * resonance; 
						rezz = rezz > 1 ? 1 : rezz;
						
						cutoff = cutoff < 0 ? 0 : cutoff;
						cutoff = cutoff > 1 ? 1 : cutoff;
						
						sample[channel] = sample[channel] - rezz;

						_poles[0] = _poles[0] + ((-_poles[0] + sample[channel]) * cutoff);
						_poles[1] = _poles[1] + ((-_poles[1] + _poles[0])  * cutoff);
						_poles[2] = _poles[2] + ((-_poles[2] + _poles[1])  * cutoff);
						_poles[3] = _poles[3] + ((-_poles[3] + _poles[2])  * cutoff);

						sample[channel] = isLowPass ? _poles[3] : sample[channel] - _poles[3];
					}
					return sample;
				},
			});
			
			gibberish.SVF = Gen({
				name:"SVF",
				acceptsInput: true,
				props : { frequency: 440, Q:2, mode:0, channels: 1 },
				upvalues : { d1:null, d2:null, pi:Math.PI },
				
				init: function() {
					this.function.setD1([0,0]);
					this.function.setD2([0,0]);					
				},
				
				callback: function(sample, frequency, Q, mode, channels) {
					var f1 = 2 * pi * frequency / 44100;
					Q = 1 / Q;
					
					for(var i = 0; i < channels; i++) {
						var l = d2[i] + f1 * d1[i];
						var h = sample[i] - l - Q * d1[i];
						var b = f1 * h + d1[i];
						var n = h + l;
						
						d1[i] = b;
						d2[i] = l;
						
						if(mode === 0) 
							sample[i] = l;
						else if(mode === 1)
							sample[i] = h;
						else if(mode === 2)
							sample[i] = b;
						else
							sample[i] = n;
					}
					
					return sample;
				},
			});
			
			
			gibberish.Biquad = Gen({
				name: "Biquad",

				init: function() {
			    	this.cutoff = 2000;
			    	this.mode = "LP";
			    	this.Q = .5;
					
					this.x1 = [], this.x2 = [], this.y1 = [], this.y2 = [];
					
					for(var i = 0; i < this.channels; i++) {
						this.x1[i] = 0;
						this.x2[i] = 0;
						this.y1[i] = 0;
						this.y2[i] = 0;
					}
					
					this.function.setX1(this.x1);
					this.function.setX2(this.x2);
					this.function.setY1(this.y1);
					this.function.setY2(this.y2);											
				},

			   props: {
			       b0: 0.001639,
			       b1: 0.003278,
			       b2: 0.001639,
			       a1: -1.955777,
			       a2: 0.960601,
				   channels : 2,
			   },

			   acceptsInput: true,
			   upvalues: {
			       x1: null,
			       x2: null,
			       y1: null,
			       y2: null,
			   },

			   setters: {
			       cutoff: function(val) {
			           this.calculateCoefficients();
			       },
			       mode: function(val) {
			           this.calculateCoefficients();
			       },
			       Q: function(val) {
			           this.calculateCoefficients();
			       },
			   },

			   calculateCoefficients: function() {
			       switch (this.mode) {
			       case "LP":
			           var w0 = 2 * Math.PI * this.cutoff / 44100,
			               sinw0 = Math.sin(w0),
			               cosw0 = Math.cos(w0),
			               alpha = sinw0 / (2 * this.Q),
			               b0 = (1 - cosw0) / 2,
			               b1 = 1 - cosw0,
			               b2 = b0,
			               a0 = 1 + alpha,
			               a1 = -2 * cosw0,
			               a2 = 1 - alpha;
			           break;
			       case "HP":
			           var w0 = 2 * Math.PI * this.cutoff / 44100,
			               sinw0 = Math.sin(w0),
			               cosw0 = Math.cos(w0),
			               alpha = sinw0 / (2 * this.Q),
			               b0 = (1 + cosw0) / 2,
			               b1 = -(1 + cosw0),
			               b2 = b0,
			               a0 = 1 + alpha,
			               a1 = -2 * cosw0,
			               a2 = 1 - alpha;
			           break;
			       case "BP":
			           var w0 = 2 * Math.PI * this.cutoff / 44100,
			               sinw0 = Math.sin(w0),
			               cosw0 = Math.cos(w0),
			               toSinh = Math.log(2) / 2 * this.Q * w0 / sinw0,
			               alpha = sinw0 * (Math.exp(toSinh) - Math.exp(-toSinh)) / 2,
			               b0 = alpha,
			               b1 = 0,
			               b2 = -alpha,
			               a0 = 1 + alpha,
			               a1 = -2 * cosw0,
			               a2 = 1 - alpha;
			           break;
			       default:
			           return;
			       }

			       this.b0 = b0 / a0;
			       this.b1 = b1 / a0;
			       this.b2 = b2 / a0;
			       this.a1 = a1 / a0;
			       this.a2 = a2 / a0;
				   
				   //console.log(this.b0, this.b1, this.b2);
			   },
			   call : function(x) {
				   return this.function(x, this.b0, this.b1, this.b2, this.a1, this.a2, this.channels);
			   },
			   callback: function(x, b0, b1, b2, a1, a2, channels) {
				   var out = [];
				   //console.log("X! BITCHES", this.x1);
				   for(var channel = 0; channel < channels; channel++) {
				       out[channel] = b0 * x[channel] + b1 * x1[channel] + b2 * x2[channel] - a1 * y1[channel] - a2 * y2[channel];
				       x2[channel] = x1[channel];
				       x1[channel] = x[channel];
				       y2[channel] = y1[channel];
				       y1[channel] = out[channel];
				   }
			       return out;
			   },

			});
			
			gibberish.Vocoder = Gen({
				name : "Vocoder",
				acceptsInput: true,
				props : { channels:2 },
				upvalues: { encoders:null, decoders:null, synth:null, amps:null, store:null, phase:0, synth:null},
				note: function(n,a){
					this.synth.note(n,a);
				},
				init : function() {
					var enc = [];
					var dec = [];
					var _amps = [];
					var _store = [];
					this.synth = Gibberish.Saw({channels:1, amp:1, frequency:880});
					for(var i = 0; i < 8; i++) {
						(function(){
							enc[i] = gibberish.Biquad();
							dec[i] = gibberish.Biquad();
							
							enc[i].mode = dec[i].mode = "BP";
							enc[i].cutoff = enc[i].cutoff = 80 + i * 250;
							
							_amps[i] = 0;
							_store[i] = 0;
						})();
					}
					this.function.setSynth(this.synth.function);
					this.function.setDecoders(dec);					
					this.function.setEncoders(enc);
					this.function.setAmps(_amps);
					this.function.setStore(_store);	
				},
				
				callback: function(x) {
					for(var i = 0; i < 6; i++) {
						//console.log("BiQuad", i)
						var bpVal = Math.abs(encoders[i].call(x)[0]);
						store[i] = bpVal > store[i] ? bpVal : store[i];
					}
					if(++phase % 64 === 0) {
						for(var i = 0; i < 6; i++) {
							amps[i] = store[i];
							store[i] = 0;
						}
						phase = 0;
						//console.log(amps[0], amps[1], amps[2], amps[3]);
					}
					
					var syn = synth(440, 1, 1, 0);
					var x0, x1, x2, x3, x4, x5;
					x0 = decoders[0].call(syn)[0] * amps[0];
					x1 = decoders[1].call(syn)[0] * amps[1];
					x2 = decoders[2].call(syn)[0] * amps[2];
					x3 = decoders[3].call(syn)[0] * amps[3];
					x4 = decoders[4].call(syn)[0] * amps[4];
					x5 = decoders[5].call(syn)[0] * amps[5];
					
					var sum = x0 + x1 + x2 + x3 + x4 + x5;								
					return [sum, sum];
				},
			});
			
			// adapted from code / comments at http://musicdsp.org/showArchiveComment.php?ArchiveID=124
			gibberish.Decimator = Gen({
				name:"Decimator",
				acceptsInput:true,	
				props:{ bitDepth: 16, sampleRate: 1, channels:2 },
				upvalues: { counter: 0, hold:[], pow:Math.pow, floor:Math.floor},
				
				callback : function(sample, depth, rate, channels) {
					counter += rate;
					
					for(var channel = 0; channel < channels; channel++) {
						if(counter >= 1) {
							var bitMult = pow( depth, 2.0 );
							hold[channel]  = floor( sample[channel] * bitMult ) / bitMult;
							counter -= 1 / channels;
						}
						sample[channel] = hold[channel];
					}
					
					return sample;
				},
				
			});
			
			gibberish.Flanger = Gen({
				name:"Flanger",
				acceptsInput:true,	
				props:{ rate:.25, amount:125, feedback:0, offset:125, channels:1 },
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
				callback : function(sample, delayModulationRate, delayModulationAmount, feedback, offset, channels) {
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
			
			// vibrato is basically flanging where you only hear the modulated delay line
			gibberish.Vibrato = Gen({
				name:"Vibrato",
				acceptsInput:true,
				props:{ rate:5, amount:.5, offset:125, feedback:0, channels:1 },
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
				callback : function(sample, delayModulationRate, delayModulationAmount, offset, feedback, channels) {
					var delayIndex = readIndex + delayModulation(delayModulationRate, (delayModulationAmount * offset) - 1, 1)[0];

					if(delayIndex > bufferLength) {
						delayIndex -= bufferLength;
					}else if(delayIndex < 0) {
						delayIndex += bufferLength;
					}
					
					for(var channel = 0; channel < channels; channel++) {
						var delayedSample = interpolate(buffers[channel], delayIndex);
									
						buffers[channel][writeIndex] = sample[channel];
						
						sample[channel] = delayedSample;
					}

					if(++writeIndex >= bufferLength) writeIndex = 0;
					if(++readIndex  >= bufferLength) readIndex  = 0;

					return sample;
				},	
			});
			
			
			gibberish.BufferShuffler = Gen({
				name:"BufferShuffler",
				acceptsInput: true,
				props: { chance:.25, rate:11025, length:22050, reverseChange:.5, pitchChance:.5, pitchMin:.25, pitchMax:2, wet:1, dry:0, channels:1 },
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
				callback : function(sample, chance, rate, length, reverseChance, pitchChance, pitchMin, pitchMax, wet, dry, channels) {
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
							sample[channel] = isShuffling && isBufferFull ? (outSample * wet) + sample[channel] * dry : sample[channel];
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
					//console.log("ALL PASS", bufferLength, feedback);
					//var bufferLength = buffer.length;
					var index = -1;

					var output = function(sample, channels) {
						index = ++index % bufferLength;
						//for(var channel = 0; channel < channels; channel++) {
							//var bufferSample = buffers[channel][index];
							var bufferSample = buffers[0][index];
							//if(index % 10000 === 0) console.log(bufferSample);

							//var out = -1 * sample[channel] + bufferSample;
							var out = -1 * sample + bufferSample;
							//buffers[channel][index] = sample[channel] + (bufferSample * feedback);
							buffers[0][index] = sample + (bufferSample * feedback);
						
							//sample[channel] = out;
							
							//}
						//return sample;
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
				
				// TODO: damping doesn't do anything!!! there is no damping
				makeComb : function(buffers, feedback, damping) {
					//console.log("COMB CHECK", feedback, damping, bufferLength);
					var invDamping = 1 - damping;
					var bufferLength = buffers[0].length;
					//console.log(buffers[0]);
					var index = 0;
					var store = [0,0,0,0,0,0,0];

					/*var output = function(sample, channels) {
						var currentPos = ++index % bufferLength;
						for(var channel = 0; channel < channels; channel++) {
							//console.log(buffers, channel, channels);
							//if(index % 22050 === 0) console.log('pos', currentPos);
							var out = buffers[channel][currentPos];
							//if(index % 22050 === 0) console.log("out",out);
						
							store[channel] = (out * .8) + (store[channel] * .2);
							//if(index % 22050 === 0) console.log("store", store[channel]);
						
							buffers[channel][currentPos] = sample[channel] + (store[channel] * feedback);
							sample[channel] = out;	
						}
						//if(index % 22050 === 0) console.log(sample);
						return sample;
					};*/
					var output = function(sample, channels) {
						var currentPos = ++index % bufferLength;
						//for(var channel = 0; channel < channels; channel++) {
							//console.log(buffers, channel, channels);
							//if(index % 22050 === 0) console.log('pos', currentPos);
							var out = buffers[0][currentPos];
							//if(index % 22050 === 0) console.log("out",out);
						
							store[0] = (out * .8) + (store[0] * .2);
							//if(index % 22050 === 0) console.log("store", store[channel]);
						
							buffers[0][currentPos] = sample + (store[0] * feedback);
							//sample = out;	
							//}
						//if(index % 22050 === 0) console.log(sample);
						return out;
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
						channels: 2,
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

					Gibberish.defineProperties( that, ["damping", 'wet','dry','roomSize'] );

					return that;
				},

				makeReverb : function(combFilters, allPassFilters, tuning) {
					//var panner = Gibberish.pan();
					
					var output = function(sample, roomSize, damping, wet, dry, channels) {
						// converted to fake stereo
						//for(var channel = 0; channel < channels; channel++) {							
							//var input = sample[channel];
							var input = channels === 1 ? sample[0] : sample[0] + sample[1];
							input *= tuning.fixedGain;

							var out = input;
						
							for(var i = 0; i < 8; i++) {
								//var filt = combFilters[channel][i](input, 1);
								var filt = combFilters[0][i](input, 1);
								out += filt;				
							}
							
							for(var i = 0; i < 4; i++) {
								out = allPassFilters[0][i](out, 1);	
							}
							//out = out * wet + sample[channel] * dry;
							//out = out * wet + input * dry;
							//sample[channel] = out;
						//}
						var _out = channels === 2 ? [ (sample[0] * dry) + (out * wet), (sample[1] * dry) + (out * wet) ] : [(sample[0] * dry) + (out * wet)];
						return _out;
							//};
						
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
						//console.log("CONNECTING TO MASTER", this)
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