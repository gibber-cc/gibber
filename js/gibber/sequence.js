function Seq(_seq, speed, gen) {
	sequence = _seq;
	speed = isNaN(speed) ? _4 : speed;
	
	var that = {
		_sequence : sequence,
		sequence : sequence,
		_start : true,
		counter : -1,
		speed: speed,
		outputMessage:"note",
		active:true,
		slaves: [],
		phase: 0,
		init: true,
	}
	
	that.setSequence = function(seq, speed, shouldReset) {
		if(typeof speed != "undefined") {
			if(!shouldReset) {
				this.phase -= this.speed - speed;
			}
			this.speed = speed;
		}
		
		this.sequence = [];
		
		for(var i = 0; i < seq.length; i++) {
			var n = seq[i];
			this.sequence[i] = n;
		}
		
		if(shouldReset) {
			this.phase = 0;
		}
		
		this.sequenceLengthInSamples = seq.length * speed;
	};
	
	that.slave = function(gen) {
		this.slaves.push(gen);
	};
	
	that.free = function() {
		if(arguments.length == 0) {
			this.slaves.length = 0;
		}else{
			this.slaves.splice(arguments[0], 1);
		}
	};
	
	that.stop = function() {
		this.active = false;
	};
	
	that.pause = function() {
		this.active = false;
	};
		
	that.play = function() {
		this.active = true;
		this.phase = 0;
	};
	
	that.generate = function() {
		this.value = 0;
		if(!this.active) {
			return;
		}
		
		if(this.phase % this.speed == 0) {
			this.counter++;
			for(j = 0; j < this.slaves.length; j++) {
				var slave = this.slaves[j];
				slave[this.outputMessage](this.sequence[this.counter % this.sequence.length]);
			}
		}
			
		if(this.phase >= this.sequence.lengthInSamples) { 
			if(this.shouldBreak) { 
				this.shouldBreak = false;
				if(!this.breakToOriginal) {
					this.sequences = jQuery.extend(true, {}, this.preBreakSequences);
				}else{
					this.sequences = jQuery.extend(true, {}, this._sequences);
				}
			}
			this.phase = 0;
		}else{
			this.phase++;
		}
	}
	
	that.getMix = function(){
		return 0;
	}
	
	that.out = function() {
		this.generate();
		return 0;
	}
	that.set = function(newSequence) {
		this.sequence = newSequence;
		this.setSequence(this.sequence);
	}
	
	that.setSequence(that.sequence);
	
	Gibber.controls.push(that);
	
	console.log(typeof gen);
	if(typeof gen !== "undefined") {
		that.slave(gen);
	}
	return that;
}
	

	
	