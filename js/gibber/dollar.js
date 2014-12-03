var $ = require( 'jquery' ),
    jQuery = $

!function() {
  "use strict"

  var events = {}
      
  $.subscribe   = function( key, fcn ) { 
    if( typeof events[ key ] === 'undefined' ) {
      events[ key ] = []
    }
    events[ key ].push( fcn )
  }

  $.unsubscribe = function( key, fcn ) {
    if( typeof events[ key ] !== 'undefined' ) {
      var arr = events[ key ]
    
      arr.splice( arr.indexOf( fcn ), 1 )
    }
  }

  $.publish = function( key, data ) {
    if( typeof events[ key ] !== 'undefined' ) {
      var arr = events[ key ]
      for( var i = 0; i < arr.length; i++ ) {
        arr[ i ]( data )
      }
    }
  }

  module.exports = $
}()