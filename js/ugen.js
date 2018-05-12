const __Seq = require( './seq' )
const Presets = require( './presets.js' )

const timeProps = [ 'attack', 'decay', 'sustain', 'release', 'time' ]

const Ugen = function( gibberishConstructor, description, Audio ) {

  const Seq = __Seq( Audio )
  const constructor = function( ...args ) {
    const properties = Presets.process( description, args, Audio ) 

    const __wrappedObject = gibberishConstructor( properties )
    const obj = { __wrapped__:__wrappedObject }

    // wrap properties and add sequencing to them
    for( let propertyName in description.properties ) {
      // turn properties into functions. if function is called
      // with no arguments, it acts as a getter. if called with
      // an argument, it acts as a setter.
      obj[ propertyName ] = value => {
        if( value !== undefined ) {

          __wrappedObject[ propertyName ] = timeProps.indexOf( propertyName ) > -1 ? Audio.Clock.time( value ) : value

          // return object for method chaining
          return obj
        }else{
          return __wrappedObject[ propertyName ]
        }
      }

      obj[ propertyName ].sequencers = []
      obj[ propertyName ].seq = function( values, __timings, number=0, delay=0 ) {
        let prevSeq = obj[ propertyName ].sequencers[ number ] 
        if( prevSeq !== undefined ) prevSeq.stop()

        obj[ propertyName ].sequencers[ number ] = Seq({ values, timings, target:__wrappedObject, key:propertyName })
          .start( Audio.Clock.time( delay ) )
        // return object for method chaining
        return obj
      }
    }

    // wrap methods and add sequencing to them
    if( description.methods !== null ) {
      for( let methodName of description.methods ) {
        obj[ methodName ] = __wrappedObject[ methodName ].bind( __wrappedObject )
        obj[ methodName ].sequencers = []

        obj[ methodName ].seq = function( values, timings, number=0, delay=0 ) {
          let prevSeq = obj[ methodName ].sequencers[ number ] 
          if( prevSeq !== undefined ) prevSeq.stop()

          let s = Seq({ values, timings, target:__wrappedObject, key:methodName })
          
          s.start( Audio.Clock.time( delay ) )
          obj[ methodName ].sequencers[ number ] = s 

          // return object for method chaining
          return obj
        }
      }
    }

    obj.id = __wrappedObject.id

    obj.connect = (dest,level=1) => { __wrappedObject.connect( dest,level ); return obj } 
    obj.disconnect = dest => { __wrappedObject.disconnect( dest ); return obj } 

    if( properties !== undefined && properties.__presetInit__ !== undefined ) {
      properties.__presetInit__.call( obj, Audio )
    }

    return obj
  }
  
  return constructor
}

module.exports = Ugen
