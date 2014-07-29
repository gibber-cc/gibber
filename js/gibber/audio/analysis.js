( function() {
  var fft,
      mappingProperties = { value:{ min: 0, max: 255, output: Gibber.LOGARITHMIC, wrap:false, timescale: 'graphics' } }
  
  Gibber.Analysis = {
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
            
            child.valueOf = function() { return this.value() }
          }()
        }
        
        setInterval( function(){
          fft.getByteFrequencyData( fft.values );
          for( var i = 0; i < fft.values.length; i++ ) {
            fft[ i ].value = fft.values[ i ]
          }
        }, fft.updateRate );
      }else{
        if( fftSize ) fft.fftSize = fftSize
        if( updateRate ) fft.updateRate = updateRate
      }
      
      return fft
    },
    Follow : function( ugen, bufferSize ) {
      var follow = new Gibberish.Follow( ugen, bufferSize ),
          _mappingProperties = { value: { min: 0, max: 1, output: Gibber.LOGARITHMIC, timescale: 'audio' } }

      Gibber.createProxyProperties( follow, _mappingProperties )

      return follow
    }
  }

  window.FFT = Gibber.Analysis.FFT
  window.Follow = Gibber.Analysis.Follow
})()