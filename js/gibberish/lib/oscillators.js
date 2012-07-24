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
			
			gibberish.generators.Saw = gibberish.createGenerator(["frequency", "amp"], "{0}( {1}, {2} )");
			gibberish.make["Saw"] = this.makeSaw;
			gibberish.Saw = this.Saw;
			
			gibberish.generators.KarplusStrong = gibberish.createGenerator(["blend", "dampingValue", "amp"], "{0}( {1}, {2}, {3} )");
			gibberish.make["KarplusStrong"] = this.makeKarplusStrong;
			gibberish.KarplusStrong = this.KarplusStrong;
			
			gibberish.generators.KarplusStrong2 = gibberish.createGenerator(["blend", "dampingValue", "amp", "headPos"], "{0}( {1}, {2}, {3}, {4} )");
			gibberish.make["KarplusStrong2"] = this.makeKarplusStrong2;
			gibberish.KarplusStrong2 = this.KarplusStrong2;
			
			gibberish.generators.PolyKarplusStrong = gibberish.createGenerator(["blend", "dampingValue", "amp"], "{0}( {1}, {2}, {3} )");
			gibberish.make["PolyKarplusStrong"] = this.makePolyKarplusStrong;
			gibberish.PolyKarplusStrong = this.PolyKarplusStrong;
			
			gibberish.generators.Mesh = gibberish.createGenerator(["input", "hitX", "hitY", "amp", "rate"], "{0}( {1}, {2}, {3}, {4}, {5} )");
			gibberish.make["Mesh"] = this.makeMesh;
			gibberish.Mesh = this.Mesh;
			
			
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
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Sine\"]();");
			window[that.symbol] = Gibberish.make["Sine"]();
			that._function = window[that.symbol];
						
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
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Square\"]();");
			window[that.symbol] = Gibberish.make["Square"]();
			that._function = window[that.symbol];
			
			Gibberish.defineProperties( that, ["frequency", "amp"] );
			
			return that;
		},
		
		makeSquare: function() { // note, storing the increment value DOES NOT make this faster!
			var cycle = 1;
			var phase = 0;
			var output = function(frequency, amp) {
				// from audiolet https://github.com/oampo/Audiolet/blob/master/src/dsp/Square.js
				var out = phase > 0.5 ? 1 : -1;
			    phase += frequency / 44100;
				
			    if (phase > 1) {
			        phase %= 1;
			    }
				return out * amp;
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
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Triangle\"]();");
			window[that.symbol] = Gibberish.make["Triangle"]();
			that._function = window[that.symbol];
			
			Gibberish.defineProperties( that, ["frequency", "amp"] );
	
			return that;
		},
		
		makeTriangle: function() {
			var phase = 0;
			var output = function(frequency, amp) {
				// from audiolet https://github.com/oampo/Audiolet/blob/master/src/dsp/Saw.js
			    var out = 1 - 4 * Math.abs((phase + 0.25) % 1 - 0.5);

			    phase += frequency / 44100;
				
			    if (phase > 1) {
			        phase %= 1;
			    }
				
				return out * amp;
			};
	
			return output;
		},
		
	    // output.samples[0] = ((this.phase / 2 + 0.25) % 0.5 - 0.25) * 4;
	    // this.phase += frequency / sampleRate;
	    // 
	    // if (this.phase > 1) {
	    //     this.phase %= 1;
	    // }
		Saw : function(freq, amp) {
			var that = { 
				type:		"Saw",
				category:	"Gen",
				frequency:	freq || 440, 
				amp:		amp * .35 || .1,
			};
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Saw\"]();");
			window[that.symbol] = Gibberish.make["Saw"]();
			that._function = window[that.symbol];
			
			Gibberish.defineProperties( that, ["frequency", "amp"] );
	
			return that;
		},
		
		makeSaw: function() {
			var phase = 0;
			var output = function(frequency, amp) {
			    var out = ((phase / 2 + 0.25) % 0.5 - 0.25) * 4;

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
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"KarplusStrong\"]();");	
			that._function = Gibberish.make["KarplusStrong"](that.buffer);
			window[that.symbol] = that._function;
			
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
			var that = Gibberish.Bus();
				
			Gibberish.extend(that, {
				amp:		 	.2,
				blend:			1,
				damping:		0,
				maxVoices:		5,
				voiceCount:		0,
				children:		[],
				mod:			Gibberish.polyMod,
				
				note : function(_frequency) {
					var synth = this.children[this.voiceCount++];
					if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
					synth.note(_frequency);
				},
			});
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			for(var i = 0; i < that.maxVoices; i++) {
				var props = {
					blend:		that.blend,
					damping:	that.damping,
					amp: 		1,
				};
				
				var synth = this.KarplusStrong(props);
				synth.send(that, 1);

				that.children.push(synth);
			}
			
			Gibberish.polyDefineProperties( that, ["blend", "damping"] );
			
			(function() {
				var _amp = that.amp;
				Object.defineProperty(that, "amp", {
					get: function() { return _amp; },
					set: function(value) {
						_amp = value;
						that.send(Master, value);
					},
				});
			})();
			
			return that;
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
					
					window[that.symbol] = that._function;
					
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
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Sampler\"]();");	
			that._function = Gibberish.make["Sampler"](that.buffer); // only passs ugen functions to make
			window[that.symbol] = that._function;
			
			Gibberish.defineProperties( that, ["speed", "amp"] );
			
			return that;
		},
		
		makeSampler : function(buffer) {
			var phase = buffer === null ? 0 : buffer.length;
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
		},
		
		KarplusStrong2 : function(properties) {
			var that = { 
				type:		"KarplusStrong2",
				category:	"Gen",
				amp:		.5,
				damping:	.75,
				dampingValue: .75,
				blend:		 1,
				buffer: 	new Float32Array(100),
				buffer2:	new Float32Array(100),
				headPos:	4,
				headCoeff:  .25,
				
				note : function(frequency) {
					var _size = Math.floor(44100 / frequency);
					this.buffer  = new Float32Array(_size); // needs push and shift methods
					this.buffer2 = new Float32Array(_size);;
					
					this.headPos = Math.round( _size * this.headCoeff);
					var last = 0;
					var phase = 0;
					for(var i = 0; i < _size ; i++) {
					    // if (phase < 1) {
					    // 		this.buffer[i] = this.buffer2[i] = 1 - 4 * Math.abs((phase + 0.25) % 1 - 0.5);   
					    // 		phase += frequency / 44100;
					    // }else{
							var newVal = Math.random() * 2 - 1; // white noise
							this.buffer[i] = this.buffer2[i] = (newVal + last) / 2; // filter
							last = newVal;
					    // }
					}
					this._function.setHeads(0, _size - 1, 0);
					this._function.setBuffer(this.buffer);
					this._function.setBuffer2(this.buffer2);					
				},
			};
			
			Gibberish.extend(that, new Gibberish.ugen(that));
			
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
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"KarplusStrong2\"]();");	
			that._function = Gibberish.make["KarplusStrong2"](that.buffer, that.buffer2);
			window[that.symbol] = that._function;
			
			Gibberish.defineProperties( that, ["blend", "amp", "headPos", "damping"] );

			return that;
		},
		
		makeKarplusStrong2: function(buffer, buffer2) {
			var phase = 0;
			var rnd = Math.random;
			var lastValue = 0;
			var lastValue2 = 0;
			var read1 = 0, read2 = 0, write = 0;
			 
			var output = function(blend, damping, amp, headPos) {
				var val = buffer[read1++];
				var val2 = buffer2[read2--];
				read1 = read1 >= buffer.length ? 0 : read1;
				read2 = read2 < 0 ? buffer.length - 1 : read2;
	
				var value = ((val + lastValue) ) * damping;
				var value2 = ((val2 + lastValue2) ) * damping;				
				
				//if(phase++ % 22050 === 0) console.log(damping, read1, read2, value, value2, headPos);
				
				lastValue = value;
				lastValue2 = value2;				
		
				buffer[write] = value;
				buffer2[write] = value2;
				
				write = write < buffer.length - 1 ? write + 1 : 0;
				
				//if(phase++ % 22050 === 0) console.log("INSIDE", value, blend, damping, amp, val);
				//return buffer[(headPos + read1) % buffer.length] + (buffer2[(buffer.length - headPos + read2) % buffer.length] * -1) * amp;
				return (value + (value2 * -1)) * amp;
			};
			output.setBuffer  = function(buff) { buffer  = buff; };
			output.setBuffer2 = function(buff) { buffer2 = buff; };		
			output.setHeads = function(r1, r2, w) { read1 = r1; read2 = r2; write = w; }	
			output.getBuffer = function() { return buffer; };			

			return output;
		},
		
		Mesh : function(props) {
			var that = { 
				type:		"Mesh",
				category:	"Gen",
				amp:		props.amp || .5,
				input:		props.input,
				hitX :  props.hitX || 3,
				hitY :  props.hitY || 3,
				width:  props.width || 16,
				height: props.height || 16,
				rate: 	props.rate || 10,			
			};
			Gibberish.extend(that, new Gibberish.ugen(that));

			var Junction = function() {
				var that = {
					phase : 0,
					neighbors : null,
					nearest : 	null,
					value : 0,
					n1 : 0,
					n2 : 0,
					damping : .01,
					mode : 0,
					
					setNeighbors : function(neighbors) {
						this.neighbors = neighbors;
						this.nearest = [ neighbors[1], neighbors[3], neighbors[5], neighbors[7] ];
					},
					render : function(input) {
						/* grid
						0.09398		0.3120	0.09398
						0.3120		0.3759	0.32120
						0.09398		0.3120	0.09398
						*/
						var val = 0;
						/*
						if(this.neighbors[0] !== null) val += this.neighbors[0].n1 * 0.09398;
						if(this.neighbors[1] !== null) val += this.neighbors[1].n1 * 0.3120;
						if(this.neighbors[2] !== null) val += this.neighbors[2].n1 * 0.09398;
						if(this.neighbors[3] !== null) val += this.neighbors[3].n1 * 0.3120;
						if(this.neighbors[4] !== null) val += this.n1 * 0.3759;
						if(this.neighbors[5] !== null) val += this.neighbors[5].n1 * 0.3120;
						if(this.neighbors[6] !== null) val += this.neighbors[6].n1 * 0.09398;
						if(this.neighbors[7] !== null) val += this.neighbors[7].n1 * 0.3120;
						if(this.neighbors[8] !== null) val += this.neighbors[8].n1 * 0.09398;
						*/
						
						/*
						for(var i = 0; i < this.nearest.length; i++) {
							if(this.nearest[i] !== null) {
								//console.log("NON NULL NEIGHBOR", this.nearest[i].n1);
								//if(isNaN( this.nearest[i].n1 )) console.log("PROBLEM ", i);
								val += this.nearest[i].n1;// - this.n2;
							}
						}

						val *= .5;
						val -= this.n2;
						val *= 1 - this.damping;
						*/
						
						if(typeof input === "number") { val += input; }
						//if(val === NaN) console.log("ALERT!");
						//if(this.num == 8)
						//	if(this.phase++ < 100) console.log("OUTPUT", this.num, val);
						this.value = val;
						//if(typeof this.value !== "number" ) console.log("AOSUDOAISHUDOAI");
						//console.log(this.value, this.num);
						return this.value;
					},
					update : function() {
						//if(this.phase++ % 22050 === 0) console.log(this.n1);
						this.n2 = this.n1;
						this.n1 = this.value; //isNaN(this.value) ? this.n1 : this.value;
						//console.log("UPDATING", this);					
					}
				}
				
				return that;
			}
			/* Triangular (hexagonal) mesh, 6 ports per junction

var r1="	* *    ";
var r2=" * * * * * ";
var r3="* * * * * *";
var r4=" * * * * * ";
var r5="* * * * * *";
var r6=" * * * * * ";
var r7="    * *    ";

			*/
			
			var Triangle = function() {
				console.log("triangle 0");
				var rows = [
					"    * *    ",
					" * * * * * ",
					"* * * * * *",
					" * * * * * ",
					"* * * * * *",
					" * * * * * ",
					"    * *    ",
				];
				var grid = [];
				for(var i = 0; i < rows.length; i++) {
					var _row = rows[i].split("");
					grid[i] = [];
					for(var j = 0; j < _row.length; j++) {
						grid[i][j] = _row[j] === "*" ? Junction() : null;
					}
				}
				console.log("triangle 1", grid);
				for(var i = 0; i < grid.length; i++) {
					console.log("row", i);
					var row = grid[i];
					var above = i - 1;
					var below = i + 1;
					
					for(var col = 0; col < row.length; col++) {
						console.log("column", col);
						var left = 	col - 1;
						var right = col + 1;
						
						if( row[col] !== null) {
							var neighbors = [];
							var count = 0;
							if(above >= 0 && left >= 0) {
								neighbors[count++] = grid[above][left];
							}
							if(above >= 0 && right < row.length) {
								neighbors[count++] = grid[above][right];
							}
							if(left - 1 >= 0) {
								neighbors[count++] = grid[i][left - 1];
							}
							if(right + 1 < row.length) {
								neighbors[count++] = grid[i][right + 1];
							}
							if(below < grid.length && left >= 0) {
								neighbors[count++] = grid[below][left];
							}
							if(below < grid.length && right < row.length) {
								neighbors[count++] = grid[below][right];
							}
							
							row[col].neighbors = neighbors;
						}
					}
				}
				console.log("triangle 2");
				return grid;
			};
			
			var Grid = function(width, height) {
				var grid = [];
				for(var i = 0; i < height; i++) {
					grid[i] = [];
					for(var j = 0; j < width; j++) {
						grid[i][j] = Junction();
						
						grid[i][j].num = i * width + j;
						//if(grid[i][j].num === 8) grid[i][j].n1 = 1;
					}
				}
				
				for(var i = 0; i < height; i++) {
					var above = i - 1;
					var below = i + 1;
					
					for(var j = 0; j < width; j++) {
						var left = j - 1;
						var right = j + 1;
						var neighbors = [];
						for(var k = 0; k < width * height; k++) { neighbors[k] = null; }
						
						if(above >= 0) {
							if(left >= 0) {
								neighbors[0] = grid[above][left];
							}
							neighbors[1] = grid[above][j];
							if(right < width) {
								neighbors[2] = grid[above][right];
							}
						}
						if(left >= 0) {
							neighbors[3] = grid[i][left];
						}
						neighbors[4] = grid[i][j];
						if(right < width) {
							neighbors[5] = grid[i][right];
						}
						
						if(below < height) {
							if(left >= 0) {
								neighbors[6] = grid[below][left];
							}
							neighbors[7] = grid[below][j];
							if(right < width) {
								neighbors[8] = grid[below][right];
							}
						}
						grid[i][j].setNeighbors(neighbors);
					}
				}
				return grid;
			}
			
			that.grid = Triangle();
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Mesh\"]();");
			window[that.symbol] = Gibberish.make["Mesh"](that.grid);
			that._function = window[that.symbol];
						
			Gibberish.defineProperties( that, ["input", "amp", "hitX", "hitY", "rate"] );
			
			(function() {
				var _damping = that.damping;
				
				Object.defineProperty(that, "damping", {
					get: function() { return _damping; },
					set: function(value) {
						_damping = value;
						for(var i = 0; i < that.grid.length; i++) {
							for(var j = 0; j < that.grid[i].length; j++) {
								this.grid[i][j].damping = _damping;
							}
						}
					},
				});
			})();
	
			return that;
		},
		
		
		makeMesh : function(grid) { // note, storing the increment value DOES NOT make this faster!
			var phase = 0;
			//var incr = 1 / 44100;
	
			var output = function(input, junctionX, junctionY, amp, rate) {
				var val = 0;
				phase++; //= incr;
				//var _phase = phase++ % rate;
				var phaseMult = phase / rate;
				if(phase >= rate) {
					for(var i = 0; i < grid.length; i++) {					
						for(var j = 0; j < grid[i].length; j++) {
							if(i === junctionY && j === junctionX && typeof input === "number" && input !== Infinity) {
								if(phase++ % 22050 === 0) console.log("input = ", input, amp);
								//console.log("MATCHED");
								grid[i][j].render(input);
							}else{
								grid[i][j].render();
							}
						}
					}
				
					for(var i = 0; i < grid.length; i++) {					
						for(var j = 0; j < grid[i].length; j++) {
							//console.log("updating", (i * this.grid[i].length) + j);
							grid[i][j].update();
						}
					}

					phase -= rate;
				}
				
				for(var i = 0; i < grid.length; i++) {					
					for(var j = 0; j < grid[i].length; j++) {
						var node = grid[i][j];
						//if(phase % 22000 === 0) console.log(node.n1, node.value);
						//if(node.n1 !== 0 || node.value !== 0) console.log("NONZERO", node.num);
						//console.log(node.n1, node.value);
						val += node.n1 + (node.value - node.n1) * phaseMult;
					}
				}
				
				//if(val !== 0) console.log("VALUE 0", val);
				
				return val * amp;
			}

	
			return output;
		},		
    }
});