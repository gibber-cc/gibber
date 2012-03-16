function Schizo(chance, rate, length, shouldRandomizePitch, shouldRandomizeReverse) {
	var that = {
		chance: (typeof chance !== "undefined") ? chance : .25,		
		rate: (typeof rate !== "undefined") ? rate : _16,
		length: (typeof length !== "undefined") ? length : _4,
		shouldRandomizeReverse : (typeof shouldRandomizeReverse === "undefined") ? true : shouldRandomizeReverse,
		shouldRandomizePitch : (typeof shouldRandomizePitch === "undefined") ? true : shouldRandomizePitch,		
		name : "Schizo",
		type: "fx",
		gens :  [],
		mods :  [],
		value : 0,
		readIndex : 0,
		writeIndex : 0,
		increment : 1,
		phase : 0,
		isCrazy : false,
		crazyTime : 0,
		reverse : false,
		reverseChance : .5,
		pitchShifting : false,
		pitchChance : .5,
		mix : 1,
		fadeCount : 0,
		shouldFade : false,
		shouldPrint : false,

		pushSample : function(sample) {
			var val = sample;
			this.writeBuffer[this.writeIndex++] = val;
			if (this.writeIndex >= this.writeBufferLength) {
				this.writeIndex = 0;
			}
			
			if(this.shouldFade && !this.isCrazy) {
				var crazySample = Sink.interpolate(this.readBuffer, this.readIndex);

				if(this.reverse) {
					this.readIndex -= this.increment;
						
					if(this.readIndex < 0) {
						this.readIndex += this.length * 2;
					}
				}else{
					this.readIndex += this.increment;
						
					if(this.readIndex >= (this.length * 2) - 1) {
						this.readIndex = this.readIndex - (this.length * 2);
					}
				}

				val *= 1 - this.fadeCount;
				val += crazySample * this.fadeCount;
				// var amt = .03
				// if(this.fadeCount === 1 - amt) {
				// 	for(var i = 0; i < .06; i += .01) {
				// 		var pos = this.readIndex - this.increment - (this.increment * (amt - i));
				// 		console.log("s" + i + " : " + pos + " : " + Sink.interpolate(this.readBuffer, pos));					
				// 	}
				// 	console.log("CURRENT: " + crazySample);					
				// }
				var previousSample = Sink.interpolate(this.readBuffer, this.readIndex - this.increment - this.increment - this.increment);
				
				this.fadeCount -= .001;
				if(this.fadeCount <= 0) {
					this.shouldFade = false;
					this.fadeCount = 0;
				}
			}

			if(++this.phase === Math.floor(this.rate)) {
				if(!this.isCrazy) {
					if(Math.random() < this.chance) {				
						this.isCrazy = true;
						var readHead = this.writeIndex - this.length; //(this.length * rndi(1,4));
						if(readHead < 0) readHead = this.writeBufferLength + readHead;

						readHead = Math.floor(readHead);
						
						for(var i = 0; i < this.length * 2; i++) {
							this.readBuffer[i] = this.writeBuffer[readHead++];
							if(readHead >= this.writeBufferLength) {
								readHead = 0;
							}
						}					
						
						if(this.shouldRandomizeReverse) {
							this.reverse = (Math.random() < this.reverseChance) ? true : false;
						}
						this.readIndex = (this.reverse) ? this.length - 1 : 0;

						if(this.shouldRandomizePitch) {
							this.pitchShifting = (Math.random() < this.pitchChance) ? true : false;
						}
						this.increment = (this.pitchShifting) ? rndf(.5, .95) : 1;
						
						this.crazyTime = 0;
						this.fadeCount = 1;
					}
				}
				this.phase = 0;
			}else{
				if(this.isCrazy) {
					val = Sink.interpolate(this.readBuffer, this.readIndex);

					if(this.fadeCount > 0) {
						val *= 1 - this.fadeCount;
						this.fadeCount -= .001;
						val += sample * this.fadeCount;
					}
					
					this.readIndex += this.increment;
						
					if(this.readIndex >= (this.length * 2) - 1) {
						this.readIndex = this.readIndex - this.length * 2 ;
					}
					
					if(++this.crazyTime >= this.length - 1) {
						this.isCrazy = false;
						this.crazyTime = 0;
						this.fadeCount = 1;
						this.shouldFade = true;
						this.shouldPrint = true;
					}
					if(this.shouldPrint) {
						console.log("VALUE : " + val);
						this.shouldPrint = false;
					}
					
				}
			}
			
			this.value = val;
		},
		getMix : function() {
			return this.value;
		},
	};
	
	that.writeBuffer = new Float32Array(that.length * 2);
	that.writeBufferLength = that.length * 2;		
	that.readBuffer  = new Float32Array(that.length * 2);

	Gibber.addModsAndFX.call(that);
	
	// (function(obj) {
	// 	var _that = obj;
	// 	var rate = that.rate;
	// 
	//     Object.defineProperties(_that, {
	// 		"rate" : { 
	// 			get: function() {
	// 				return rate;
	// 			},
	// 			set: function(value) {
	// 				rate = value;
	// 				_that.delayMod.frequency = rate;
	// 			}
	// 		},
	// 	});
	// })(that);
	
	return that;
}