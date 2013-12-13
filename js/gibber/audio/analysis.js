( function() {
  var fft
  
  Gibber.Analysis = {
    FFT : function( fftSize, updateRate ) {
      if( typeof fft === 'undefined' ) {
        fft = Gibberish.context.createAnalyser()
        Gibberish.node.connect( fft )
        fft.fftSize = fftSize || 64
        fft.updateRate = updateRate || 40
        
        fft.data = new Uint8Array( fft.frequencyBinCount )
        setInterval(function(){
          fft.getByteFrequencyData( fft.data );
        }, fft.updateRate );
      }
      return fft
    },
    Follow : function( ugen, bufferSize ) {
      var follow = new Gibberish.Follow( ugen, bufferSize )
      return follow
    }
  }

  window.FFT = Gibber.Analysis.FFT
  window.Follow = Gibber.Analysis.Follow
})()