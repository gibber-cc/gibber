define([], function() {
    return {
		init : function(gibberish) {
			gibberish.Kick = Gen({
				name:"Kick",
				props: {cutoff:.01, decay:5, tone: 660, amp:1 },
				upvalues: { trigger:false, bpf: null, lpf:null },
  
				init : function() {
					var bpf = Gibberish.SVF();
					bpf.channels = 1;
					var lpf = Gibberish.SVF();
					lpf.channels = 1;
					
					this.function.setLpf( lpf.function );
					this.function.setBpf( bpf.function );
				},
				
				setters : {
					decay: function(val, f) {
						f(val * 100);
					},
					tone: function(val, f) {
						f(220 + val * 800);
					},
				},
  
				callback: function(cutoff, decay, tone, amp) {
					var out;

					if(trigger) {
						out = bpf( [60], cutoff, decay, 2, 1 );
						out = lpf( out, tone, .5, 0, 1 );
						trigger = false;
					}else{
						out = bpf( [0], cutoff, decay, 2, 1 );
						out = lpf( out, tone, .5, 0, 1 );						
					}
    				
					out[0] *= amp;
					return out;
				},
  
				note : function(c, d, t, amp) {
					if(c) this.cutoff = c;					
					if(d) this.decay = d; 
					if(t) this.tone = t
					if(amp) this.amp = amp;
					
					this.function.setTrigger(true); 
				},
			});
			
			gibberish.Snare = Gen({
				name:"Snare",
				props: { amp:2 },
				upvalues: { count:44, rnd:Math.random, lpf:null },
  
				init : function() {
					var lpf = Gibberish.SVF();
					lpf.channels = 1;
					
					this.function.setBpf( filt.function );
				},
  
				callback: function(cutoff, decay, tone, amp) {
					var val = [0];
					//cutoff, resonance, isLowPass, channels
					if(count++ <= 0) {
						val = bpf( [1], cutoff, decay, 2, 1 );
						val = lpf( val, tone, .5, 0, 1 )[0];
					}else{
						val = bpf( [0], cutoff, decay, 2, 1 );
						val = lpf( [val], tone, .5, 0, 1 )[0];						
					}
    
					return [val * amp];
				},
  
				note : function(c, d, t, amp) {
					if(c) this.cutoff = c;					
					if(d) this.decay = d * .002; 
					if(t) this.tone = 220 + t * 800;
					if(amp) this.amp = amp * 60;
					
					this.function.setCount(0); 
				},
			});
			
			// b = bd();
			// 
			// b.connect(Master);
		},
	}
});