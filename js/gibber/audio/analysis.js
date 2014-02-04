( function() {
  var fft
  
  Gibber.Analysis = {
    FFT : function( fftSize, updateRate ) {
      if( typeof fft === 'undefined' ) {
        var _mappingProperty = { min: 0, max: 255, output: Gibber.LOGARITHMIC, timescale: 'graphics' },
            _mappingProperties = {}
        
        fft = Gibberish.context.createAnalyser()
        Gibberish.node.connect( fft )
        fft.fftSize = fftSize || 64
        fft.updateRate = updateRate || 40
        
        fft.values = new Uint8Array( fft.frequencyBinCount )
        
        for( var i = 0; i < fft.fftSize / 2; i++ ) {          
          _mappingProperties[ 'bin' + i ] = $.extend( {}, _mappingProperty )
        }
        
        Gibber.createProxyProperties( fft, _mappingProperties )    
        
        setInterval( function(){
          fft.getByteFrequencyData( fft.values );
          for( var i = 0; i < fft.values.length; i++ ) {
            fft[ 'Bin' + i ].value = fft.values[ i ]
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