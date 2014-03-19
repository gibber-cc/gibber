  (function() {
  "use strict"
  
  Gibber.Envelopes = {}
    
  var types = [
    'Line',    
  ],
  _mappingProperties = {
    Line: {
      start: {
        min: 0, max: 1,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      end: {
        min: 0, max: 1,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      time: {
        min: 0, max: 8,
        output: Gibber.LINEAR,
        timescale: 'audio',
      }
    },
  };
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Gibber.Envelopes[ name ] = function() {
        var args = Array.prototype.slice.call(arguments, 0),
            obj
            
        obj = new Gibberish[ type ]( args[0], args[1], Gibber.Clock.time( args[2] ), args[3] )
        //obj.type = 'Env'
        obj.name = name
      
        $.extend( true, obj, Gibber.ugen )
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] ) 
        
        Gibber.processArguments2( obj, args, obj.name )
        
        console.log( name + ' is created.' )
        return obj
      }
    })()
  }  
})()
