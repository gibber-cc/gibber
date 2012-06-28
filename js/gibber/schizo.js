function Schizo(chance, rate, length, shouldRandomizePitch, shouldRandomizeReverse) {
	if(typeof Gibber.SchizoPresets === "undefined") {
		Gibber.SchizoPresets = {
			sane: {
				chance			: .1,
				reverseChance 	: 0,
				pitchChance		: .5,
				mix				:.5,
			},
			borderline: {
				chance			: .1,		
				pitchChance		: .25,
				reverseChance	: .5,
				mix				: 1,
			},
			paranoid: {
				chance			: .2,
				reverseChance 	: .5,
				pitchChance		: .5,
				mix				: 1,
			},
		};
	}
	
	var that = {
		chance: (typeof chance !== "undefined" && typeof chance !== "string") ? chance : .25,		
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
		advanceReadIndex : function() {
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
		},

		pushSample : function(inputSample) {
			this.writeBuffer[++this.writeIndex] = inputSample;
			var output = inputSample;
			if(this.writeIndex >= this.writeBufferLength) this.writeIndex = -1;

			if(!this.isCrazy) {
				if(this.fading) {
					this.advanceReadIndex();
										
					if(this.fadeAmount >= .0025) {
						var old = Sink.interpolate(this.readBuffer, this.readIndex);
						output = (inputSample * (1 - this.fadeAmount)) + (old * this.fadeAmount);
						//if(this.fadeAmount >= .998) console.log("last : " + this.value + " | now : " + output);
						this.fadeAmount -= .0025;	
					}else{
						this.fading = false;
						output = inputSample;
					}
				}else{
					output = inputSample;
				}
				
				if(this.phase++ % this.rate < 1) {
					if(Math.random() < this.chance) {
						this.isCrazy = true;
						this.fading = true;
						this.fadeAmount = 1;
		
						if(this.shouldRandomizePitch) this.pitchShifting = (Math.random() < this.pitchChance);
						this.increment = (this.pitchShifting) ? rndf(this.pitchMin, this.pitchMax) : 1;
		
						if(this.shouldRandomizeReverse) this.reverse = (Math.random() < this.reverseChance);			
						this.readIndex = this.reverse ? this.length - 1 : 0;
		
						var readPos = this.writeIndex - this.length;
						if(readPos < 0) readPos += this.writeBufferLength;
		
						for(var i = 0; i < this.length * 2; i++) {
							this.readBuffer[i] = this.writeBuffer[readPos++];
							if(readPos >= this.writeBufferLength) readPos = 0;
						}
					}
				}
			}else{
				this.advanceReadIndex();
				var loopedSample = Sink.interpolate(this.readBuffer, this.readIndex);
	
				if(this.fading) {
					if(this.fadeAmount >= .0025) {
						output = (loopedSample * (1 - this.fadeAmount)) + (inputSample * this.fadeAmount);
						this.fadeAmount -= .0025;
					}else{
						output = loopedSample;
						this.fading = false;
					}
				}else{
					output = loopedSample;
				}
	
				if(++this.loopPhase >= Math.floor(this.length) - 400) {
					this.isCrazy = false;
					this.fading = true;
					this.fadeAmount = 1;
					this.loopPhase = 0;
				}
			}
			this.value = output;
		},
		getMix : function() {
			return this.value;
		},
	};
	
	if(typeof arguments[0] === "object") {
		var obj = arguments[0];
		$.extend(obj, arguments[0]);
		for(key in obj) {
			that[key] = obj[key];
		}
		if(typeof that["chance"] === "undefined") {
			that["chance"] = .5;
		}
	}else if(typeof arguments[0] === "string") {
		$.extend(that, Gibber.SchizoPresets[arguments[0]]);
	}
	
	that.writeBuffer = new Float32Array(Math.floor(that.length * 2));
	that.writeBufferLength = Math.floor(that.length * 2);		
	that.readBuffer  = new Float32Array(Math.floor(that.length * 2));

	Gibber.addModsAndFX.call(that);
	
	return that;
}