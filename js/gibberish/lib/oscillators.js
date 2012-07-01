define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Sine = gibberish.createGenerator(["frequency", "amp"], "{0}( {1}, {2} )");
			gibberish.make["Sine"] = this.makeSine;
			gibberish.Sine = this.Sine;
			
			gibberish.generators.Square = gibberish.createGenerator(["frequency", "amp"], "{0}({1}, {2})");
			gibberish.make["Square"] = this.makeSquare;
			gibberish.Square = this.Square;
			
			gibberish.generators.Triangle = gibberish.createGenerator(["frequency", "amp"], "{0}( {1}, {2} )");
			gibberish.make["Triangle"] = this.makeTriangle;
			gibberish.Triangle = this.Triangle;
			
			gibberish.generators.KarplusStrong = gibberish.createGenerator(["blend", "dampingValue", "amp"], "{0}( {1}, {2}, {3} )");
			gibberish.make["KarplusStrong"] = this.makeKarplusStrong;
			gibberish.KarplusStrong = this.KarplusStrong;
			
			gibberish.generators.PolyKarplusStrong = gibberish.createGenerator(["blend", "dampingValue", "amp"], "{0}( {1}, {2}, {3} )");
			gibberish.make["PolyKarplusStrong"] = this.makePolyKarplusStrong;
			gibberish.PolyKarplusStrong = this.PolyKarplusStrong;
			
			gibberish.Sampler = this.Sampler;
			gibberish.generators.Sampler = gibberish.createGenerator(["speed", "amp"], "{0}( {1}, {2} )");
			gibberish.make["Sampler"] = this.makeSampler;
		},
		
		Sine : function(freq, amp) {
			var that = { 
				type:		"Sine",
				category:	"Gen",
				frequency:	freq || 440, 
				amp:		amp || .5,
			};
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Sine\"]();");
			window[that.name] = Gibberish.make["Sine"]();
			that._function = window[that.name];
						
			Gibberish.defineProperties( that, ["frequency", "amp"] );
			
			return that;
		},
		
		makeSine: function() { // note, storing the increment value DOES NOT make this faster!
			var phase = 0;
			var sin = Math.sin;
			var pi_2 = Math.PI * 2;
	
			var output = function(frequency, amp) {
				phase += frequency / 44100;
				//while(phase > pi_2) phase -= pi_2;
				return sin(phase * pi_2) * amp;
			}
	
			return output;
		},
		
		Square : function(freq, amp) {
			var that = { 
				type:		"Square",
				category:	"Gen",
				frequency:	freq || 440, 
				amp:		amp * .35 || .1,
			};
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Square\"]();");
			window[that.name] = Gibberish.make["Square"]();
			that._function = window[that.name];
			
			Gibberish.defineProperties( that, ["frequency", "amp"] );
			
			return that;
		},
		
		makeSquare: function() { // note, storing the increment value DOES NOT make this faster!
			var cycle = 1;
			var phase = 0;
			var output = function(frequency, amp) {
				while(phase++ >= 44100 / frequency) {
					cycle *= -1;
					phase -= 44100;
				}
				return cycle;
			}
	
			return output;
		},
		
		Triangle : function(freq, amp) {
			var that = { 
				type:		"Triangle",
				category:	"Gen",
				frequency:	freq || 440, 
				amp:		amp * .35 || .1,
			};
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Triangle\"]();");
			window[that.name] = Gibberish.make["Triangle"]();
			that._function = window[that.name];
			
			Gibberish.defineProperties( that, ["frequency", "amp"] );
	
			return that;
		},
		
		makeTriangle: function() {
			var phase = 0;
			var output = function(frequency, amp) {
			    var out = 1 - 4 * Math.abs((phase + 0.25) % 1 - 0.5);

			    phase += frequency / 44100;
				
			    if (phase > 1) {
			        phase %= 1;
			    }
				
				return out * amp;
			};
	
			return output;
		},
		
		KarplusStrong : function(properties) {
			var that = { 
				type:		"KarplusStrong",
				category:	"Gen",
				amp:		.5,
				damping:	.0,
				dampingValue: 0,
				blend:		 1,
				buffer: 	[],
				
				note : function(frequency) {
					var _size = Math.floor(44100 / frequency);
					this.buffer = []; //new Float32Array(_size); // needs push and shift methods
					
					for(var i = 0; i < _size ; i++) {
						this.buffer[i] = Math.random() * 2 - 1; // white noise
					}
					
					this._function.setBuffer(this.buffer);
				},
			};
			
			Gibberish.extend(that, new Gibberish.ugen(that));
			//that.fx.parent = new FXArray(this);
			
			var damping = that.damping;
			
			// 		    Object.defineProperty(that, "damping", {
			// 	get: function() {
			// 		return damping * 100;
			// 	},
			// 	set: function(value) {
			// 		damping = value / 100;
			// 		that.dampingValue = .5 - damping;
			// 		Gibberish.dirty(this);
			// 	}
			// });

			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			that.dampingValue = .5 - that.damping;
			
			that.buffer.push(0);
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"KarplusStrong\"]();");	
			that._function = Gibberish.make["KarplusStrong"](that.buffer);
			window[that.name] = that._function;
			
			Gibberish.defineProperties( that, ["blend", "amp"] );
			
			return that;
		},
		
		makeKarplusStrong: function(buffer) {
			var phase = 0;
			var rnd = Math.random;
			var lastValue = 0;
			var output = function(blend, damping, amp) {		
				var val = buffer.shift();
				//if(phase++ % 22050 === 0) console.log("VAL", val, buffer.length);
				var rndValue = (rnd() > blend) ? -1 : 1;
		
				var value = rndValue * (val + lastValue) * damping;
		
				lastValue = value;
		
				buffer.push(value);
				//if(phase++ % 22050 === 0) console.log("INSIDE", value, blend, damping, amp, val);
				return value * amp;
			};
			output.setBuffer = function(buff) { buffer = buff; };
			output.getBuffer = function() { return buffer; };			

			return output;
		},
		
		PolyKarplusStrong : function(properties) {
			var that = {
				type:			"PolyKarplusStrong",
				category:		"Gen",
				blend:			1,
				damping:		0,
				maxVoices:		10,
				voiceCount:		0,
				amp:			.2,
				
				note : function(_frequency) {
					var synth = this.synths[this.voiceCount++];
					if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
					synth.note(_frequency);
				},
			};
			
			that.dampingValue = .5 - that.damping;
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			that.synths = [];
			that.synthFunctions = [];
			for(var i = 0; i < that.maxVoices; i++) {
				var props = {};
				Gibberish.extend(props, that);
				delete props.note; // we don't want to copy the poly note function obviously
				delete props.type;
				delete props.synths;
				delete props.synthFunctions;
				
				props.type = "KarplusStrong";
				
				var synth = this.KarplusStrong(props);
			
				that.synths.push(synth);
			
				that.synthFunctions.push(synth._function);
			}
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"PolyKarplusStrong\"]();");	
			window[that.name] = Gibberish.make["PolyKarplusStrong"](that.synthFunctions); // only passs ugen functions to make
			
			Gibberish.defineProperties( that, ["blend", "amp"] );
			
			// 		    Object.defineProperty(that, "damping", {
			// 	get: function() {
			// 		return damping * 100;
			// 	},
			// 	set: function(value) {
			// 		damping = value / 100;
			// 		that.dampingValue = .5 - damping;
			// 		Gibberish.dirty(this);
			// 	}
			// 
			// });
	
			return that;
		},
		
		makePolyKarplusStrong: function(_synths) {
			var phase = 0;
			var output = function(blend, dampingValue, amp) {
				var out = 0;
				var synths = _synths;
				var numSynths = synths.length;
				for(var i = 0; i < numSynths; i++) {
					var synth = synths[i];
					out += synth(blend, dampingValue, amp);
				}
				return out;
			}
			return output;
		},
		
		Sampler : function(pathToAudioFile) {
			var that = {
				type: 			"Sampler",
				category:		"Gen",
				audioFilePath: 	pathToAudioFile,
				buffer : 		null,
				bufferLength:   null,
				speed:			1,
				amp:			1,
				_function:		null,
				onload : 		function(decoded) { 
					that.buffer = decoded.channels[0]; 
					that.bufferLength = decoded.length;
					
					console.log("LOADED ", that.audioFilePath, that.bufferLength);
					Gibberish.audioFiles[that.audioFilePath] = that.buffer;
					
					that._function = Gibberish.make["Sampler"](that.buffer); // only passs ugen functions to make
					
					window[that.name] = that._function;
					
					Gibberish.dirty(that);
				},
				note: function(speed, amp) {
					if(typeof amp !== "undefined") { this.amp = amp; }
					this.speed = speed;
					if(this._function !== null) {
						this._function.setPhase(0);
					}
				},
			};
			
			// if(typeof properties !== "undefined") {
			// 	Gibberish.extend(that, properties);
			// }
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			if(typeof Gibberish.audioFiles[that.audioFilePath] !== "undefined") {
				that.buffer =  Gibberish.audioFiles[that.audioFilePath];
				that.bufferLength = that.buffer.length;
			}else{
			    var request = new AudioFileRequest(that.audioFilePath);
			    request.onSuccess = that.onload;
			    request.send();
			}
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Sampler\"]();");	
			
			Gibberish.defineProperties( that, ["speed", "amp"] );
			
			return that;
		},
		
		makeSampler : function(buffer) {
			var phase = buffer.length;
			var interpolate = Gibberish.interpolate;
			var output = function(_speed, amp) {
				var out = 0;
				phase += _speed;
				if(buffer !== null && phase < buffer.length) {
					out = interpolate(buffer, phase);
				}
				return out * amp;
			};
			output.setPhase = function(newPhase) { phase = newPhase; };
			
			return output;
		}
		
		
    }
});