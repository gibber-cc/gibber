( function() {
  "use strict"
  
  var _k = null,
      mappingProperties = {
        x : {
          min:0, max:1,
          timescale:'interface',
          output: Gibber.LINEAR
        },
        y : {
          min:0, max:1,
          timescale:'interface',
          output: Gibber.LINEAR
        },
      }


  window.Keys = Gibber.Environment.Keys = {
    bind: function( key, fcn ) {
      Mousetrap.bind( key, fcn )
    }
  }
  
  Mousetrap.stopCallback = function(e, element, combo ) {
    return false
  }
})()
