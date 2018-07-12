module.exports = {

  earshred: {
    presetInit() {
      this.fx.add( Distortion() )
      this.fx[0].pregain = 500
      this.fx[0].postgain = .06

      //this.fx[0].connect( bus, .25 )

      this.kick.frequency = 55
      this.kick.decay = .975

      this.snare.tune = .25
      this.snare.snappy = 1.5

      this.fx[0].shape1.value = .001
      this.fx[0].shape2.value = -3
    }
  }

}
