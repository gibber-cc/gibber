function Flanger(rate, amount, feedback, offset) {
	var that = {
		rate: (typeof rate !== "undefined") ? rate : .25,
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
			var r = this.readIndex + this.delayMod.out();
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
	that.offset = offset || that.amount;
	
	that.buffer = new Float32Array(Gibber.sampleRate * 2);
	that.bufferSize = Gibber.sampleRate * 2;
	that.readIndex = that.offset * -1;
	
	that.delayMod = LFO(that.rate, that.amount * .95); // *.95 to ensure it never catches up with write head
	
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

// cheap chorus using a flanger see http://denniscronin.net/dsp/article.html
function Chorus(rate, amount) {
	var _rate = rate || 2;
	var _amount = amount || 50;
	that = Flanger(rate, amount, 0, 880); // 20ms offset
	that.name = "Chorus";
	
	return that;
}
