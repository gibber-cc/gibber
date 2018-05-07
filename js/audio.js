const Gibberish   = require( 'gibberish-dsp' )
const Ugen        = require( './ugen.js' )
const Instruments = require( './instruments.js' )
const Effects     = require( './effects.js' )

//module.exports = function( Gibber ){

  const Audio = {
    initialized:false,
    instruments:{},
    oscillators:{},
    effects:{},
    exportTarget:null,

    export( obj ) {
      if( Audio.initialized ) 
        Object.assign( obj, this.instruments, this.oscillators, this.effects )
      else
        Audio.exportTarget = obj
    },

    init() {
      window.Gibberish = Gibberish

      Gibberish.workletPath = './dist/gibberish_worklet.js'

      const p = new Promise( (resolve, reject) => {
        Gibberish.init().then( processorNode => {
          Audio.initialized = true
          Audio.node = processorNode
          Audio.createUgens()
          //Audio.createClock()

          if( Audio.exportTarget !== null ) Audio.export( Audio.exportTarget )

          Audio.export( window )

          resolve()
        })
      })
      
      return p
    },

    // XXX stop clock from being cleared.
    clear() { Gibberish.clear() },

    onload() {},

    createClock() {
      this.beat = 11025

      const clockFunc  = ()=> {
        Gibberish.processor.port.postMessage({
          address:'clock'
        })
      }

      this.clockSeq  = Gibberish.Sequencer.make( [clockFunc], [this.beat] ).start()

      this.beatCount = 0
      Gibberish.utilities.workletHandlers.clock = () => {
        this.beatCount += 1
        this.beatCount = this.beatCount % 4 

        Gibber.Scheduler.seq( this.beatCount + 1, 'internal' )
      }

      let syn = Gibberish.instruments.Synth().connect()
      syn.disconnect()
    },

    createUgens() {
      this.instruments = Instruments.create() 
      this.effects = Effects.create()
    }  
  }

  module.exports = Audio
