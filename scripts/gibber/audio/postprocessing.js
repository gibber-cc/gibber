module.exports = function( Gibber ) {
  "use strict";
  var loadBuffer = function(ctx, filename, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", filename, true);
    request.responseType = "arraybuffer";
    request.onload = function() {
      Gibberish.context.decodeAudioData( request.response, function(_buffer) {
        callback( _buffer )
      }) 
    };
    request.send();
  }
  
  var compressor = null, 
      Gibberish,
      end = null,
      hishelf = null,
      lowshelf = null,
      postgraph = null,
      masterverb = null;
  
  var PP = Gibber.AudioPostProcessing = {
    initialized: false,    
    getPostgraph : function() { return postgraph },

    init : function() {
      if( !this.initialized ) {
        Gibberish = Gibber.Audio.Core
        postgraph = [ Gibberish.node, Gibberish.context.destination ]
        this.initialized = true
        $.subscribe( '/gibber/clear', PP.clear.bind( this ) )
      }
    },
    
    clear : function() {
      this.disconnectGraph()
      postgraph = [ Gibberish.node, Gibberish.context.destination ]
      this.connectGraph()
    },
    
    disconnectGraph: function() {
      for( var i = 0; i < postgraph.length - 1; i++ ) {
        postgraph[ i ].disconnect( postgraph[ i + 1 ] )
      }
    },
    
    connectGraph : function() {
      for( var i = 0; i < postgraph.length - 1; i++ ) {
        postgraph[ i ].connect( postgraph[ i + 1 ] )
      }
    },
    
    insert: function( node, position ) { 
      if( typeof position !== 'undefined' ) {
        if( position > 0 && position < postgraph.length - 1 ) {
          PP.disconnectGraph()
          postgraph.splice( position, 0, node )
        }else{
          console.error( 'Invalid position for inserting into postprocessing graph: ', position )
          return
        }
      }else{
        PP.disconnectGraph()
        postgraph.splice( 1, 0, node )
      }
      
      PP.connectGraph()
    },
    
    Compressor : function( position ) {
      if( compressor === null ) {
        
        PP.init()
        
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
    
    MasterVerb: function( verb ) {
      if( masterverb === null ) {
        if( typeof verb === 'undefined' ) verb = 'smallPlate'
        
        masterverb = Gibberish.context.createConvolver();
        masterverb.impulseName = verb
        
        loadBuffer( Gibberish.context, 'resources/impulses/' + verb + '.wav', function( _buffer ) {
          masterverb.buffer = _buffer
        })
        
        //postgraph[ 0 ].connect( masterverb, 2, 0 )
        //postgraph[ 0 ].connect( masterverb, 3, 1 )        
        
        Gibberish.reverbOut.connect( masterverb )
        
        masterverb.gainNode = Gibberish.context.createGain()
        
        masterverb.gainNode.connect( Gibberish.context.destination )
        masterverb.connect( masterverb.gainNode )
        
        Object.defineProperty( masterverb, 'gain', {
          get: function() { 
            return masterverb.gainNode.gain.value
          },
          set: function(v) {
            masterverb.gainNode.gain.value = v
          }
        })
        
        masterverb.gain = .2
        //175314__recordinghopkins__large-dark-plate-01.wav
      }else if( verb !== masterverb.impulseName ) {
        loadBuffer( Gibberish.context, 'resources/impulses/' + verb + '.wav', function( _buffer ) {
          masterverb.impulseName = verb
          masterverb.buffer = _buffer
        })
      }
      
      return masterverb
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
  
  return PP
}