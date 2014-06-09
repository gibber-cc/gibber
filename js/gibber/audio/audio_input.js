(function() { 
  "use strict"
  
  var mappingProperties = {
    amp: {
      min: 0, max: 1,
      hardMax:2,
      output: Gibber.LOGARITHMIC,
      timescale: 'audio',
      dimensions:1
    },
    out: {
      min: 0, max: 1,
      output: Gibber.LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    //pan: { min: -1, max: 1, output: Gibber.LINEAR, timescale: 'audio',},   
  }

  var name = 'Input'
  window.Input = Gibber.Input = function() {
    var oscillator = new Gibberish.Input().connect( Gibber.Master ),
        args = Array.prototype.slice.call( arguments, 0 )
       
    oscillator.type = 'Gen'
    $.extend( true, oscillator, Gibber.ugen )
    
    oscillator.fx.ugen = oscillator
    
    Object.defineProperty(oscillator, '_', {
      get: function() { 
        oscillator.kill();
        return oscillator 
      },
      set: function() {}
    })    
    
    Gibber.createProxyProperties( oscillator, mappingProperties )
        
    Gibber.processArguments2( oscillator, args, name )

    oscillator.toString = function() { return '> ' + name }
    
    return oscillator
  }
})()


