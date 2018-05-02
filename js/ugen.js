const Seq = require( './seq' )

const Ugen = function( gibberishConstructor, description ) {

  const constructor = function( ...args ) {
    const __wrappedObject = gibberishConstructor( ...args )
    const obj = { __wrapped__:__wrappedObject }

    // wrap properties and add sequencing to them
    for( let propertyName in description.properties ) {
      obj[ propertyName ] = value => {
        if( value !== undefined ) {
          __wrappedObject[ propertyName ] = value
        }else{
          return __wrappedObject[ propertyName ]
        }
      }

      obj[ propertyName ].seq = function( values, timings, delay=0 ) {
        obj[ propertyName ].sequencer = Seq({ values, timings, target:__wrappedObject, key:propertyName }).start( delay )
      }
    }

    // wrap methods and add sequencing to them
    if( description.methods !== null ) {
      for( let methodName of description.methods ) {
        obj[ methodName ] = __wrappedObject[ methodName ].bind( __wrappedObject )

        obj[ methodName ].seq = function( values, timings, delay=0 ) {
          obj[ methodName ].sequencer = Seq({ values, timings, target:__wrappedObject, key:methodName }).start( delay )
        }
      }
    }
    
    obj.connect = dest => { __wrappedObject.connect( dest ); return obj } 
    obj.disconnect = dest => { __wrappedObject.disconnect( dest ); return obj } 

    return obj
  }
  
  return constructor
}

module.exports = Ugen
