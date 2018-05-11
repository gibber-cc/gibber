const Gibberish = require( 'gibberish-dsp' )

module.exports = {
  beat:11025,
  bpm:120,
  beatCount:0,

  init() {
    const clockFunc = ()=> {
      Gibberish.processor.port.postMessage({
        address:'clock'
      })
    }

    this.seq = Gibberish.Sequencer.make( [ clockFunc ], [ this.beat ] ).start()

    Gibberish.utilities.workletHandlers.clock = () => {
      this.beatCount += 1
      this.beatCount = this.beatCount % 4 

      // XXX don't use global reference!!!
      if( Gibber.Scheduler !== undefined && Gibberish.mode !== 'processor' ) {
        Gibber.Scheduler.seq( this.beatCount + 1, 'internal' )
      }
    }
  },

  // time accepts an input value and converts it into samples. the input value
  // may be measured in milliseconds, beats or samples.
  time( inputTime ) {
    let outputTime = inputTime

    // if input is an annotated time value such as what is returned
    // by samples() or ms()...
    if( isNaN( inputTime ) ) {
      if( typeof inputTime === 'object' ) { 
        if( inputTime.type === 'samples' ) {
          outputTime = inputTime.value
        }else if( inputTime.type === 'ms' ) {
          const samplesPerMs = Gibberish.ctx.sampleRate / 1000
          outputTime = inputTime.value * samplesPerMs
        }
      } 
    }else{
      // convert beats into samples
      const samplesPerBeat = Gibberish.ctx.sampleRate / (this.bpm / 60 )
      outputTime = samplesPerBeat * inputTime
    }
    
    return outputTime
  },

  btos( beats ) {
    const samplesPerBeat = Gibberish.ctx.sampleRate / (this.bpm / 60 )
    return samplesPerBeat * beats 
  },

  btoms( beats ) {
    const samplesPerMs = Gibberish.ctx.sampleRate / 1000
    return beats * samplesPerMs
  }
}
