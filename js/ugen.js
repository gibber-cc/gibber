const Presets = require( './presets.js' )
const Theory  = require( './theory.js' )
const Gibberish = require( 'gibberish-dsp' )

// what properties should be automatically (automagickally?)
// filtered through Audio.Clock.time()?
const __timeProps = {
  Synth:[ 'attack', 'decay', 'sustain', 'release' ],
  PolySynth:[ 'attack', 'decay', 'sustain', 'release' ],
  FM:[ 'attack', 'decay', 'sustain', 'release' ],
  PolyFM:[ 'attack', 'decay', 'sustain', 'release' ],
  Monosynth:[ 'attack', 'decay', 'sustain', 'release' ],
  PolyMono:[ 'attack', 'decay', 'sustain', 'release' ],
  Delay:[ 'time' ], 
}

// Gibber ugens are essentially wrappers around underlying gibberish 
// ugens, providing convenience methods for rapidly sequencing
// and modulating them.

const poolSize = 12

// DRY method for removing a sequence and its associated annotations.
const removeSeq = function( obj, seq ) {
  const idx = obj.__sequencers.indexOf( seq )
  obj.__sequencers.splice( idx, 1 )
  seq.stop()
  seq.clear()
}

const createProperty = function( obj, propertyName, __wrappedObject, timeProps, Audio ) {
  obj[ '__' + propertyName ] = {
    isProperty:true,
    sequencers:[],
    mods:[],
    name:propertyName,

    get value() {
      return __wrappedObject[ propertyName ]
    },
    set value(v) {
      if( v !== undefined ) {
        __wrappedObject[ propertyName ] = timeProps.indexOf( propertyName ) > -1 ? Audio.Clock.time( v ) : v
      }
    },

    seq( values, timings, number = 0, delay = 0 ) {
      let prevSeq = obj[ propertyName ].sequencers[ number ] 
      if( prevSeq !== undefined ) removeSeq( obj, prevSeq )

      const s = Audio.Seq({ 
        values, 
        timings, 
        target:__wrappedObject, 
        key:propertyName 
      })
      .start( Audio.Clock.time( delay ) )

      obj[ propertyName ].sequencers[ number ] = obj[ propertyName ][ number ] = s
      obj.__sequencers.push( s )

      // return object for method chaining
      return obj
    },

    ugen:obj
  }

  Object.defineProperty( obj, propertyName, {
    get() { return obj[ '__' + propertyName ] },
    set(v){
      // XXX need to accomodate non-scalar values
      // i.e. mappings

      if( isNaN( v ) || v === undefined ) return

      if( v !== null && typeof v !== 'object' ) 
        obj[ '__' + propertyName ].value = v
      else
        obj[ '__' + propertyName ] = v
    }
  })

}

const Ugen = function( gibberishConstructor, description, Audio, shouldUsePool = false ) {

  let   poolCount = poolSize
  const pool = []

  const constructor = function( ...args ) {
    const properties = Presets.process( description, args, Audio ) 
    const timeProps = __timeProps[ description.name ] === undefined ? [] : __timeProps[ description.name ]

    if( timeProps.length > 0 ) {
      for( let key in properties ) {
        if( timeProps.indexOf( key ) > -1 ) {
          properties[ key ] = Audio.Clock.time( properties[ key ] )
        }
      }
    }

    // XXX if you want to use pooling you must also uncomment near the bottom of this file...
    // Pooling could work for reverbs IF:
    // 1. There would have to be separate mono and stereo pools.2
    // 2. Reverbs would need to run with 0 input for a while so that the functions are JIT'd

    //if( shouldUsePool && poolCount < pool.length ) {
    //  pool[ poolCount ].inUse = true
    //  const poolUgen = pool[ poolCount ].ugen
    //  poolCount++
    //  Object.assign( poolUgen, properties, args )
    //  console.log( 'pool ugen:', poolUgen )
    //  return poolUgen
    //}

    const __wrappedObject = gibberishConstructor( properties )
    const obj = { 
      __wrapped__:__wrappedObject,
      __sequencers: [], 

      stop() {
        for( let seq of this.__sequencers ) seq.stop()
      },
      start() {
        for( let seq of this.__sequencers ) seq.start()
      },
      clear() {
        for( let seq of this.__sequencers ) {
          seq.stop()
          seq.clear()
          for( let connection of __wrappedObject.connected ) {
            this.disconnect( connection[ 0 ] )
          }
        }
      }
    }

    // wrap properties and add sequencing to them
    for( let propertyName in description.properties ) {
      createProperty( obj, propertyName, __wrappedObject, timeProps, Audio )
    }

    // wrap methods and add sequencing to them
    if( description.methods !== null ) {
      for( let methodName of description.methods ) {
        if( methodName !== 'note' ) {
          obj[ methodName ] = __wrappedObject[ methodName ].bind( __wrappedObject )
        }else{
          // in this block we are monkey patching the note method of Gibberish synths so that
          // they use Gibber's harmonic system inside the AudioWorkletProcessor.

          obj[ methodName ] = function( ...args ) {
            // this should only be for direct calls from the IDE
            if( Gibberish.mode === 'worklet' ) {
              Gibberish.worklet.port.postMessage({
                address:'method',
                object:__wrappedObject.id,
                name:methodName,
                args
              })
            }
          }

          // when a message is received at the address 'monkeyPatch',
          // Gibberish will create a copy of the method identified by
          // the 'key' field, and then assign it back to the object prefaced
          // with double underscores (e.g. __note). The function that is being
          // patched in can then call the original function using the prefaced 
          // name, as is done in the last line of the argument function below.
          Gibberish.worklet.port.postMessage({
            address:'monkeyPatch',
            id:__wrappedObject.id,
            key:'note',
            function:`function( note ){ 
              const octave = this.octave || 0
              let notesInOctave = 7
              const mode = Gibberish.Theory.mode
              if( mode !== null ) {
                notesInOctave = Gibberish.Theory.modes[ mode ].length
              }else{
                const tuning = Gibberish.Theory.tuning
                notesInOctave = Gibberish.Theory.__tunings[ tuning ].frequencies.length
              }
              const offset = octave * notesInOctave
              const __note = Gibberish.Theory.note( note + offset );
              this.___note( __note ) 
            }`
          })
          
        }

        obj[ methodName ].sequencers = []

        obj[ methodName ].seq = function( values, timings, number=0, delay=0 ) {
          let prevSeq = obj[ methodName ].sequencers[ number ] 
          if( prevSeq !== undefined ) { 
                        removeSeq( obj, prevSeq )
          }

          let s = Audio.Seq({ values, timings, target:__wrappedObject, key:methodName })
          
          s.start( Audio.Clock.time( delay ) )
          obj[ methodName ].sequencers[ number ] = obj[ methodName ][ number ] = s 
          obj.__sequencers.push( s )

          // return object for method chaining
          return obj
        }
      }
    }

    obj.id = __wrappedObject.id

    // XXX where does shouldAddToUgen come from? Not from presets.js...
    if( properties !== undefined && properties.shouldAddToUgen ) Object.assign( obj, properties )

    // create fx chaining api. e.g. synth.fx.add( Chorus(), Freeverb() )
    // we use the 'add' method to enable method chaining alongside instrument calls to
    // .connect() and .seq()

    const __fx = []
    __fx.__push = __fx.push.bind( __fx )
    __fx.add = function( ...args ) {
      obj.fx.push( ...args )
      return obj
    }
    obj.fx = new Proxy( __fx, {
      set( target, property, value, receiver ) {

        const lengthCheck = target.length
        target[ property ] = value
        
        if( property === 'length' ) { 
          if( target.length > 1 ) {
            // XXX need to store and reassign to end connection
            target[ target.length - 2 ].disconnect()
            target[ target.length - 2 ].connect( target[ target.length - 1 ] )
            target[ target.length - 1 ].connect()
          }else if( target.length === 1 ) {
            // XXX need to store and reassign
            __wrappedObject.disconnect()
            __wrappedObject.connect( target[ 0 ] )
            target[0].connect( Audio.Master )
          }
        }

        return true
      }
    })

    obj.connect = (dest,level=1) => {
      if( dest !== undefined && dest.isProperty === true ) {
        dest.mods.push( obj )
        if( dest.mods.length !== 0 ) { // if first modulation
          //console.log( 'mod:', dest.name )
          dest.ugen[ dest.name ].value = Gibberish.binops.Add( dest.value, obj ) 
        }
      }else{
        // if no fx chain, connect directly to output
        if( obj.fx.length === 0 ) {
          __wrappedObject.connect( dest,level ); 
        }else{
          // otherwise, connect last effect in chain to output
          obj.fx[ obj.fx.length - 1 ].__wrapped__.connect( dest, level )
        }
      }

      return obj 
    } 

    obj.disconnect = dest => { __wrappedObject.disconnect( dest ); return obj } 

    // presetInit is a function in presets that triggers actions after the ugen
    // has been instantiated... it is primarily used to add effects and modulations
    // to a preset.
    if( properties !== undefined && properties.__presetInit__ !== undefined ) {
      properties.__presetInit__.call( obj, Audio )
    }

    // only connect if shouldNotConneect does not equal true (for LFOs and other modulation sources)
    if( obj.__wrapped__.type === 'instrument' || obj.__wrapped__.type === 'oscillator' ) {
      if( typeof properties !== 'object' || properties.shouldNotConnect !== true ) {
        
        if( Audio.autoConnect === true ) {
          // ensure that the ugen hasn't already been connected through the fx chain,
          // possibly through initialization of a preset
          if( obj.fx.length === 0 ) obj.connect( Audio.Master )
        }
      }
    }

    return obj
  }

  //if( shouldUsePool ) {
  //  for( let i=0; i < poolSize; i++ ) {
  //    pool[ i ] = {
  //      inUse:false,
  //      ugen: constructor()
  //    }
  //  } 

  //  poolCount = 0
  //}
  
  Ugen.createProperty = createProperty

  return constructor
}

module.exports = Ugen
