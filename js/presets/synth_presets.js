module.exports = {

  bleep: { 
    attack:44, decay: audio => audio.Gibberish.ctx.sampleRate / 8, 
    waveform:'sine' 
  },

  bleepEcho: { 
    waveform:'sine', 
    attack:44, decay:1024, 
    gain:1,
    presetInit: function( audio ) {
      this.fx.push( audio.effects.Delay({ feedback:.75, time: 11025/4 }) )
    }
  },

  shimmer: {
    attack:1/128, decay:1,
    waveform:'square', 
    filterType:1,
    maxVoices:3,
    gain:.025,
    presetInit: function( audio ) {
      this.fx.push( audio.effects.Chorus({ slowGain:3, fastGain:.5 }) )
    }
  },

  chirp: { maxVoices:1, filterType:2, cutoff:.325, decay:1/16 } 

}
