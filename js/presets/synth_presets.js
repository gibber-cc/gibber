module.exports = {

  acidBass: {
    Q:.925,
    filterType:2,
    filterMult:5.5,
    cutoff:1.25,
    saturation:3.5,
    attack:1/8192,
    decay:1/10,
    octave:-3,
    glide:2000
  },

  acidBass2: {
    Q:.78625,
    filterType:2,
    filterMult:5.5,
    cutoff:1.25,
    saturation:10,
    attack:1/8192,
    decay:1/10,
    octave:-2,
    glide:100
  },

  'bleep.dry': { 
    attack:1/256, decay:1/32, 
    waveform:'sine' 
  },

  'bleep.echo': { 
    waveform:'sine', 
    attack:1/256, decay:1/32, 
    gain:.25,
    presetInit: function( audio ) {
      this.fx.push( audio.effects.Delay({ feedback:.5, time:1/12 }) )
    }
  },

  shimmer: {
    attack:1/128, decay:2,
    waveform:'square', 
    filterType:1,
    cutoff:10,
    filterMult:1,
    Q:.6,
    maxVoices:3,
    gain:.1,
    presetInit: function( audio ) {
      this.fx.add( audio.effects.Chorus() )
      //this.fx.add( audio.effects.Delay({ time:1/12, feedback:.65 }) )
    }
  },

  stringPad: {
    attack:1/2, decay:1.5, gain:.015,
    presetInit: function( audio ) {
      this.fx.chorus = audio.effects.Chorus('lush')
      this.fx.add( this.fx.chorus  )
    }
  },
  brass: {
    attack:1/6, decay:1.5, gain:.05,
    filterType:1, Q:.5575, cutoff:2,
    presetInit: function( audio ) {
      this.fx.add( audio.effects.Chorus('lush') )
      this.chorus = this.fx[0]
    }
  },

  chirp: { maxVoices:1, filterType:2, cutoff:.325, decay:1/16 } 

}
