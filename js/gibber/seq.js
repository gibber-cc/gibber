(function() {
  
  "use strict"
  
  var doNotSequence = [ 'durations', 'target', 'scale', 'offset' ]

  var makeNoteFunction = function( notes, obj ) {
    var _note = $.extend( [], notes ),
        count = 0

    return [function() {
      var idx, freq
    
      if( typeof _note.pick === 'function' ) {
        idx =  _note[ _note.pick() ] 
      }else if( typeof _note[ count ] === 'function') {
        idx = _note[ count ]()
      }else{
        idx = _note[ count++ ]
      }
      
      if( typeof obj.scale.notes[ idx ] === 'number' ) {
        freq = obj.scale.notes[ idx ]
      }else{
        try{
          freq = obj.scale.notes[ idx ].fq()
        }catch(e) {
          console.error( "THe frequency could not be obtained from the current scale. Did you specify an invalid mode or root note?")
          seq.stop()
        }
      }          
      //freq = typeof obj.scale.notes[ idx ] === 'number' ? obj.scale.notes[ idx ] : obj.scale.notes[ idx ].fq()			
      if( count >= _note.length ) count = 0
			
      return freq
    }]
  }
  
  Gibber.Seq = function() {
    
    var obj = {}, seq, hasScale
    
    if( $.type( arguments[0] ) === 'object' ) {
      var arg = arguments[0],
          durationsType = $.type( arg.durations ),
          targetsType = $.type( arg.target ),
          hasScale
      
      obj.target = arg.target
      if( typeof arg.scale === 'object' ) obj.scale = arg.scale
      if( typeof arg.offset === 'number' ) obj.offset = Gibber.Clock.time( arg.offset )
      
      if( durationsType === 'array') {
        obj.durations = arg.durations
      }else if( durationsType !== 'undefined') {
        obj.durations = [ arg.durations ]
      }
      
      obj.keysAndValues = {}
      
      var keyList = []
      for( var key in arg ) {
        if( doNotSequence.indexOf( key ) === -1 ) {
          var valueType = $.type( arg[ key ] )
          
          if( valueType === 'array' ) {
            obj.keysAndValues[ key ] = arg[ key ]
          }else if( valueType !== 'undefined' ) {
            obj.keysAndValues[ key ] = [ arg[ key ] ]
          }
          
          keyList.push( key )
        }
      }
      
      if( 'scale' in obj ) {
        if( 'note' in obj.keysAndValues ) {
          obj.keysAndValues.note = makeNoteFunction( obj.keysAndValues.note, obj )
        }else if( 'chord' in obj.keysAndValues ) {
          var _chord = $.extend( [], obj.keysAndValues.chord ),
              count = 0
              
          obj.keysAndValues.chord = [ function() {
            var idxs, chord = []
          
            if( typeof _chord.pick === 'function' ) {
              idxs =  _chord[ _chord.pick() ] 
            }else if( typeof _chord[ count ] === 'function') {
              idxs = _chord[ count ]()
            }else{
              idxs = _chord[ count++ ]
            }

            chord = obj.scale.chord( idxs )
          
            if ( count >= _chord.length) count = 0
          
            return chord
          }]
        }
      }  
    }else{
      obj.key = 'note'
      obj.values = $.isArray( arguments[0] ) ? arguments[0] : [ arguments[0] ]
      obj.durations = $.isArray( arguments[1] ) ? arguments[1] : [ arguments[1] ]
      obj.target = arguments[2]
    }
    //console.log( obj )

    seq = new Gibberish.Sequencer2( obj )
    
    seq.rate = Gibber.Clock
    var oldRate  = seq.__lookupSetter__( 'rate' )
    
    var _rate = seq.rate
    Object.defineProperty( seq, 'rate', {
      get : function() { return _rate },
      set : function(v) {
        _rate = Mul( Gibber.Clock, v )
        oldRate.call( seq, _rate )
      }
    })
    
		seq.name = 'Seq'
    // if( seq.target && seq.target.sequencers ) seq.target.sequencers.push( seq )
    
    $.extend( seq, {
      replaceWith: function( replacement ) { this.kill() },
      kill: function() { 
        if( this.target )
          this.target.sequencers.splice( this.target.sequencers.indexOf( this ), 1 )
          
        this.stop().disconnect()
      }
    })
    
    var nextTime = seq.nextTime,
        oldNextTime = seq.__lookupSetter__('nextTime')
    Object.defineProperty( seq, 'nextTime', {
      get: function() { return nextTime },
      set: function(v) { nextTime = Gibber.Clock.time( v ); oldNextTime( nextTime ) }
    })
    
    var offset = seq.offset
    Object.defineProperty( seq, 'offset', {
      get: function() { return offset },
      set: function(v) { offset = v; nextTime += offset }
    })
    
    for( var i = 0; i < keyList.length; i++ ) {
      (function(_seq) {
        var key = keyList[ i ]

        Object.defineProperty( _seq, key, {
          get: function() { return _seq.keysAndValues[ key ] },
          set: function(v) {
            if( key === 'note' && seq.scale ) {
              v = makeNoteFunction( v, seq )
            }
            _seq.keysAndValues[ key ] = v  
          }
        })
      })(seq)
    }
    
    var _shuffle = seq.shuffle, save = {}
    seq.shuffle = function() {
      if( Object.keys( save ).length === 0 ) {
        for( var key in seq.keysAndValues ) {
          var val = seq.keysAndValues[ key ]
          if( Array.isArray( val ) ) {
            save[ key ] = val.slice( 0 )
          }else{
            save[ key ] = val
          }
        }
      }
      var args = Array.prototype.slice.call( arguments, 0 )
            
      _shuffle.apply( seq, args )
    }
    
    seq.reset = function() {
      if( Object.keys( save ).length !== 0 ) {
        for( var key in save ) {
          var val = save[ key ]
          if( Array.isArray( val ) ) {
            seq.keysAndValues[ key ] = val.slice( 0 )
          }else{
            seq.keysAndValues[ key ] = val
          }
        }
      }
    }
    seq.once = function() {
      this.repeat(1)
      return this
    }    
    seq.showSave = function() {
      //console.log( save )
    }
    
    seq.start()
    
    console.log( 'Sequencer created.' )
    return seq
  }
  
  Gibber.ScaleSeq = function() {
    var args = arguments[0],
        scale
    
    args.root = args.root || 'c4'
    args.mode = args.mode || 'aeolian'
        
    scale = Gibber.Theory.Scale( args.root, args.mode )
    
    delete args.root; delete args.mode
    
    args.scale = scale
    
    return Seq( args )
  }
  
})()
