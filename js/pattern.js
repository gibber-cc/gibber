const patternWrapper = function( Gibber ) {
  "use strict"

  // hack to pass Gibberish to pattern generator from within worklet processor
  const Gibberish = Gibber.Gibberish === undefined ? Gibber : Gibber.Gibberish

  let PatternProto = Object.create( function(){} )

  // this prototype is somewhat limited, as we want to be able to add
  // .seq() methods to everything. This means that every pattern needs its own
  // copy of each method. One alternative would be to use a more comprehensive
  // prototype and then place proxies on each method of each pattern that access
  // object-specific sequencers... but just making copies of all functions is certainly
  // simpler.
  Object.assign( PatternProto, {
    type:'pattern',
    DNR: -987654321,
    concat( _pattern ) { this.values = this.values.concat( _pattern.values ) },  
    //toString() { return this.values.toString() },
    //valueOf() { return this.values },

    getLength() {
      let l
      if( this.start <= this.end ) {
        l = this.end - this.start + 1
      }else{
        l = this.values.length + this.end - this.start + 1
      }
      return l
    },

    runFilters( val, idx ) {
      let args = [ val, 1, idx ] // 1 is phaseModifier

      for( let filter of this.filters ) {
        args = filter( args, this ) 
      }

      return args
    },

    checkForUpdateFunction( name, ...args ) {
      if( this.__delayAnnotations === true ) {
        setTimeout( ()=> {
          if( this.listeners[ name ] ) {
            this.listeners[ name ].apply( this, args )
          }else if( Pattern.listeners[ name ] ) {
            Pattern.listeners[ name ].apply( this, args )
          }
        }, 5 )
      }else{
        if( this.listeners[ name ] ) {
          this.listeners[ name ].apply( this, args )
        }else if( Pattern.listeners[ name ] ) {
          Pattern.listeners[ name ].apply( this, args )
        }
      }
    },

    // used when _onchange has not been assigned to individual patterns
    _onchange() {},

    addFilter( filter ) {
      this.filters.push( filter )
    }
  })

  let Pattern = function( ...args ) {
    /*
     *if( ! ( this instanceof Pattern ) ) {
     *  let args = Array.prototype.slice.call( arguments, 0 )
     *  return Gibber.construct( Pattern, args )
     *}
     */

    let isFunction = args.length === 1 && typeof args[0] === 'function'

    let fnc = function() {
      let len = fnc.getLength(),
          idx, val, args

      if( len === 1 ) { 
        idx = 0 
      }else{
        idx = fnc.phase > -1 ? Math.floor( fnc.start + (fnc.phase % len ) ) : Math.floor( fnc.end + (fnc.phase % len ) )
      }

      if( isFunction ) {
        val = fnc.values[ 0 ]()
        args = fnc.runFilters( val, idx )
        val = args[0]
      }else{
        val = fnc.values[ Math.floor( idx % fnc.values.length ) ]
        args = fnc.runFilters( val, idx )
      
        fnc.phase += fnc.stepSize * args[ 1 ]

        // XXX why is this one off from the worlet-side pattern id?
        if( Gibberish.mode === 'processor' ) Gibberish.processor.messages.push( fnc.id, 'update.currentIndex', idx )

        val = args[ 0 ]
      }
      // check to see if value is a function, and if so evaluate it
      //if( typeof val === 'function' ) {
        //val = val()
      //}
      /*else if ( Array.isArray( val ) ) {
        // if val is an Array, loop through array and evaluate any functions found there. TODO: IS THIS SMART?

        for( let i = 0; i < val.length; i++ ){
          if( typeof val[ i ] === 'function' ) {
            val[ i ] = val[ i ]()
          }
        }
      }
      */

      // if pattern has update function, add new value to array
      // values are popped when updated by animation scheduler
      //if( fnc.update ) { 
        // XXX why is this one off from the worklet-side pattern id?
        //if( Gibberish.mode === 'processor' ) Gibberish.processor.messages.push( fnc.id + 1, 'update.currentIndex', val )
        //fnc.update.value.unshift( val )
      //}
      
      if( val === fnc.DNR ) val = null

      return val
    }
     
    Object.assign( fnc, {
      start : 0,
      end   : 0,
      phase : 0,
      values : args, 
      isPattern: true,
      // wrap annotation update in setTimeout( func, 0 )
      __delayAnnotations:false,
      //values : typeof arguments[0] !== 'string' || arguments.length > 1 ? Array.prototype.slice.call( arguments, 0 ) : arguments[0].split(''),    
      original : null,
      storage : [],
      stepSize : 1,
      integersOnly : false,
      filters : [],
      __listeners: [],
      onchange : null,
      isop:true,

      range() {
        let start, end
        
        if( Array.isArray( arguments[0] ) ) {
          start = arguments[0][0]
          end   = arguments[0][1]
        }else{
          start = arguments[0]
          end   = arguments[1]
        }
        
        if( start < end ) {
          fnc.start = start
          fnc.end = end
        }else{
          fnc.start = end
          fnc.end = start
        }

        this.checkForUpdateFunction( 'range', fnc )

        return fnc
      },
      
      set() {
        let args = Array.isArray( arguments[ 0 ] ) ? arguments[ 0 ] : arguments
        
        fnc.values.length = 0
        
        for( let i = 0; i < args.length; i++ ) {
          fnc.values.push( args[ i ] )
        }
        
        fnc.end = fnc.values.length - 1
        
        // if( fnc.end > fnc.values.length - 1 ) {
        //   fnc.end = fnc.values.length - 1
        // }else if( fnc.end < )
        if( Gibberish.mode === 'processor' ) {
          Gibberish.processor.messages.push( fnc.id, 'values', fnc.values )
          Gibberish.processor.messages.push( fnc.id, '_onchange', true )
        }
        fnc._onchange()
        
        return fnc
      },
       
      reverse() {
        let array = fnc.values,
            left = null,
            right = null,
            length = array.length,
            temporary;
            
        for ( left = 0, right = length - 1; left < right; left += 1, right -= 1 ) {
          temporary = array[ left ]
          array[ left ] = array[ right ]
          array[ right ] = temporary;
        }
        
        if( Gibberish.mode === 'processor' ) {
          Gibberish.processor.messages.push( fnc.id, 'values', array )
          Gibberish.processor.messages.push( fnc.id, '_onchange', true )
        }

        fnc._onchange()
        
        return fnc
      },
      // humanize: function( randomMin, randomMax ) {
   //      let lastAmt = 0
   //
   //      for( let i = 0; i < this.filters.length; i++ ) {
   //        if( this.filters[ i ].humanize ) {
   //          lastAmt = this.filters[ i ].lastAmt
   //          this.filters.splice( i, 1 )
   //          break;
   //        }
   //      }
   //
   //      let filter = function( args ) {
   //        console.log( filter.lastAmt, args[0])
   //        args[ 0 ] -= filter.lastAmt
   //        filter.lastAmt = Gibber.Clock.time( Gibber.Utilities.rndi( randomMin, randomMax ) )
   //
   //        console.log( "LA", filter.lastAmt )
   //        args[0] += filter.lastAmt
   //
   //        return args
   //      }
   //      filter.lastAmt = lastAmt
   //      filter.humanize = true
   //
   //      this.filters.push( filter )
   //
   //      return this
   //    },
      repeat() {
        let counts = {}
      
        for( let i = 0; i < arguments.length; i +=2 ) {
          counts[ arguments[ i ] ] = {
            phase: 0,
            target: arguments[ i + 1 ]
          }
        }
        
        let repeating = false, repeatValue = null, repeatIndex = null
        let filter = function( args ) {
          let value = args[ 0 ], phaseModifier = args[ 1 ], output = args
          
          //console.log( args, counts )
          if( repeating === false && counts[ value ] ) {
            repeating = true
            repeatValue = value
            repeatIndex = args[2]
          }
          
          if( repeating === true ) {
            if( counts[ repeatValue ].phase !== counts[ repeatValue ].target ) {
              output[ 0 ] = repeatValue            
              output[ 1 ] = 0
              output[ 2 ] = repeatIndex
              //[ val, 1, idx ]
              counts[ repeatValue ].phase++
            }else{
              counts[ repeatValue ].phase = 0
              output[ 1 ] = 1
              if( value !== repeatValue ) { 
                repeating = false
              }else{
                counts[ repeatValue ].phase++
              }
            }
          }
        
          return output
        }
      
        fnc.filters.push( filter )
      
        return fnc
      },
    
      reset() { fnc.values = fnc.original.slice( 0 ); fnc._onchange(); return fnc; },
      store() { fnc.storage[ fnc.storage.length ] = fnc.values.slice( 0 ); return fnc; },

      transpose( amt ) { 
        for( let i = 0; i < fnc.values.length; i++ ) { 
          let val = fnc.values[ i ]
          
          if( Array.isArray( val ) ) {
            for( let j = 0; j < val.length; j++ ) {
              if( typeof val[ j ] === 'number' ) {
                val[ j ] = fnc.integersOnly ? Math.round( val[ j ] + amt ) : val[ j ] + amt
              }
            }
          }else{
            if( typeof val === 'number' ) {
              fnc.values[ i ] = fnc.integersOnly ? Math.round( fnc.values[ i ] + amt ) : fnc.values[ i ] + amt
            }
          }
        }
        if( Gibberish.mode === 'processor' ) {
          Gibberish.processor.messages.push( fnc.id, 'values', fnc.values )
          Gibberish.processor.messages.push( fnc.id, '_onchange', true )
        }      
        fnc._onchange()
        
        return fnc
      },

      shuffle() { 
        Gibber.Utility.shuffle( fnc.values )
        fnc._onchange()
        
        return fnc
      },

      scale( amt ) { 
        fnc.values.map( (val, idx, array) => {
          if( Array.isArray( val ) ) {
            array[ idx ] = val.map( inside  => {
              if( typeof inside === 'number' ) {
                return fnc.integersOnly ? Math.round( inside * amt ) : inside * amt
              } else {
                return inside
              }
            })
          }else{
            if( typeof val === 'number' ) {
              array[ idx ] = fnc.integersOnly ? Math.round( val * amt ) : val * amt
            }
          }
        })
        if( Gibberish.mode === 'processor' ) {
          Gibberish.processor.messages.push( fnc.id, 'values', fnc.values )
          Gibberish.processor.messages.push( fnc.id, '_onchange', true )
        }
        fnc._onchange()
        
        return fnc
      },

      flip() {
        let start = [],
            ordered = null
      
        ordered = fnc.values.filter( function(elem) {
          let shouldPush = start.indexOf( elem ) === -1
          if( shouldPush ) start.push( elem )
          return shouldPush
        })
      
        ordered = ordered.sort( function( a,b ){ return a - b } )
      
        for( let i = 0; i < fnc.values.length; i++ ) {
          let pos = ordered.indexOf( fnc.values[ i ] )
          fnc.values[ i ] = ordered[ ordered.length - pos - 1 ]
        }
        if( Gibberish.mode === 'processor' ) {
          Gibberish.processor.messages.push( fnc.id, 'values', fnc.values )
          Gibberish.processor.messages.push( fnc.id, '_onchange', true )
        }       
        fnc._onchange()
      
        return fnc
      },
      
      invert() {
        let prime0 = fnc.values[ 0 ]
        
        for( let i = 1; i < fnc.values.length; i++ ) {
          if( typeof fnc.values[ i ] === 'number' ) {
            let inverse = prime0 + (prime0 - fnc.values[ i ])
            fnc.values[ i ] = inverse
          }
        }
        
        if( Gibberish.mode === 'processor' ) {
          Gibberish.processor.messages.push( fnc.id, 'values', fnc.values )
          Gibberish.processor.messages.push( fnc.id, '_onchange', true )
        }

        fnc._onchange()
        
        return fnc
      },
    
      switch( to ) {
        if( fnc.storage[ to ] ) {
          fnc.values = fnc.storage[ to ].slice( 0 )
        }
        
        fnc._onchange()
        
        return fnc
      },
    
      rotate( amt ) {
        if( amt > 0 ) {
          while( amt > 0 ) {
            let end = fnc.values.pop()
            fnc.values.unshift( end )
            amt--
          }
        }else if( amt < 0 ) {
          while( amt < 0 ) {
            let begin = fnc.values.shift()
            fnc.values.push( begin )
            amt++
          }
        }

        if( Gibberish.mode === 'processor' ) {
          Gibberish.processor.messages.push( fnc.id, 'values', fnc.values )
          Gibberish.processor.messages.push( fnc.id, '_onchange', true )
        }

        fnc._onchange()
        
        return fnc
      }
    })
    
    if( Gibberish.mode === 'worklet' ) {
      fnc.id = Gibberish.utilities.getUID()
    }
    //fnc.filters.pattern = fnc
    fnc.retrograde = fnc.reverse.bind( fnc )
    
    fnc.end = fnc.values.length - 1
    
    fnc.original = fnc.values.slice( 0 )
    fnc.storage[ 0 ] = fnc.original.slice( 0 )
    
    fnc.integersOnly = fnc.values.every( function( n ) { return n === +n && n === (n|0); })
    
    let methodNames =  [
      'rotate','switch','invert','reset', 'flip',
      'transpose','reverse','shuffle','scale',
      'store', 'range', 'set'
    ]

    // XXX restore this! 
    
    if( Gibberish.mode === 'worklet' ) {
      for( let key of methodNames ) { Gibber.addSequencing( fnc, key, 1 ) }
    }
    
    fnc.listeners = {}
    fnc.sequences = {}

    // TODO: Gibber.createProxyProperties( fnc, { 'stepSize':0, 'start':0, 'end':0 })
    
    fnc.__proto__ = PatternProto 

    // 'isPattern' is a hack to force pattern initialization arguments to be submitted as
    // a list, instead of in a property dictionary. When 'isPattern' is true, gibberish
    // looks for an 'inputs' property and then passes its value (assumed to be an array)
    // using the spread operator to the constructor. 
    const out = Gibberish.Proxy( 'pattern', { inputs:fnc.values, isPattern:true, filters:fnc.filters, id:fnc.id }, fnc )  

    //if( Gibberish.mode === 'processor' ) { console.log( 'filters:', out.filters ) }

    return out
  }

  /*Pattern.listeners = {}

  Pattern.listeners.range = function( fnc ) {
    //if( !Notation.isRunning ) return
    
    // TODO: don't use Gibber.currentTrack, store the object in the pattern
    var obj = Gibber.currentTrack,
        rangeStart = obj.markup.textMarkers[ fnc.patternName ][ fnc.start ].find(),
        rangeEnd   = obj.markup.textMarkers[ fnc.patternName ][ fnc.end ].find()

    if( !fnc.range.init ) {
      fnc.range.init = true
      var ptrnStart = obj.markup.textMarkers[ fnc.patternName ][ 0 ].find(),
          ptrnEnd = obj.markup.textMarkers[ fnc.patternName ][ obj.markup.textMarkers[ fnc.patternName ].length - 1 ].find()

      //fnc.column.editor.markText( ptrnStart.from, ptrnEnd.to, { className:'rangeOutside' })
      //Gibber.Environment.codemirror.markText( ptrnStart.from, ptrnEnd.to, { className:'pattern-update-range-outside' })
      if( !Pattern.listeners.range.initialzied ) Pattern.listeners.range.init()
    }

    if( fnc.range.mark ) fnc.range.mark.clear()
    //fnc.range.mark = fnc.column.editor.markText( rangeStart.from, rangeEnd.to, { className:'rangeInside' })
    // TODO: Dont use GE.codemirror... how else do I get this? stored in pattern is created?
    fnc.range.mark = Gibber.Environment.codemirror.markText( rangeStart.from, rangeEnd.to, { className:'pattern-update-range-inside' })
  }

  Pattern.listeners.range.init = function() {
    //$.injectCSS({ 
    //  '.rangeOutside': {
    //    'color':'#666 !important'
    //  },
    //  '.rangeInside': {
    //    'color':'rgba(102, 153, 221, 1) !important'
    //  }
    //})
    Pattern.listeners.range.initialized = true
  }

  Pattern.prototype = PatternProto*/

  return Pattern

}

// helper function to pass the pattern constructor to the gibberish worklet processor.
patternWrapper.transfer = function( Audio, constructorString ) {
  if( Audio.Gibberish !== undefined && Audio.Gibberish.mode === 'worklet' ) {
    Audio.Gibberish.worklet.port.postMessage({
      address:'addConstructor',
      name:'Pattern',
      constructorString
    })
  }
}


module.exports = patternWrapper
