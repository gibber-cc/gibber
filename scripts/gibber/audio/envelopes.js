module.exports = function( Gibber ) {
  "use strict"
  
  var Envelopes = {},
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = Gibber.Clock,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      types = [
        'Line', 
        'AD',
        'ADSR' 
      ],
      _mappingProperties = {
        Line: {
          start: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          end: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          time: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          }
        },
        AD: {
          attack: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          decay: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          ADSR: {
            attack: {
              min: 0, max: 8,
              output: LINEAR,
              timescale: 'audio',
            },
            decay: {
              min: 0, max: 8,
              output: LINEAR,
              timescale: 'audio',
            },
            sustain: {
              min: 0, max: 8,
              output: LINEAR,
              timescale: 'audio',
            },
            release: {
              min: 0, max: 8,
              output: LINEAR,
              timescale: 'audio',
            }
          },
        },
      };
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Envelopes[ name ] = function() {
        var args = Array.prototype.slice.call(arguments, 0),
            obj
        
        if( typeof args[0] !== 'object' ) {
          // console.log( args[0], args[1], args[2], Gibber.Clock.time( args[2] ) )
          obj = new Gibberish[ type ]( args[0], args[1], Gibber.Clock.time( args[2] ), args[3] )
        }else{
          obj = Gibber.construct( Gibberish[ type ], args[0] )
        }
        //obj.type = 'Env'
        obj.name = name
      
        $.extend( true, obj, Gibber.Audio.ugenTemplate )
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] ) 
        
        Gibber.processArguments2( obj, args, obj.name )
        
        if( name === 'AD' || name === 'ADSR' ) {
          Gibber.createProxyMethods( obj, ['run'] )
        }
        
        console.log( name + ' is created.' )
        return obj
      }
    })()
  }
  
  return Envelopes

}
