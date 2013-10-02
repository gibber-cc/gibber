(function() {
  "use strict"
  
  var types = [
    [ 'Bus2', 'Bus' ],
  ],
  mappingProperties = {
    amp: {
      min: 0, max: 1,
      output: Gibber.LINEAR,
      timescale: 'audio',
    },
    pan: {
      min: -.75, max: .75,
      output: Gibber.LINEAR,
      timescale: 'audio',
    },
  },
  init = false;
  
  Gibber.Busses = {}
  Gibber.Busses.mappingProperties = mappingProperties
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Gibber.Busses[ name ] = function() {
        var obj = Gibber.processArguments( arguments, name )
        
        if( Array.isArray( obj ) ) {
          obj.unshift(0)
          obj = Gibber.construct( Gibberish[ type ], obj )
        }else{
          obj =  new Gibberish[ type ]( obj )
        }
        
        if(init) {
          obj.connect( Master )
        }else{
          init = true;
        }
        
        obj.type = 'FX'
      
        $.extend( true, obj, Gibber.ugen )
        
        obj.fx.ugen = obj
        
        Gibber.createMappingAbstractions( obj, mappingProperties )
 
        return obj
      }
    })()
  }
})()