function Flanger(speed, amount, feedback) {
	var that = {
		speed: (typeof speed !== "undefined") ? speed : .25,
		amount: (typeof amount !== "undefined") ? amount : 125,
		name : "Flanger",
		type: "fx",
		gens :  [],
		mods :  [],
		value : 0,
		writeIndex : 0,
		mix : 1,
		feedback : (isNaN(feedback)) ? .25 : feedback,

		pushSample : function(sample) {
			var r = this.readIndex + this.rateMod.out();
			if(r > this.bufferSize) {
				r = r - this.bufferSize;
			}else if(r < 0) {
				r = this.bufferSize + r;
			}
			
			var s = Sink.interpolate(this.buffer, r);

			this.buffer[this.writeIndex++] = sample + (s * this.feedback);
			if (this.writeIndex >= this.bufferSize) {
				this.writeIndex = 0;
			}
			
			this.readIndex++;
			if (this.readIndex >= this.bufferSize) {
				this.readIndex = 0;
			}
			
			this.value = s + sample;
		},
		getMix : function() {
			return this.value;
		},
	};
	
	that.buffer = new Float32Array(Gibber.sampleRate * 2);
	that.bufferSize = Gibber.sampleRate * 2;
	that.readIndex = that.amount * -1;
	
	that.rateMod = LFO(that.speed, that.amount * .95);
	
	Gibber.addModsAndFX.call(that);
	
	return that;
}
