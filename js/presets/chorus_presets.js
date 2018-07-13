module.exports = {

  lush: {
    fastFrequency:4,
    fastGain:.425,
    slowGain:3,
    slowFrequency:.18,
    presetInit: function( audio ) {
      this.mod1 = audio.Gen.make( cycle(.1) ).connect( this.fastFrequency )
      this.mod2 = audio.Gen.make( cycle(.05) ).connect( this.slowGain )
    }
  }
}
