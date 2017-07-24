module.exports = function( Gibber ) {
  "use strict"
  
  var fft,
      mappingProperties = { 
        value:{ min: 0, max: 255, output: LOGARITHMIC, wrap:false, timescale: 'graphics' } 
      },
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
  
  var Analysis = {
    FFT : function( fftSize, updateRate ) {
      if( typeof fft === 'undefined' ) {      
        fft = Gibberish.context.createAnalyser()
        Gibberish.node.connect( fft )
        fft.fftSize = fftSize || 32
        fft.updateRate = updateRate || 40
        
        fft.values = new Uint8Array( fft.frequencyBinCount )
        fft.children = []
                
        for( var i = 0; i < fft.frequencyBinCount; i++ ) {          
          !function() { 
            var num = i,
                child = {},
                _value = 0
  
            Object.defineProperties( child, {
              value: {
                configurable:true,
                get: function() { return _value },
                set: function(v) { _value = v }
              }
            })
            
            Gibber.createProxyProperties( child, $.extend( {}, mappingProperties) , false )
            fft[ num ] = child
            fft.children.push( child )
            
            child.type = 'mapping'
            child.index = num
            child.min = 0; child.max = 255; // needed to map directly to children
            
            child.valueOf = function() { return this.value.value }
          }()
        }
        
        fft.low = { _value:0 }; fft.mid = { _value:0 }; fft.high = { _value:0 }

        var ranges = ['low','mid','high']

        ranges.forEach( function( v ) { 
          fft[ v ]._value = 0 

          Object.defineProperty( fft[ v ], 'value', {
            configurable:true,
            get: function() { return fft[ v ]._value },
            set: function(val) { fft[ v ]._value = val }
          })

          Gibber.createProxyProperties( fft[ v ], $.extend( {}, mappingProperties) , false )
            
          fft[ v ].type = 'mapping'
          fft[ v ].min = 0; fft[ v ].max = 255; // needed to map directly to children
            
          fft[ v ].valueOf = function() { return fft[ v ].value }
        })

        
        setInterval( function(){
          fft.getByteFrequencyData( fft.values );
          var lowSum = 0, midSum = 0, highSum = 0, lowCount = 0, midCount = 0, highCount = 0;

          // XXX ONLY WORKS FOR DEFAULT FFT WINDOW (32)
          for( var i = 0, len = fft.values.length; i < len; i++ ) {
            fft[ i ].value = fft.values[ i ]
            if( i > 0 ) {
              if( i < 3 ) {
                lowSum += fft.values[ i ]
                lowCount++
              }else if( i < 6 ) {
                midSum += fft.values[ i ]
                midCount++
              }else{
                highSum += fft.values[ i ]
                highCount++
              }
            }
          }

          fft.low.value = lowSum / lowCount
          fft.mid.value = midSum / midCount
          fft.high.value = highSum / highCount

        }, fft.updateRate );
      }else{
        if( fftSize ) fft.fftSize = fftSize
        if( updateRate ) fft.updateRate = updateRate
      }
      
      return fft
    },
    Follow : function( ugen, bufferSize ) {
      var follow = new Gibberish.Follow( ugen, bufferSize ),
          _mappingProperties = { value: { min: 0, max: 1, output: LOGARITHMIC, timescale: 'audio' } }

      Gibber.createProxyProperties( follow, _mappingProperties )

      return follow
    }
  }

  return Analysis
  //module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Analysis }
  
}
