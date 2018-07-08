module.exports = {

  short : { 
    attack: audio => audio.Clock.ms(1), 
    decay: 1/16 
  },
  
  lead : {
    presetInit : function( audio ) { this.fx.push( audio.effects.Delay({ time:1/6, feedback:.65 }) )  },
    attack: audio => audio.Clock.ms(.5),
    decay: 1/2, 
    octave3:0,
    cutoff:.5,
    filterMult:2.5,
    Q:.5,
    filterType:1,
    filterMode:1
  },

  winsome : {
    presetInit : function() { 
      this.lfo = Gibber.oscillators.Sine({ frequency:2, gain:.075 })
      this.lfo.connect( this.cutoff )
      this.lfo.connect( this.detune2 )
      this.lfo.connect( this.detune3 )
    },
    attack: audio => audio.Clock.ms(1), 
    decay:1,
    cutoff:.2,
  },
  bass : { 
    attack: audio => audio.Clock.ms(1),
    decay: 1/8,	
    octave: -2,
    octave2 : -1,
    cutoff: .8,
    filterMult:3,
    Q:.75,
    detune2:.0275,
    detune3:-.0275
  },
  dark: { 
    attack: audio => audio.Clock.ms(1),
    decay: 1,	
    octave: -3,
    octave2 : -1,
    cutoff: 1.5,
    filterMult:3,
    Q:.75,
    detune2:.0275,
    detune3:-.0275
  },
  bass2 : {
    attack: audio => audio.Clock.ms(1), 
    decay:	1/6,
    octave: -2,
    octave2 : 0,
    octave3 : 0,      
    cutoff: .5,
    filterMult:2,
    Q:.5,
    gain:.35
  },
  
  edgy: {
    decay:1/8,
    attack:1/1024,
    octave: -2,
    octave2: -1,
    cutoff: .5,
    filterMult:3,
    Q:.75, 
    waveform:'pwm', 
    pulsewidth:.2,
    detune2:0,
    gain:.2
  },

  easy : {
    attack: audio=> audio.Clock.ms(1),
    decay:2,
    octave2:0,
    octave3:0,
    cutoff:.3,
    glide:.9995,
  },
  
  easyfx : {
    attack: audio=> audio.Clock.ms(1),
    decay:2,
    presetInit: function() {
      this.fx.add( Gibber.Audio.FX.Delay( Clock.time(1/6), .3) )
    },
    amp:.3,
    octave2:0,
    octave3:0,
    cutoff:.3,
    glide:.9995,
  },

  noise: {
    resonance:20,
    decay:1/2,
    cutoff:.3,
    glide:.99995,
    detune3:0,
    detune2:0,
    filterMult:0,
    presetInit: function() { this.fx.add( Gibber.Audio.FX.Gain(.1), Gibber.Audio.FX.Delay(1/6,.35) ) }
  },

}
