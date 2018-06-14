const Gibberish   = require( 'gibberish-dsp' )
const Ugen        = require( './ugen.js' )
const Instruments = require( './instruments.js' )
const Effects     = require( './effects.js' )
const Busses      = require( './busses.js' )
const Ensemble    = require( './ensemble.js' )

const Audio = {
  Clock: require( './clock.js' ),
  Theory: require( './theory.js' ),

  initialized:false,
  instruments:{},
  oscillators:{},
  effects:{},
  exportTarget:null,

  export( obj ) {
    if( Audio.initialized ){ 
      Object.assign( obj, this.instruments, this.oscillators, this.effects, this.busses )
      obj.Ensemble = this.Ensemble
      obj.Drums = this.Drums
      obj.EDrums = this.EDrums
      obj.Theory = this.Theory
    }else{
      Audio.exportTarget = obj
    } 
  },

  init() {
    this.Gibberish = Gibberish

    Gibberish.workletPath = './dist/gibberish_worklet.js'

    const p = new Promise( (resolve, reject) => {
      Gibberish.init().then( processorNode => {
        Audio.initialized = true
        Audio.node = processorNode
        Audio.createUgens()
        Audio.Clock.init()
        Audio.Theory.init( Gibber )
        Audio.Master = Gibberish.out

        if( Audio.exportTarget !== null ) Audio.export( Audio.exportTarget )

        Audio.export( window )

        resolve()
      })
    })
    
    return p
  },

  // XXX stop clock from being cleared.
  clear() { 
    Gibberish.clear() 
    Audio.createClock()
  },

  onload() {},

  createUgens() {
    this.instruments = Instruments.create( this ) 
    this.effects = Effects.create( this )
    this.busses = Busses.create( this )
    this.Ensemble = Ensemble( this )
    this.Seq = require( './seq.js' )( this )
    const Pattern = require( './pattern.js' )
    Pattern.transfer( this, Pattern.toString() )
    this.Pattern = Pattern( this )
    
    //console.log( 'pattern string:', Pattern.toString() )

    const drums = require( './drums.js' )( this )
    Object.assign( this, drums )
  },

  addSequencing( obj, methodName ) {
    obj[ methodName ].sequencers = []

    obj[ methodName ].seq = function( values, timings, number=0, delay=0 ) {
      let prevSeq = obj[ methodName ].sequencers[ number ] 
      if( prevSeq !== undefined ) prevSeq.stop()

      let s = Audio.Seq({ values, timings, target:obj, key:methodName })

      s.start() // Audio.Clock.time( delay ) )
      obj[ methodName ].sequencers[ number ] = s 

      // return object for method chaining
      return obj
    }
  }
  
}

module.exports = Audio
