define([], function() {
    return {
		init : function(gibberish) {
			gibberish.Kick = Gen({
				name:"Kick",
				props: {cutoff:.01, resonance:4, amp:2 },
				upvalues: { count:0, filter: null, },
  
				init : function() {
					var filt = Gibberish.Filter24();
					filt.init();
					this.function.setFilter( filt.function );
				},
  
				callback: function(cutoff, resonance, amp) {
					var val = [0];
					//cutoff, resonance, isLowPass, channels
					if(count++ < 6) {
						val = filter([1], cutoff, resonance, true, 1);
					}else{
						val = filter([0], cutoff, resonance, true, 1);
					}
    
					return [val * amp];
				},
  
				note : function(c, r, amp) {
					if(r) this.resonance = r;
					if(c) this.cutoff = c;
					if(amp) this.amp = amp;
					this.function.setCount(0); 
				},
			});

			// b = bd();
			// 
			// b.connect(Master);
		},
	}
});