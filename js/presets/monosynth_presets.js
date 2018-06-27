module.exports = {

  short : { 
    attack: audio => audio.Clock.ms(1), 
    decay: 1/16 
  },
  
  lead : {
    presetInit : function( audio ) { this.fx.push( audio.effects.Delay({ time:audio.Clock.time( 1/16 ), feedback:.65 }) ); this.fx.push( audio.effects.Freeverb() ) },
    attack: audio => audio.Clock.ms(.5),
    decay: audio => 1/2,
    octave3:0,
    cutoff:.5,
    filterMult:1,
    Q:.5,
    filterType:2,
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
    cutoff: .5,
    filterMult:.2,
    resonance:1,
  },
  bass2 : {
    attack: audio => audio.Clock.ms(1), 
    decay:	1/6,
    octave: -2,
    octave2 : 0,
    octave3 : 0,      
    cutoff: .5,
    filterMult:.2,
    resonance:1,
    amp:.65
  },
  
  edgy: {
    presetInit: function() {
      this.decay = 1/8
      this.attack = ms(1)
    },
    octave: -2,
    octave2 : -1,
    cutoff: .5,
    filterMult:.2,
    resonance:1, 
    waveform:'PWM', 
    pulsewidth:.2,
    detune2:0,
    amp:.2,
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

  dark : {
    resonance:0,
    attack:44,
    cutoff:.075,
    amp:.35,
    filterMult:0
  },

  dark2 : {
    filterMult:.1,
    attack: audio=> audio.Clock.ms(1),
    octave2:0,
    octave3:0,
    decay:1/4,
    amp:.45,
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
