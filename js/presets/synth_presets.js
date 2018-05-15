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
    attack:10, decay:44100,
    waveform:'square', 
    gain:.025,
    presetInit: function( audio ) {
      this.fx.push( audio.effects.Chorus({ slowGain:8, fastGain:1 }) )
    }
  }

}
