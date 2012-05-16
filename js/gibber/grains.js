function Grains() {
	var args = (typeof arguments[0] === "undefined") ? {} : arguments[0];
	var that = Rec();
	that.name = "Grains";
	that.grains = [];
	that.numGrains = args.numberOfGrains || 10;
	that.grainSize = args.grainSize || ms(100);
	that.envelopeSize = args.envelopeSize || .1;
	that.shouldRandomizeSpeed = (typeof args.shouldRandomizeSpeed !== "undefined") ? args.shouldRandomizeSpeed : false;
	that.range = args.range || [.25, 2];
	that.shouldReverse = (typeof args.shouldReverse !=="undefined") ? args.shouldReverse : true;
	
	for(var i = 0; i < that.numGrains; i++) {
		that.grains[i] = {
			start: rndi(0, that.length),
			length: that.grainSize,
			pos: 0,
			amp: 1 / that.numGrains,
			speed : (that.shouldRandomizeSpeed) ? 1 : rndf(that.range[0], that.range[1]),
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
				
				if(this.pos > this.length && this.speed > 0) {
					this.speed = rndf(this.parent.range[0], this.parent.range[1]);
					if(this.parent.shouldReverse) {
						if(Math.random() > .5) this.speed *= -1;
					}
					if(this.speed > 0) {
						this.pos = this.pos - this.length;
					}
					this.start = rndi(0, this.parent.length);
				}else if(this.pos < 0 && this.speed < 0) {
					this.speed = rndf(this.parent.range[0], this.parent.range[1]);
					if(this.parent.shouldReverse) {
						if(Math.random() > .5) this.speed *= -1;
					}
					if(this.speed < 0) {
						this.pos = this.length;
					}	
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