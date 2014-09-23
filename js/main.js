!function() {
  "use strict"
  
  window.$ = require( './gibber/dollar' )
  require( './external/injectCSS.js' )

  window.Gibber = require( 'gibber.lib' )

  Gibber.Environment = require( './gibber/environment' )( Gibber )

  Gibber.init()

  Gibber.Environment.init()
}()