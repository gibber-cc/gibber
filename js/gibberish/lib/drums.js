define([], function() {
    return {
		init : function(gibberish) {
			gibberish.Kick = Gen({
				name:		"Kick",
				props:		{ pitch:55, decay:5, tone: 660, amp:1 },
				upvalues:	{ trigger:false, bpf: null, lpf: null },
  
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
  
				callback: function(pitch, decay, tone, amp) {
					var out;

					if(trigger) {
						out = bpf( [60], pitch, decay, 2, 1 );
						out = lpf( out, tone, .5, 0, 1 );
						trigger = false;
					}else{
						out = bpf( [0], pitch, decay, 2, 1 );
						out = lpf( out, tone, .5, 0, 1 );						
					}
    				
					out[0] *= amp;
					return out;
				},
  
				note : function(p, d, t, amp) {
					if(p) this.pitch = c;					
					if(d) this.decay = d; 
					if(t) this.tone = t
					if(amp) this.amp = amp;
					
					this.function.setTrigger(true); 
				},
			});
			
			// 808 snare is actually two of the 808 kick oscillators http://www.soundonsound.com/sos/Apr02/articles/synthsecrets0402.asp
			// plus some filtered and contoured noise
			gibberish.Snare = Gen({
				name:"Snare",
				props: { cutoff:1000, decay:11025, tune:0, snappy:1, amp:1 },
				upvalues: { phase:11025, bpf1: null, bpf2:null, rnd:Math.random, noiseHPF:null, eg:null },
  
				init : function() {
					var noiseHPF = Gibberish.SVF();
					noiseHPF.channels = 1;
					
					var bpf1 = Gibberish.SVF();
					bpf1.channels = 1;
					var bpf2 = Gibberish.SVF();
					bpf2.channels = 1;
					
					this.eg = Gibberish.EG( .0025, 11025 );
					this.eg.function.setPhase(1);
					
					this.function.setEg( this.eg.function );
					this.function.setBpf1( bpf1.function );
					this.function.setBpf2( bpf2.function );

					this.function.setNoiseHPF( noiseHPF.function );
				},

				callback: function(cutoff, decay, tune, snappy, amp) {
					var val, p1, p2, noise = 0, env = 0;

					env = eg(.0025, decay);
						
					noise = [ ( rnd() * 2 - 1 ) * env ];
					noise = noiseHPF( noise, cutoff + tune * 1000, .5, 1, 1 );
					noise[0] *= snappy;
					val = noise;

					var _env = [env];

					p1 = bpf1( _env, 180 * (tune + 1), 15, 2, 1 );
					p2 = bpf2( _env, 330 * (tune + 1), 15, 2, 1 );
					
					val[0] += p1[0]; 
					val[0] += p2[0] * .8;
					val[0] *= amp;

					return val;
				},
  
				note : function(c, s, amp) {
					if(c) this.cutoff = c;					
					if(s) this.snappy = s; 
					if(amp) this.amp = amp;
					
					this.eg.function.setPhase(0);
				},
			});
		},
	}
});