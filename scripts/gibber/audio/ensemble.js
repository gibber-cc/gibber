module.exports = function( Gibber ) {
  "use strict"
  
  var Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = Gibber.Clock,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties = {
        amp: {
          min: 0, max: 1,
          output: LINEAR,
          timescale: 'audio',
        },
        pan: {
          min: -.75, max: .75,
          output: LINEAR,
          timescale: 'audio',
        },
        out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
      }    
      
  var Ensemble = function( props ) {
    var obj = new Gibberish.Bus2( obj ).connect( Gibber.Master )
    
		obj.name = 'Ensemble'
    obj.type = 'Gen'
    obj.children = []
    
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    
    obj.fx.ugen = obj
  
    Object.defineProperty(obj, '_', { get: function() { obj.kill(); return obj }, set: function() {} })
    
    Gibber.createProxyProperties( obj, mappingProperties )
    
  	for(var key in props) {
  		var ugenDesc = props[key],
          ugen = ugenDesc.file ? { ugen: new Gibberish.Sampler({ file:ugenDesc.file, pitch:1, amp:ugenDesc.amp }), pitch:ugenDesc.pitch, amp:ugenDesc.amp } : ugenDesc
      
      if( ugen ) {
        if( isNaN( ugen.pitch ) ) ugen.pitch = 1
        if( isNaN( ugen.pan ) )   ugen.pan   = 0
        if( isNaN( ugen.amp ) )   ugen.amp = 1
        if( typeof ugen.symbol === 'undefined' ) ugen.symbol = key
        
    		obj[key] = ugen
        // console.log("KEY", key, ugen, drum, obj[key], obj[key].ugen )
    		obj[key].ugen.pan = ugen.pan
        if( !ugenDesc.file ) ugen.ugen.disconnect() // disconnect non-sampler ugens
    		obj[key].ugen.connect( obj )
    		obj[key].fx = obj[key].ugen.fx
    		obj.children.push( obj[key].ugen )
      }
  	}
    
    obj.note = function(nt) {
      // var p = typeof obj.pitch === 'function' ? obj.pitch() : obj.pitch
      var p = obj.pitch
      if( typeof nt === 'string' ) {
    		for( var key in props ) {
          var ugen = props[ key ]
    			if( nt === ugen.symbol ) {
            if( ugen.file ) {
      				ugen.ugen.note( p, obj[key].amp );
            }else{
      				ugen.ugen.note( ugen.pitch * p, ugen.amp );
            }

    				break;
    			}
    		}
      }else{
        var keys = Object.keys( obj.kit ),
            num = Math.abs( nt ),
            key = keys[ num % keys.length ], 
            ugen = obj[ key ]
        
        ugen.ugen.note( p, ugen.ugen.amp )
      }
    }
    
    var seqNumber
    obj.play = function( pattern ) {
      var notes = pattern, _seqs = [], _durations = [], __durations = [], seqs = notes.split('|'), timeline = {}

      for(var i = 0; i < obj.seq.seqs.length; i++ ) {
        obj.seq.seqs[i].shouldStop = true
      }
      obj.seq.seqs.length = 0
      
      for( var i = 0; i < seqs.length; i++ ) {
        var seq = seqs[i], duration, hasTime = false, idx = seq.indexOf(',')

        if( idx > -1 ) {
          var _value = seq.substr( 0, idx ),
              duration = seq.substr( idx + 1 )
          
          duration = eval(duration)
          hasTime = true
          seq = _value.trim().split('')
        }else{
          seq = seq.trim().split('')
          duration = 1 / seq.length  
        }
        
        if( seq.indexOf('.rnd(') > -1) {// || seq.indexOf('.random(') > -1 ) {
          seq = seq.split( '.rnd' )[0]
          seq = seq.split('').rnd()
        }
        
        if( typeof arguments[1] !== 'undefined') { 
          duration = arguments[1]
          if( !Array.isArray( duration ) ) duration = [ duration ]
          
          var durationsPattern = Gibber.construct( Gibber.Pattern, duration )
            
          if( duration.randomFlag ) {
            durationsPattern.filters.push( function() { return [ durationsPattern.values[ rndi(0, durationsPattern.values.length - 1) ], 1 ] } )
            for( var i = 0; i < duration.randomArgs.length; i+=2 ) {
              durationsPattern.repeat( duration.randomArgs[ i ], duration.randomArgs[ i + 1 ] )
            }
          }
          
          duration = durationsPattern
        }
        
        obj.seq.add({
          key:'note',
          values: Gibber.construct( Gibber.Pattern, seq ),
          durations: Gibber.construct( Gibber.Pattern, [duration] ),
          target:obj
        })
        
        seqNumber = obj.seq.seqs.length - 1
        Object.defineProperties( obj.note, {
          values: {
            configurable:true,
            get: function() { return obj.seq.seqs[ seqNumber ].values },
            set: function( val ) {
              var pattern = Gibber.construct( Gibber.Pattern, val )

              if( !Array.isArray( pattern ) ) {
                pattern = [ pattern ]
              }
              // if( key === 'note' && obj.seq.scale ) {  
              //   v = makeNoteFunction( v, obj.seq )
              // }
              //console.log("NEW VALUES", v )
              obj.seq.seqs[ seqNumber ].values = pattern
            }
          },
          durations: {
            configurable:true,
            get: function() { return obj.seq.seqs[ seqNumber ].durations },
            set: function( val ) {
              if( !Array.isArray( val ) ) {
                val = [ val ]
              }
              obj.seq.seqs[ seqNumber ].durations = val   //.splice( 0, 10000, v )
            }
          },
        })
      }
    }
    
  	obj.pitch = 1;
    
    obj.seq.start()
    obj.connect()
    
    return obj
  }

  return Ensemble
}