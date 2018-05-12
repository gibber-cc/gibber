const Gibberish = require( 'gibberish-dsp' )

const Clock = {
  bpm:120,
  __beatCount:0,

  init() {
    const clockFunc = ()=> {
      Gibberish.processor.port.postMessage({
        address:'clock'
      })
    }

    this.seq = Gibberish.Sequencer.make( [ clockFunc ], [ Clock.time( 1/4 ) ] ).start()

    Gibberish.utilities.workletHandlers.clock = () => {
      this.__beatCount += 1
      this.__beatCount = this.__beatCount % 4 

      // XXX don't use global reference!!!
      if( Gibber.Scheduler !== undefined && Gibberish.mode !== 'processor' ) {
        Gibber.Scheduler.seq( this.__beatCount + 1, 'internal' )
      }
    }
  },

  // time accepts an input value and converts it into samples. the input value
  // may be measured in milliseconds, beats or samples.
  time( inputTime=0 ) {
    let outputTime = inputTime

    // if input is an annotated time value such as what is returned
    // by samples() or ms()...
    if( isNaN( inputTime ) ) {
      if( typeof inputTime === 'object' ) { 
        if( inputTime.type === 'samples' ) {
          outputTime = inputTime.value
        }else if( inputTime.type === 'ms' ) {
          outputTime = Clock.mstos( inputTime.value ) 
        }
      } 
    }else{
      outputTime = Clock.btos( inputTime * 4 )
    }
    
    return outputTime
  },

  mstos( ms ) {
    return ( ms / 1000 ) * Gibberish.ctx.sampleRate
  },

  // convert beats to samples
  btos( beats ) {
    const samplesPerBeat = Gibberish.ctx.sampleRate / (this.bpm / 60 )
    return samplesPerBeat * beats 
  },

  // convert beats to milliseconds
  btoms( beats ) {
    const samplesPerMs = Gibberish.ctx.sampleRate / 1000
    return beats * samplesPerMs
  },

  ms( value ) {
    return { type:'ms', value }
  },

  samples( value ) {
    return { type:'samples', value }
  }
}

module.exports = Clock
