function Grains() {
	//var args = (typeof arguments[0] === "undefined") ? {} : arguments[0];
	var that = Rec();
	that.name = "Grains";
	that.grains = [];
	that.numGrains = 5;
	that.grainSize = 100;
	
	for(var i = 0; i < that.numGrains; i++) {
		that.grains[i] = {
			start: rndi(0, that.length),
			length: (G.sampleRate / 1000) * that.grainSize,
			pos: 0,
			env: 1 / that.numGrains,
			speed : 1,
			parent : that,
			generate: function() {
				if(G.debug) console.log(this.parent);
				this.value = Sink.interpolate(this.parent.buffer, this.start + this.pos);
				this.pos += this.speed;
				if(this.pos > this.length) {
					this.pos = this.pos - this.length;
					this.start = rndi(0, this.parent.length);
				}
				if(this.start + this.pos > this.parent.length) {
					this.start = this.pos - this.parent.length;
				}
				return this.value;
			},
		}
	}

	that.generate = function() {
		// this.value = Sink.interpolate(this.buffer, this.sampleCount);
		// 		this.sampleCount += this.speed;
		// 		if(this.sampleCount >= this.length) {
		// 			this.sampleCount = this.length - this.sampleCount;
		// 		}
		this.value = 0;
		for(var i = 0; i < this.numGrains; i++) {
			this.value += this.grains[i].generate();
		}
	};
	G.addModsAndFX.call(that);
	
	return that;
}