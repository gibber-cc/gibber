module.exports = function( Gibber, Mousetrap ) {
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
      },

  Keys = {
    bind: function( key, fcn ) {
      Mousetrap.bind( key, fcn )
    },
    
    init: function() {
      Mousetrap.stopCallback = function(e, element, combo ) {
        return false
      }
    }
  }

  return Keys
}
