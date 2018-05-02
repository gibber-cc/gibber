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

      obj[ propertyName ].seq = function( values, timings ) {
        obj[ propertyName ].sequencer = Gibberish.Sequencer({ values, timings, target:__wrappedObject, key:propertyName }).start()
      }
    }

    // wrap methods and add sequencing to them
    if( description.methods !== null ) {
      for( let methodName of description.methods ) {
        obj[ methodName ] = __wrappedObject[ methodName ].bind( __wrappedObject )

        obj[ methodName ].seq = function( values, timings, delay=0 ) {
          obj[ methodName ].sequencer = Gibberish.Sequencer({ values, timings, target:__wrappedObject, key:methodName }).start( delay )
        }
      }
    }
    
    //obj.id = 10000
    obj.connect = dest => { __wrappedObject.connect( dest ); return obj } 

    return obj
  }
  
  return constructor
}

module.exports = Ugen
