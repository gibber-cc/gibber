const Gibberish   = require( 'gibberish-dsp' )
const Ugen        = require( './ugen.js' )
const Instruments = require( './instruments.js' )
const Oscillators = require( './oscillators.js' )
const Effects     = require( './effects.js' )
const Envelopes   = require( './envelopes.js' )
const Busses      = require( './busses.js' )
const Ensemble    = require( './ensemble.js' )
const Utility     = require( './utility.js' )
const Euclid      = require( './euclid.js' )
const Hex         = require( './hex.js' )
const Freesound   = require( './freesound.js' )
const Gen         = require( './gen.js' )

const Audio = {
  Clock: require( './clock.js' ),
  Theory: require( './theory.js' ),

  initialized:false,
  autoConnect:true,
  shouldDelay:false,
  instruments:{},
  oscillators:{},
  effects:{},
  exportTarget:null,

  export( obj ) {
    if( Audio.initialized ){ 
      Object.assign( obj, this.instruments, this.oscillators, this.effects, this.busses, this.envelopes )
      
      Utility.export( obj )
      this.Gen.export( obj )

      obj.gen = this.Gen.make
      obj.Ensemble = this.Ensemble
      obj.Drums = this.Drums
      obj.EDrums = this.EDrums
      obj.Theory = this.Theory
      obj.Euclid = Euclid( this )
      obj.Hex = Hex( this )
      obj.Freesound = this.Freesound
      obj.Clock = this.Clock
      Master = this.Master
    }else{
      Audio.exportTarget = obj
    } 
  },

  init( workletPath = '../dist/gibberish_worklet.js' ) {
    this.Gibberish = Gibberish

    Gibberish.workletPath = workletPath 

    this.createPubSub()

    const p = new Promise( (resolve, reject) => {
      Gibberish.init().then( processorNode => {
        Audio.initialized = true
        Audio.node = processorNode
        Audio.Clock.init()
        Audio.Theory.init( Gibber )
        Audio.Master = Gibberish.out
        Audio.Ugen = Ugen
        Audio.Gen = Gen( Gibber )

        Audio.createUgens()
        
        if( Audio.exportTarget !== null ) Audio.export( Audio.exportTarget )

        Gibberish.worklet.port.__postMessage = Gibberish.worklet.port.postMessage

        Gibberish.worklet.port.postMessage = function( dict ) {
          if( Audio.shouldDelay === true ) dict.delay = true

          Gibberish.worklet.port.__postMessage( dict )
        }

        Audio.export( window )

        let drums = Audio.Drums('x*o-')
        drums.disconnect()

        // store last location in memory... we can clear everything else in Gibber.clear9)
        const memIdx = Object.keys( Gibberish.memory.list ).reverse()[0]
        this.__memoryEnd = parseInt( memIdx ) + Gibberish.memory.list[ memIdx ]

        // XXX this forces the gibberish scheduler to start
        // running, but it's about as hacky as it can get...
        let __start = Gibber.instruments.Synth().connect()
        __start.disconnect()

        //Gibberish.worklet.port.postMessage({ address:'initialize' })

        resolve()
      })
    })
    
    return p
  },

  // XXX stop clock from being cleared.
  clear() { 
    Gibberish.clear() 
    Audio.Clock.init() //createClock()
    Audio.Seq.clear()

    // the idea is that we only clear memory that was filled after
    // the initial Gibber initialization... this stops objects
    // like Clock and Theory from having their memory cleared and
    // from having to re-initialize them.

    // fill memoy with zeros from the end initialization block onwards
    Gibberish.memory.heap.fill( 0, this.__memoryEnd )

    // get locations of all memory blocks
    const memKeys = Object.keys( Gibberish.memory.list )

    // get idx of final initialization block
    const endIdx =  memKeys.indexOf( ''+this.__memoryEnd )

    // loop through all blocks after final initialzation block
    // and delete them in the memory list... they've already
    // been zeroed out.
    for( let i = endIdx; i < memKeys.length; i++ ) {
      delete Gibberish.memory.list[ memKeys[ i ] ]
    }
    
    this.publish('clear')
  },

  onload() {},

  createUgens() {
    this.Freesound = Freesound( this )
    this.oscillators = Oscillators.create( this )
    this.instruments = Instruments.create( this ) 
    this.envelopes   = Envelopes.create( this )
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

  addSequencing( obj, methodName, priority ) {

    if( Gibberish.mode === 'worklet' ) {
      obj[ methodName ].sequencers = []

      obj[ methodName ].seq = function( values, timings, number=0, delay=0 ) {
        let prevSeq = obj[ methodName ].sequencers[ number ] 
        if( prevSeq !== undefined ) prevSeq.stop()

        let s = Audio.Seq({ values, timings, target:obj, key:methodName, priority })

        s.start() // Audio.Clock.time( delay ) )
        obj[ methodName ].sequencers[ number ] = obj[ methodName ][ number ] = s 

        // return object for method chaining
        return obj
      }
    }
  },

  printcb() { 
    Gibber.Gibberish.worklet.port.postMessage({ address:'callback' }) 
  },
  printobj( obj ) {
    Gibber.Gibberish.worklet.port.postMessage({ address:'print', object:obj.id }) 
  },
  send( msg ){
    Gibber.Gibberish.worklet.port.postMessage( msg )
  },

  createPubSub() {
    const events = {}
    this.subscribe = function( key, fcn ) {
      if( typeof events[ key ] === 'undefined' ) {
        events[ key ] = []
      }
      events[ key ].push( fcn )
    }

    this.unsubscribe = function( key, fcn ) {
      if( typeof events[ key ] !== 'undefined' ) {
        const arr = events[ key ]

        arr.splice( arr.indexOf( fcn ), 1 )
      }
    }

    this.publish = function( key, data ) {
      if( typeof events[ key ] !== 'undefined' ) {
        const arr = events[ key ]

        arr.forEach( v => v( data ) )
      }
    }
  },
  // When a property is created, a proxy-ish object is made that is
  // prefaced by a double underscore. This object holds the value of the 
  // property, sequencers for the properyt, and modulations for the property.
  // Alternative getter/setter methods can be passed as arguments.
  createProperty( obj, name, value, post=null, priority=0 ) {
    obj['__'+name] = { 
      value,
      isProperty:true,
      sequencers:[],
      mods:[],
      name,

      seq( values, timings, number = 0, delay = 0 ) {
        let prevSeq = obj['__'+name].sequencers[ number ] 
        if( prevSeq !== undefined ) { prevSeq.stop(); prevSeq.clear(); }

        // XXX you have to add a method that does all this shit on the worklet. crap.
        obj['__'+name].sequencers[ number ] = obj[ '__'+name ][ number ] = Audio.Seq({ 
          values, 
          timings, 
          target:obj,
          key:name,
          priority
        })
        .start( Audio.Clock.time( delay ) )

        // return object for method chaining
        return obj
      },
    }

    const getter = () => obj['__'+name]

    const setter = v => {
      obj['__'+name].value = v
      if( Gibberish.mode === 'worklet' ) {
        Gibberish.worklet.port.postMessage({
          address:'property',
          object:obj.id,
          name,
          value:obj['__'+name].value
        }) 
      }
      if( post !== null ) {
        post.call( obj )
      }
    }

    Object.defineProperty( obj, name, {
      configurable:true,
      get: getter,
      set: setter
    })
  }
  
}

module.exports = Audio
