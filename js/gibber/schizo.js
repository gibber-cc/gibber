function Schizo(chance, rate, length, shouldRandomizePitch, shouldRandomizeReverse) {
	var that = {
		chance: (typeof chance !== "undefined") ? chance : .5,		
		rate: (typeof rate !== "undefined") ? rate : _1,
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
		pitchShifting : false,
		mix : 1,

		pushSample : function(sample) {
			var val = sample;
			
			if(isNaN(sample)) G.log( "ALERT");
			this.writeBuffer[this.writeIndex++] = val;
			if (this.writeIndex >= this.writeBufferLength) {
				this.writeIndex = 0;
			}
			if(++this.phase === Math.floor(this.rate)) {
				if(!this.isCrazy) {
					if(Math.random() < this.chance) {
						G.log("CRAZY");
						
						this.isCrazy = true;
						var readHead = this.writeIndex - (this.length * rndi(1,4));
						while(readHead < 0) {
							readHead += this.length; // loop through end
						}
						readHead = Math.floor(readHead);
						for(var i = 0; i < this.length; i++) {
							this.readBuffer[i] = this.writeBuffer[readHead++];
							if(readHead >= this.writeBufferLength) {
								readHead = 0;
							}
						}					
						
						if(this.shouldRandomizeReverse) {
							this.reverse = (Math.random() > .5) ? true : false;
						}
						this.readIndex = (this.reverse) ? this.length - 1 : 0;

						if(this.shouldRandomizePitch) {
							this.pitchShifting = (Math.random() > .5) ? true : false;
						}
						this.increment = (this.pitchShifting) ? rndf(.5, 2) : 1;
						
						this.readIndex = Math.floor(this.readIndex);
						this.crazyTime = 0;
					}
				}
				this.phase = 0;
			}else{
				if(this.isCrazy) {
					val = Sink.interpolate(this.readBuffer, this.readIndex);
					if(G.debug) G.log(this.increment + " : " + this.readIndex + " : " + val);
					
					if(this.reverse) {
						this.readIndex -= this.increment;
						
						if(this.readIndex < 0 || this.readIndex >= this.length) {
							this.readIndex = this.length - 1;
						}
					}else{
						this.readIndex += this.increment
						
						if(this.readIndex >= this.length || this.readIndex < 0) {
							this.readIndex = 0;
						}
					}

					if(this.crazyTime++ > this.rate) {
						this.isCrazy = false;
						this.crazyTime = 0;
						this.increment = 0;
						G.log("ENDING CRAZY TIME");
					}
				}
			}
			
			this.value = val;
			//var s = Sink.interpolate(this.buffer, r);
		},
		getMix : function() {
			return this.value;
		},
	};
	
	that.writeBuffer = new Float32Array(Gibber.sampleRate * 2);
	that.writeBufferLength = Gibber.sampleRate * 2;		
	that.readBuffer  = new Float32Array(that.length);

	Gibber.addModsAndFX.call(that);
	
	// TODO: Fix so this changes the speed of the LFO
	(function(obj) {
		var _that = obj;
		var rate = that.rate;
	
	    Object.defineProperties(_that, {
			"rate" : { 
				get: function() {
					return rate;
				},
				set: function(value) {
					rate = value;
					_that.delayMod.frequency = rate;
				}
			},
		});
	})(that);
	
	return that;
}