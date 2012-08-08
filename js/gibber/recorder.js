function Record(input, length, shouldStart, speed) {
	var that = Gibberish.Record(input, length, shouldStart, speed);
	that.send(Master, that.amp);
	if(typeof shoudldStart === "undefined" || shouldStart) {
		that.startRecording();
	}
	return that;
}

function Sampler(pathToFile) {
	var that = Gibberish.Sampler(pathToFile);
	that.send(Master, 1);
	return that;
}

/*function Rec() {
	var args = (typeof arguments[0] === "undefined") ? {} : arguments[0];
	var that = {
		name 	: "Rec",
		length 	: args.length || _1,
		mode 	: "insert",
		value 	: 0,
		amp 	: args.amp || 1,
		sampleCount : 0,
		mods 	: [],
		fx		: [],
		effect	: null,
		added	: false,
		active	: true,
		speed 	: args.speed || 1,
		mix		: 1,
		playFlag: false,
		insert 	: function(gen) {
			this.mode = "record";
			gen.fx.add(this);
			this.sampleCount = 0;
			this.effect = gen;
		},
		
		insertAndPlay : function(gen) {
			this.playFlag = true;
			this.insert(gen);
		},
		
		generate : function() {
			this.value = Sink.interpolate(this.buffer, this.sampleCount);
			this.sampleCount += this.speed;
			if(this.sampleCount >= this.length) {
				this.sampleCount = this.length - this.sampleCount;
			}
		},
		
		getMix	: function() {
			return this.value * this.amp;
		},
		
		kill : function() {
			Gibber.genRemove(this);
			this.masters.length = 0;
			this.mods.length = 0;
			this.fx.length = 0;
		},
		
		out : function() {
			this.generate();
			return this.getMix();
		},
		
		pushSample : function(incoming) {
			this.buffer[this.sampleCount++] = incoming;
			if(this.sampleCount >= this.length) {
				this.remove(this.effect);
				if(this.playFlag) {
					this.play();
					this.playFlag = false;
				}
			}
			return this.value = incoming;
		},
		
		play : function() {
			if(!this.added) {
				Gibber.generators.push(this);
			}
			this.active = true;
		},
		
		remove 	: function(gen) {
			this.mode = "playback";
			gen.fx.remove(this.name);
			this.sampleCount = 0;
			this.effect = null;
		},
		
		stop : function() {
			this.active = false;
		},

	};
	that.buffer = new Float32Array(that.length);
	G.addModsAndFX.call(that);
	return that;
}*/