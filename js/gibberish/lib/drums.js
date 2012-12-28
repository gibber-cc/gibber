define([], function() {
    return {
		init : function(gibberish) {
			gibberish.Kick = Gen({
				name:		"Kick",
				props:		{ pitch:60, decay:50, tone: 500, amp:2 },
				upvalues:	{ trigger:false, bpf: null, lpf: null, out:[0] },
  
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
					out[0] = trigger ? 60 : 0;
    				
					out = bpf( out, pitch, decay, 2, 1 );
					out = lpf( out, tone, .5, 0, 1 );
					
					out[0] *= amp;
					
					trigger = false;
					
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
				upvalues: { phase:11025, bpf1: null, bpf2:null, rnd:Math.random, noiseHPF:null, eg:null, out:[0], envOut:[0] },
  
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
					var p1, p2, noise = 0, env = 0;

					env = eg(.0025, decay);
					
					if(env > .005) {	
						out[0] = ( rnd() * 2 - 1 ) * env ;
						out = noiseHPF( out, cutoff + tune * 1000, .5, 1, 1 );
						out[0] *= snappy;
						//val = noise;
						envOut[0] = env;
						
						p1 = bpf1( envOut, 180 * (tune + 1), 15, 2, 1 );
						p2 = bpf2( envOut, 330 * (tune + 1), 15, 2, 1 );
					
						out[0] += p1[0]; 
						out[0] += p2[0] * .8;
						out[0] *= amp;
						out[1] = out[0];
					}else{
						out[0] = out[1] = 0;
					}

					return out;
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
				props : { amp: 1, pitch: 325, bpfFreq:5500, bpfRez:55, hpfFreq:.85, hpfRez:3, decay:4500, decay2:10000 },
				upvalues: { 
					s1:null, s2:null, s3:null, s4:null, s5:null, s6:null, 
					bpf:null, bpf2:null,
					hpf:null, hpf2:null, hpf3:null,
					hpf24: null, 
					eg:null, eg2:null,
				},
				
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
					
					this.hpf = Gibberish.Filter24();
					this.hpf2 = Gibberish.SVF();
					this.hpf3 = Gibberish.SVF();
					this.hpf24 = Gibberish.Biquad();
					this.hpf24.cutoff = 5270;
					this.hpf24.Q = 1;
					this.hpf24.mode = "HP";
					
					this.hpf2 = Gibberish.Biquad();
					this.hpf2.cutoff = 5270;
					this.hpf2.Q = 5;
					this.hpf2.mode = "HP";
									
					this.function.setHpf( this.hpf.function );
					this.function.setHpf2( this.hpf2 );
					this.function.setHpf3( this.hpf3.function );
					this.function.setHpf24( this.hpf24 )
					
					this.bpf = Gibberish.SVF();
					this.function.setBpf(this.bpf.function);
					
					this.bpf2 = Gibberish.SVF();
					this.function.setBpf2(this.bpf2.function);
					
					this.eg = Gibberish.EG( .0025, 10500 );
					this.eg.function.setPhase(1);
					this.function.setEg(this.eg.function);
					
					this.eg2 = Gibberish.EG( .1, 7500 );
					this.eg2.function.setPhase(1);
					this.function.setEg2(this.eg2.function);
					
					
				},
				
				callback : function(amp, pitch, bpfFreq, bpfRez, hpfFreq, hpfRez, decay, decay2) {
					var val, low, high;
					val = s1( pitch, 2, 1, 0 );
					val[0] += s2( pitch * 1.4471, 2, 1, 0 )[0];
					val[0] += s3( pitch * 1.6170, 1.5, 1, 0 )[0];
					val[0] += s4( pitch * 1.9265, 1.25, 1, 0 )[0];
					val[0] += s5( pitch * 2.5028, 1, 1, 0 )[0];
					val[0] += s6( pitch * 2.6637, .75, 1, 0 )[0];
					
					low  = bpf(  val, bpfFreq, bpfRez, 2, 1 );
					high = bpf(  val, 1550, .5, 2, 1 );
					//high = [ low[0] ];
					
					low[0]  *= eg(.001, decay);
					high[0] *= eg2( .001, decay2);
					//sample, cutoff, resonance, isLowPass, channels
					low 	= hpf(high, hpfFreq, hpfRez, 0, 1 );
					//sample, cutoff, resonance, isLowPass, channels
					//high	= hpf24.call( high ); //, .8, 1, 0, 1 );
					//if(val[0] > .985) val[0] = .985;
					//if(val[0] < -.985) val[0] = -.985;
					val[0] 	= low[0] + high[0];					
					val[0] *= amp;
					
					return val;
				},
				
				note : function(_decay, _decay2) {
					this.eg.function.setPhase(0);
					this.eg2.function.setPhase(0);					
					if(_decay)
						this.decay = _decay;
					if(_decay2)
						this.decay2 = _decay2;
					
				}
				
			});
		},
	}
});