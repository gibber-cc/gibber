Gibber.GrainsPresets = {
	tight : {
		numberOfGrains : 10,
		grainSize : ms(25),
		positionVariance : .01,
		pitchVariance : .01,
		shouldReverse : false,
		length: 88200,
	},
	cloudy : {
		numberOfGrains : 20,
		grainSize : ms(100),
		positionVariance : .05,
		pitchVariance : .1,
		shouldReverse : true,
	}
};

function Grains() {
	var args = (typeof arguments[0] === "undefined") ? {} : arguments[0];
	
	if(typeof arguments[0] === "string") {
		args = Gibber.GrainsPresets[arguments[0]];
		if(typeof arguments[1] !== "undefined") {
			$.extend(args, arguments[1]);
		}
	}
	
	var that = Rec(args);
	$.extend(that, {
		name 				 : "Grains",
		grains 				 : [],
		numGrains 			 : args.numberOfGrains || 10,
		grainSize 			 : args.grainSize || ms(50),
		envelopeSize 		 : args.envelopeSize || .1,
		positionCenter 		 : args.positionCenter   || .5,
		positionVariance 	 : args.positionVariance || .5,		
		pitchCenter 		 : args.pitchCenter 	|| 1,
		pitchVariance 		 : args.pitchVariance 	|| .5,
		shouldReverse 		 : (typeof args.shouldReverse !=="undefined") ? args.shouldReverse : true,
	});

	for(var i = 0; i < that.numGrains; i++) {
		that.grains[i] = {
			start: Math.floor(rndf(that.positionCenter - that.positionVariance, that.positionCenter + that.positionVariance) * that.length),
			length: that.grainSize,
			pos: 0,
			amp: 1 / that.numGrains,
			speed : rndf(that.pitchCenter - that.pitchVariance, that.pitchCenter + that.pitchVariance),
			parent : that,
			envLength : that.envelopeSize * that.grainSize,
			
			generate: function() {
				this.value = Sink.interpolate(this.parent.buffer, this.start + this.pos);
				
				if(this.pos < this.envLength) {
					this.value *= this.pos / this.envLength
				}else if(this.pos > this.length - this.envLength) {
					this.value *= (this.length - this.pos) / this.envLength;
				}
				
				this.pos += this.speed;
				
				if((this.pos > this.length && this.speed > 0) || (this.pos < 0 && this.speed < 0)) {
					this.speed = rndf(this.parent.pitchCenter - this.parent.pitchVariance, this.parent.pitchCenter + this.parent.pitchVariance);
					
					if(this.parent.shouldReverse) {
						if(Math.random() > .5) this.speed *= -1;
					}
					
					if(this.speed > 0 && this.pos > this.length) {
						this.pos = this.pos - this.length;
					}else if(this.speed < 0 && this.pos < 0) {
						this.pos = this.length;
					}	
					
					this.length = this.parent.grainSize;
					this.start = Math.floor( 
						rndf( 
						this.parent.positionCenter - this.parent.positionVariance, 
						this.parent.positionCenter + this.parent.positionVariance
					) * this.parent.length);
				}
				
				if(this.start + this.pos >= this.parent.length) {
					this.start = this.start - this.parent.length;
				}else if(this.start + this.pos < 0) {
					this.start = this.length + this.start + this.pos;
				}

				return this.value * this.amp;
			},
		}
	}
	
	that.set = function(prop, value) {
		// we must let current grains play out their length
		// grainSize is only assigned when grains have finished playing
		if(prop === "length") {
			this.grainSize = value;
			return;
		}
		for(var i = 0; i < this.numGrains; i++) {
			this.grains[i][prop] = value;
		}
	};
	
	that.generate = function() {
		this.value = 0;
		for(var i = 0; i < this.numGrains; i++) {
			this.value += this.grains[i].generate();
		}
	};
	G.addModsAndFX.call(that);
	
	return that;
}