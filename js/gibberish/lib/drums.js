define([], function() {
    return {
		init : function(gibberish) {
			gibberish.Kick = Gen({
				name:		"Kick",
				props:		{ pitch:60, decay:50, tone: 500, amp:2 },
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
				props: { cutoff:1000, decay:11025, tune:0, snappy:.5, amp:1 },
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
			
			gibberish.Hat = Gen({
				name: "Hat",
				props : { amp: 1 },
				upvalues: { s1:null, s2:null, s3:null, s4:null, s5:null, s6:null, bpf:null, hpf:null, hpf2:null, eg:null, decay:10500 },
				
				init : function() {
					this.s1 = Gibberish.Square(); 
					this.s2 = Gibberish.Square();
					this.s3 = Gibberish.Square();
					this.s4 = Gibberish.Square();
					this.s5 = Gibberish.Square();
					this.s6 = Gibberish.Square();
					
					this.function.setS1(this.s1.function);
					this.function.setS2(this.s2.function);
					this.function.setS3(this.s3.function);
					this.function.setS4(this.s4.function);
					this.function.setS5(this.s5.function);
					this.function.setS6(this.s6.function);
					
					this.hpf = Gibberish.SVF();
					this.hpf2 = Gibberish.SVF();
										
					this.function.setHpf(this.hpf.function);
					this.function.setHpf2(this.hpf2.function);
					
					this.bpf = Gibberish.SVF();
					this.function.setBpf(this.bpf.function);					
					
					this.eg = Gibberish.EG( .0025, 11025 );
					this.eg.function.setPhase(1);
					
					this.function.setEg(this.eg.function);
				},
				
				callback : function(amp) {
					var val = 0;
					val += s1(540, .35, 1, 0)[0];
					val += s2(800, .35, 1, 0)[0];
					val += s3(863, .2, 1, 0)[0];
					val += s4(1013, .2, 1, 0)[0];
					val += s5(1427, .2, 1, 0)[0];
					val += s6(1860 , .2, 1, 0)[0];
					
					val = bpf( [val], 5000, .75, 2, 1 );
					val = hpf2( val, 5500, .5, 1, 1 );
					
					val[0] *= eg(.001, decay);
					
					val = hpf( val, 5500, 3, 1, 1 );
					
					val[0] *= amp;
					
					return val;
				},
				
				note : function(_decay) {
					this.eg.function.setPhase(0);
					if(_decay)
						this.function.setDecay(_decay);
				}
				
			});
		},
	}
});