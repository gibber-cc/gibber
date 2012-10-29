define([], function() {
    return {
		init : function(gibberish) {
			gibberish.Kick = Gen({
				name:"Kick",
				props: {cutoff:55, decay:5, tone: 660, amp:1 },
				upvalues: { trigger:false, bpf: null, lpf:null },
  
				init : function() {
					var bpf = Gibberish.SVF();
					bpf.channels = 1;
					var lpf = Gibberish.SVF();
					lpf.channels = 1;
					
					
					console.log("KICK INIT");
					
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
			
			// 808 snare is actually two of the 808 kick oscillators http://www.soundonsound.com/sos/Apr02/articles/synthsecrets0402.asp
			// but I do a simpler filtered noise burst here.
			gibberish.Snare = Gen({
				name:"Snare",
				props: { cutoff:.6, decay:11025, tune:0, amp:2 },
				upvalues: { phase:11026, partial1:null, bpf1: null, lpf1:null, bpf2:null, lpf2:null, rnd:Math.random, noiseLPF:null, cutoffIncr:0 },
  
				init : function() {
					var noiseLPF = Gibberish.SVF(); //Gibberish.Filter24(.6, 2, true);
					noiseLPF.channels = 1;
					
					var bpf1 = Gibberish.SVF();
					bpf1.channels = 1;
					var bpf2 = Gibberish.SVF();
					bpf2.channels = 1;
										
					this.function.setBpf1( bpf1.function );
					this.function.setBpf2( bpf2.function );

					this.function.setNoiseLPF( noiseLPF.function );
				},
				//				callback : function(sample, cutoff, resonance, isLowPass, channels) {

				callback: function(cutoff, decay, tune, amp) {
					var val, p1, p2, noise = 0, env = 0;

					if(phase++ <= decay) {
						env = 1 - phase / decay;
						
						val = [ ( rnd() * 2 - 1) * env + env];
						//val = noiseLPF( val, cutoff - ((1 - env) * cutoff / 2), 0, true, 1 );
						//p1 = bpf1( val, 180 * (tune + 1), 4, 2, 1 );
						//p2 = bpf2( val, 330 * (tune + 1), 4, 2, 1 );
						
						//						out = lpf( out, tone, .5, 0, 1 );
						noise = noiseLPF( val, cutoff, .5, 1, 1 )[0];
					}else{
						val = [0];
						noise = 0;
					}
					
					var _env = [env];
					p1 = bpf1( _env, 180 * (tune + 1), 15, 2, 1 );
					p2 = bpf2( _env, 330 * (tune + 1), 15, 2, 1 );
					
					val[0] += noise;
					val[0] += p1[0]; 
					val[0] += p2[0] * .8;
					val[0] *= amp;
    				
					return val;
				},
  
				note : function(c, d, amp) {
					console.log(c,d,amp);
					if(c) this.cutoff = c;					
					if(d) this.decay = d; 
					if(amp) this.amp = amp;
					
					//this.function.setCutoffIncr( this.cutoff / 2 / this.decay );
					this.function.setPhase(0);
					//this.function.getPartial1().setTrigger(true);
					//this.function.getPartial2().setTrigger(true);
				},
			});
		},
	}
});