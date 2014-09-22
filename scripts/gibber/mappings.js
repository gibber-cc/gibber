!function() {  
  var mappings = {
    outputCurves: {
      LINEAR:0,
      LOGARITHMIC:1
    },
    audio : {
      graphics: function( target, from ) {
				if( typeof from.object.track === 'undefined' ) from.object.track = {}
				
        var proxy = typeof from.object.track[ from.name ] !== 'undefined' ? from.object.track[ from.name ] : new Gibberish.Proxy2( from.object, from.name ),
            op    = new Gibberish.OnePole({ a0:.005, b1:.995 }),
            mapping
        
        from.object.track = proxy;

        mapping = target.object[ target.Name ].mapping = Map( proxy, target.min, target.max, from.min, from.max, target.output, from.wrap ) 
        
        op.input = mapping
        
        target.object[ target.name ] = op
        
        mapping.proxy = proxy
        mapping.op = op
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.name ] = target.object[ target.Name ].mapping.getValue()
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      interface: function( target, from ) {
        var proxy = typeof from.track !== 'undefined' ? from.track : new Gibberish.Proxy2( from.object, from.name ),
            op    = new Gibberish.OnePole({ a0:.005, b1:.995 }),
            range = target.max - target.min,
            percent = ( target.object[ target.name ] - target.min ) / range,
            widgetValue = from.min + ( ( from.max - from.min ) * percent ),
            mapping
                
        if( from.object.setValue ) from.object.setValue( widgetValue )
        
        from.track = proxy
        
        mapping = target.object[ target.Name ].mapping = Map( proxy, target.min, target.max, from.min, from.max, target.output, from.wrap ) 
        
        op.input = mapping
        target.object[ target.name ] = op
        
        mapping.proxy = proxy
        mapping.op = op

        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) target.object[ target.name ] = mapping.getValue()
          
          //if( mapping.op ) mapping.op.remove()
          
          delete mapping
        }
        
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.name + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
                
        mapping.replace = function( replacementObject, key, Key  ) {
          proxy.setInput( replacementObject )
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var proxy, mapping
        
        if( typeof from.object.track !== 'undefined' ) {
          proxy = from.object.track
          proxy.count++
        } else {
          proxy = new Gibberish.Proxy2( from.object, from.name )
          proxy.count = 1
        }
        from.object.track = proxy
        
        target.object[ target.name ] = Map( proxy, target.min, target.max, from.min, from.max )
        
        mapping = target.object[ target.Name ].mapping = target.object[ target.name ]() // must call getter function explicitly
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.name ] = mapping.getValue()
          }
          
          if( mapping.op ) mapping.op.remove()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key ) {
          var proxy = new Gibberish.Proxy2( replacementObject, key )
          mapping.input = proxy
          if( replacementObject[ Key ].targets && replacementObject[ Key ].targets.indexOf( target ) === -1 ) {
            replacementObject[ Key ].targets.push( [target, target.Name] )
          }
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        var mapping
        
        target.object[ target.name ] = Map( null, target.min, target.max, 0, 1, 0 )   
        mapping = target.object[ target.Name ].mapping = target.object[ target.name ]() // must call getter function explicitly
        
        if( typeof from.object.track !== 'undefined' ) {
          mapping.follow = from.object.track
          mapping.follow.count++
        } else {
          mapping.follow = new Gibberish.Follow({ input:from.object, useAbsoluteValue: true })
          mapping.follow.count = 1
        }
        from.object.track = mapping.follow
        
        mapping.input = target.object[ target.Name ].mapping.follow
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.name ] = target.object[ target.Name ].mapping.getValue()
          }
          
          if( mapping.bus )
            mapping.bus.disconnect()
          
          if( mapping.follow ) {
            mapping.follow.count--
            if( mapping.follow.count === 0) {
              delete from.object.track
              mapping.follow.remove()
            }
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) {
          mapping.follow.input = replacementObject   
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
        }
      
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          configurable:true,
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
                
        return mapping
      }
    },
    graphics: {
      graphics: function( target, from ) {
        // rewrite getValue function of Map object to call Map callback and then return appropriate value
        var map = Map( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            old = map.getValue.bind( map ),
            mapping
        
        map.getValue = function() {
          //console.log( from.name, from, target.min, target.max, from.min, from.max )
          map.callback( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          return old()
        }
        
        mapping = target.object[ target.Name ].mapping = map
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          target.object.mod( target.name, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          if( target.object.mod ) {
            target.object.removeMod( target.name )
          }else{
            target.modObject.removeMod( target.modName )
          }
          target.object[ target.name ] = target.object[ target.Name ].mapping.getValue()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) { mapping.input = replacementObject }
        
        return mapping
      },
      interface: function( target, from ) {
        // console.log( "FROM", from.name, target.min, target.max, from.min, from.max )
        var _map = Map( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            mapping
            
        if( typeof from.object.functions === 'undefined' ) {
          from.object.functions = {}
          from.object.onvaluechange = function() {
            for( var key in from.object.functions ) {
              from.object.functions[ key ]()
            }
          }
        }

        mapping = target.object[ target.Name ].mapping = _map

        target.mapping.from = from
        
        var fcn_name = target.name + ' <- ' + from.object.name + '.' + from.Name

        from.object.functions[ fcn_name ] = function() {
          var val = mapping.callback( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          // target.object[ target.Name ].value = val
          // console.log( target.Name )
          target.object[ target.Name ].oldSetter.call( target.object[ target.Name ], val )
        }
        // from.object.onvaluechange = function() {          
        //   var val = map.callback( this[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
        //   target.object[ target.name ] = val
        // }
        mapping.replace = function() {
          // var old = from.functions[ target.Name ]
        } 
        
        mapping.remove  = function() {
          console.log( "mapping removed" )
          delete from.object.functions[ fcn_name ]
        } 
        
        if( from.object.setValue ) 
          from.object.setValue( target.object[ target.name ] )
        
        // if( typeof from.object.label !== 'undefined' ) {
        //   from.object.label = target.object.name + '.' + target.Name
        // }
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.name + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var mapping
        
        mapping = target.object[ target.Name ].mapping = Map( null, target.min, target.max, from.min, from.max, target.output, from.wrap )
      
        mapping.follow = typeof from.object.track !== 'undefined' ? from.object.track : new Gibberish.Follow({ input:from.object.properties[ from.name ], useAbsoluteValue: false })
        from.object.track = target.object[ target.Name ].mapping.follow
        // assign input after Map ugen is created so that follow can be assigned to the mapping object
        mapping.input = mapping.follow
      
        mapping.bus = new Gibberish.Bus2({ amp:0 }).connect()

        mapping.connect( mapping.bus )
        
        mapping.replace = function( replacementObject, key, Key ) {
          mapping.follow.input = replacementObject            
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          //console.log( target.object, target.object.mod )
          target.object.mod( target.name, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }

          if( target.object.mod ) {
            target.object.removeMod( target.name )
          }else{
            target.modObject.removeMod( target.modName )
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        console.log( target.Name, target.object )
        if( typeof target.object[ target.Name ].mapping === 'undefined') {
          console.log("MAKING A MAPPING")
          var mapping = target.object[ target.Name ].mapping = Map( null, target.min, target.max, 0, 1, 0 )   
          if( typeof from.object.track !== 'undefined' ) {
            mapping.follow = from.object.track
            mapping.follow.count++
          } else {
            mapping.follow = new Gibberish.Follow({ input:from.object })
            mapping.follow.count = 1
          }
          from.object.track = mapping.follow
          
          var env = mapping.follow.bufferSize
          Object.defineProperty( target.object[ target.Name ], 'env', {
            configurable: true,
            get: function() { return env },
            set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
          })
          
          mapping.input = mapping.follow
          mapping.bus = new Gibberish.Bus2({ amp:0 }).connect()
          mapping.connect( mapping.bus )
        
          mapping.replace = function( replacementObject, key, Key  ) {
            // _console.log( key, replacementObject )
            
            // what if new mapping isn't audio type?
            if ( replacementObject[ Key ].timescale === from.timescale ) {
              var idx = mapping.follow.input[ from.Name ].targets.indexOf( target )
              if( idx >= -1 ) {
                mapping.follow.input[ from.Name ].targets.splice( idx, 1 )
              }
            
              mapping.follow.input = replacementObject   
              if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
            }else{
              mapping.bus.disconnect()
              mapping.follow.remove()
              Gibber.createMappingObject( target, replacementObject )
            }
            
          }
        }else{
          console.log("REPLACING MAPPING")
          mapping.replace( from.object, from.name, from.Name )
          return mapping
        }
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          //console.log( target.object, target.object.mod )
          target.object.mod( target.name, mapping, '=' )
        }else if (target.modObject) {
          target.modObject.mod( target.modName, mapping, '=' )
        }else{
          !function() {
            var _mapping = mapping
            target.object.update = function() { 
              target.object[ target.name ]( _mapping.getValue() )
            }
          }()
          //target.object.mod( target.name, mapping, '=' ) 
        }
        
        //target.object[ target.Name ].mapping = mapping
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }

          if( target.object.mod ) {
            target.object.removeMod( target.name )
          }else if( target.modObject ) {
            target.modObject.removeMod( target.modName )
          }else{
            console.log( 'removing update ')
            //target.object.update = function() {}
          }
          
          delete target.object[ target.Name ].mapping
        }
        return mapping
      }
    },
    notation: {
      graphics: function( target, from ) {
        // rewrite getValue function of Map object to call Map callback and then return appropriate value

        var map = Map( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            old = map.getValue.bind( map ),
            mapping
        
        map.getValue = function() {
          map.callback( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          return old()
        }
        
        mapping = target.object[ target.Name ].mapping = map
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          target.object.mod( target.name, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          if( target.object.mod ) {
            target.object.removeMod( target.name )
          }else{
            target.modObject.removeMod( target.modName )
          }
          target.object[ target.name ] = target.object[ target.Name ].mapping.getValue()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) { mapping.input = replacementObject }
        
        return mapping
      },
      interface: function( target, from ) {
        // console.log( "FROM", from.name, target.min, target.max, from.min, from.max )
        var _map = Map( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            mapping
            
        if( typeof from.object.functions === 'undefined' ) {
          from.object.functions = {}
          from.object.onvaluechange = function() {
            for( var key in from.object.functions ) {
              from.object.functions[ key ]()
            }
          }
        }

        mapping = target.object[ target.Name ].mapping = _map

        target.mapping.from = from
        
        var fcn_name = target.name + ' <- ' + from.object.name + '.' + from.Name

        from.object.functions[ fcn_name ] = function() {
          var val = mapping.callback( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          // target.object[ target.Name ].value = val
          // console.log( target.Name )
          target.object[ target.Name ].oldSetter.call( target.object[ target.Name ], val )
        }
        // from.object.onvaluechange = function() {          
        //   var val = map.callback( this[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
        //   target.object[ target.name ] = val
        // }
        mapping.replace = function() {
          // var old = from.functions[ target.Name ]
        } 
        
        mapping.remove  = function() {
          console.log( "mapping removed" )
          delete from.object.functions[ fcn_name ]
        } 
        
        if( from.object.setValue ) 
          from.object.setValue( target.object[ target.name ] )
        
        // if( typeof from.object.label !== 'undefined' ) {
        //   from.object.label = target.object.name + '.' + target.Name
        // }
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.name + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var mapping
        
        mapping = target.object[ target.Name ].mapping = Map( null, target.min, target.max, from.min, from.max, target.output, from.wrap )
  
        if( typeof from.object.track !== 'undefined' && from.object.track.input === from.object.properties[ from.name ] ) {
          mapping.follow = from.object.track
          mapping.follow.count++
        }else{
          mapping.follow = new Gibberish.Follow({ input:from.object.properties[ from.name ], useAbsoluteValue: false })
          mapping.follow.count = 1
        }
        
        from.object.track = target.object[ target.Name ].mapping.follow
        
        // assign input after Map ugen is created so that follow can be assigned to the mapping object
        mapping.input = mapping.follow
      
        mapping.bus = new Gibberish.Bus2({ amp:0 }).connect()

        mapping.connect( mapping.bus )
        
        mapping.replace = function( replacementObject, key, Key ) {
          mapping.follow.input = replacementObject            
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
        
        mapping.update = function() {   
          target.object[ target.name ]( mapping.getValue() )
        }
        mapping.text = target.object

        // let Notation object handle scheduling updates
        Gibber.Environment.Notation.add( mapping )
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }
          
          Gibber.Environment.Notation.remove( mapping )
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        if( typeof target.object[ target.Name ].mapping === 'undefined') {
          var mapping = target.object[ target.Name ].mapping = Map( null, target.min, target.max, 0, 1, 0 )
          
          console.log( "MAPPING", from )
          
          if( typeof from.object.track !== 'undefined' && from.object.track.input === from.object.properties[ from.name ] ) {
            mapping.follow = from.object.track
            mapping.follow.count++
          }else{
            mapping.follow = new Gibberish.Follow({ input:from.object, useAbsoluteValue: true })
            mapping.follow.count = 1
          }
          
          from.object.track = mapping.follow
          
          var env = mapping.follow.bufferSize
          Object.defineProperty( target.object[ target.Name ], 'env', {
            configurable:true,
            get: function() { return env },
            set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
          })
          
          mapping.input = mapping.follow
          mapping.bus = new Gibberish.Bus2({ amp:0 }).connect()
          mapping.connect( mapping.bus )
        
          mapping.replace = function( replacementObject, key, Key  ) {
            // _console.log( key, replacementObject )
            
            // what if new mapping isn't audio type?
            if ( replacementObject[ Key ].timescale === from.timescale ) {
              var idx = mapping.follow.input[ from.Name ].targets.indexOf( target )
              if( idx >= -1 ) {
                mapping.follow.input[ from.Name ].targets.splice( idx, 1 )
              }
            
              mapping.follow.input = replacementObject   
              if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
            }else{
              mapping.bus.disconnect()
              mapping.follow.remove()
              Gibber.createMappingObject( target, replacementObject )
            }
            
          }
        }else{
          mapping.replace( from.object, from.name, from.Name )
          return mapping
        }
        
        mapping.update = function() {   
          target.object[ target.name ]( mapping.getValue() )
        }
        mapping.text = target.object

        // let Notation object handle scheduling updates
        Gibber.Environment.Notation.add( mapping )
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }
          
          Gibber.Environment.Notation.remove( mapping )
          
          delete target.object[ target.Name ].mapping
        }
        return mapping
      }
    },
  }
  
  module.exports = mappings
}()