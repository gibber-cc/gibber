!function() {
  "use strict";
  
  var PostProcessing,
      Gibberish = require( 'gibberish-dsp' ),
      Gibber,
      compressor = null, 
      end = null,
      hishelf = null,
      lowshelf = null,
      postgraph = null,
      init = function() {
        postgraph = [ Gibberish.node, Gibberish.context.destination ]
      },
      disconnectGraph = function() {
        for( var i = 0; i < postgraph.length - 1; i++ ) {
          postgraph[ i ].disconnect( postgraph[ i + 1 ] )
        }
      },
      connectGraph = function() {
        for( var i = 0; i < postgraph.length - 1; i++ ) {
          postgraph[ i ].connect( postgraph[ i + 1 ] )
        }
      },
      insert = function( node, position ) { 
        if( typeof position !== 'undefined' ) {
          if( position > 0 && position < postgraph.length - 1 ) {
            disconnectGraph()
            postgraph.splice( position, 0, node )
          }else{
            console.error( 'Invalid position for inserting into postprocessing graph: ', position )
            return
          }
        }else{
          disconnectGraph()
          postgraph.splice( 1, 0, node )
        }
      
        connectGraph()
      };
  
  var PP = PostProcessing = {
    Compressor : function( position ) {
      if( compressor === null ) {
        
        compressor = Gibberish.context.createDynamicsCompressor()
        
        var _threshold = compressor.threshold,
            _ratio     = compressor.ratio,
            _attack    = compressor.attack,
            _release    = compressor.release
            
        Object.defineProperties( compressor, {
          threshold: {
            get: function()  { return _threshold.value },
            set: function(v) { _threshold.value = v }
          },
          ratio: {
            get: function()  { return _ratio.value },
            set: function(v) { _ratio.value = v }
          },
          attack: {
            get: function()  { return _attack.value },
            set: function(v) { _attack.value = v }
          },
          release: {
            get: function()  { return _release.value },
            set: function(v) { _release.value = v }
          },
        }) 
        
        PP.insert( compressor, position )
      }
      
      return compressor
    },
    
    LowShelf : function( position ) {
      if( lowshelf === null ) {
        lowshelf = Gibberish.context.createBiquadFilter()
            
        lowshelf.type = 3 // lowshelf
        lowshelf.frequency.value = 220
        lowshelf.Q.value = 0
        lowshelf.gain.value = 6
        
        var _gain       = lowshelf.gain,
            _frequency  = lowshelf.frequency,
            _Q          = lowshelf.Q
            
            
        Object.defineProperties( lowshelf, {
          frequency: {
            get: function()  { return _frequency.value },
            set: function(v) { _frequency.value = v }
          },
          gain: {
            get: function()  { return _gain.value },
            set: function(v) { _gain.value = v }
          },
          Q: {
            get: function()  { return _Q.value },
            set: function(v) { _Q.value = v }
          },
        })
        
        PP.insert( lowshelf, position )
      }
      
      return lowshelf
    },
    
    HiShelf : function( position ) {
      if( hishelf === null ) {
        hishelf = Gibberish.context.createBiquadFilter()
            
        hishelf.type = 4 // hishelf
        hishelf.frequency.value = 880
        hishelf.Q.value = 0
        hishelf.gain.value = 6
        
        var _gain       = hishelf.gain,
            _frequency  = hishelf.frequency,
            _Q          = hishelf.Q
            
        Object.defineProperties( hishelf, {
          frequency: {
            get: function()  { return _frequency.value },
            set: function(v) { _frequency.value = v }
          },
          gain: {
            get: function()  { return _gain.value },
            set: function(v) { _gain.value = v }
          },
          Q: {
            get: function()  { return _Q.value },
            set: function(v) { _Q.value = v }
          },
        })
        
        PP.insert( hishelf, position )
      }
      
      return hishelf
    },
  }
  
  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return PostProcessing }
  
}()