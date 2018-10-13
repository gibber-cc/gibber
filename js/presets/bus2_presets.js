module.exports = {

  'spaceverb': {
    presetInit: function( audio ) {
      this.fx.verb = audio.effects.Freeverb({ roomSize:.985, dry:1 })
      this.fx.add( this.fx.verb )
    }
  },
  'delay.1/6': {
    presetInit: function( audio ) {
      this.fx.delay = audio.effects.Delay({ time:1/6, feedback:.35, wetdry:1 })
      this.fx.add( this.fx.delay )
      this.feedback = this.fx.delay.feedback
      this.time = this.fx.delay.time
    }
  },
  'delay.1/5': {
    presetInit: function( audio ) {
      this.fx.delay = audio.effects.Delay({ time:1/5, feedback:.35, wetdry:1 })
      this.fx.add( this.fx.delay )
      this.feedback = this.fx.delay.feedback
      this.time = this.fx.delay.time
    }
  },
  'delay.1/8': {
    presetInit: function( audio ) {
      this.fx.delay = audio.effects.Delay({ time:1/8, feedback:.35, wetdry:1 })
      this.fx.add( this.fx.delay )
      this.feedback = this.fx.delay.feedback
      this.time = this.fx.delay.time
    }
  },
  'delay.1/9': {
    presetInit: function( audio ) {
      this.fx.delay = audio.effects.Delay({ time:1/9, feedback:.35, wetdry:1 })
      this.fx.add( this.fx.delay )
    }
  },
}
