module.exports = {

  bleep: { 
    attack:1/256, decay:1/32, 
    waveform:'sine' 
  },

  bleepEcho: { 
    waveform:'sine', 
    attack:1/256, decay:1/64, 
    gain:.25,
    presetInit: function( audio ) {
      this.fx.push( audio.effects.Delay({ feedback:.75, time: audio.Clock.time(1/16) }) )
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
      this.fx.add( audio.effects.Chorus({ slowGain:3, fastGain:.5 }) )
      this.fx.add( audio.effects.Delay({ time: audio.Clock.time(1/12), feedback:.65 }) )
    }
  },

  chirp: { maxVoices:1, filterType:2, cutoff:.325, decay:1/16 } 

}
