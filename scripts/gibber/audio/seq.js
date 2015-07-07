module.exports = function( Gibber ) {
  //"use strict"
  
  var Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      doNotSequence = [ 'durations', 'target', 'scale', 'offset', 'doNotStart', 'priority' ]
  
  var makeChordFunction = function( notes, obj ) {
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
        if( typeof idx === 'undefined' ) return // rest
        try{
          freq = obj.scale.notes[ idx ].fq()
        }catch(e) {
          console.error( "The frequency could not be obtained from the current scale. Did you specify an invalid mode or root note?")
          obj.stop()
        }
      }          
      //freq = typeof obj.scale.notes[ idx ] === 'number' ? obj.scale.notes[ idx ] : obj.scale.notes[ idx ].fq()			
      if( count >= _note.length ) count = 0
			
      return freq
    }]
  }
  
  var Seq = function() {
    var obj = {}, seq, hasScale, keyList = []
    
    if( typeof arguments[0]  === 'object' && ! Array.isArray( arguments[0] ) ) {
      var arg = arguments[0],
          durationsType = typeof arg.durations,
          targetsType = typeof arg.target,
          priority = arg.priority,
          hasScale
      
      obj.target = arg.target
            
      if( typeof arg.scale === 'object' ) obj.scale = arg.scale
      if( typeof arg.offset === 'number' ) obj.offset = Gibber.Clock.time( arg.offset )
      
      // if( durationsType === 'object') {
      //   obj.durations = arg.durations
      // }else if( durationsType !== 'undefined') {
      //   obj.durations = [ arg.durations ]
      // }else{ }
      obj.durations = arg.durations 
            
      obj.keysAndValues = {}
      obj.seqs = []
      obj.autofire = []

      if( obj.durations ) {
        if( !Array.isArray( obj.durations) ) { obj.durations = [ obj.durations ] }
        
        var durationsPattern = Gibber.construct( Gibber.Pattern, obj.durations )
        
        if( obj.durations.randomFlag ) {
          durationsPattern.filters.push( function() { 
            var idx = Gibber.Utilities.rndi(0, durationsPattern.values.length - 1)
            return [ durationsPattern.values[ idx ], 1, idx ] 
          })
          for( var i = 0; i < obj.durations.randomArgs.length; i+=2 ) {
            durationsPattern.repeat( obj.durations.randomArgs[ i ], obj.durations.randomArgs[ i + 1 ] )
          }
        }
      }
      
      for( var _key in arg ) {
        !function() {
          var key = _key
          if( doNotSequence.indexOf( key ) === -1 ) {
            var isArray = Array.isArray( arg[key] )// $.type( arg[ key ] )
          
            var _seq = {
              key: key,
              target: obj.target,
              durations: durationsPattern,
            }
          
            var valuesPattern
            if( isArray ) {
              valuesPattern = Gibber.construct( Gibber.Pattern, arg[ key ] )
            }else if( typeof arg[ key ] !== 'undefined' ) {
              valuesPattern = Gibber.construct( Gibber.Pattern, [ arg[ key ] ] )//[ arg[ key ] ]
            }
          
            if( arg[ key ].randomFlag ) {
              valuesPattern.filters.push( function() {
                var idx = Gibber.Utilities.rndi(0, valuesPattern.values.length - 1)
                return [ valuesPattern.values[ idx ], 1, idx ] 
              })
              for( var i = 0; i < arg[ key ].randomArgs.length; i+=2 ) {
                valuesPattern.repeat( arg[ key ].randomArgs[ i ], arg[ key ].randomArgs[ i + 1 ] )
              }
            }
            
            if( key === 'note' ) {
              valuesPattern.filters.push( function() { 
                var output = arguments[ 0 ][ 0 ]
                if( output && output < Gibber.minNoteFrequency ) {
                  if( obj.scale ) {
                    output = obj.scale.notes[ output ]
                  }else{
                    output = Gibber.scale.notes[ output ]
                  }
                }
                
                return [ output, arguments[0][1], arguments[0][2] ] 
              })
            }
            
            _seq.values = valuesPattern
            
            _seq.stop = function() { _seq.shouldStop = true } 
    
            // TODO: property specific stop/start/shuffle etc. for polyseq
            _seq.start = function() {
              _seq.shouldStop = false
              seq.timeline[0] = [ _seq ]                
              seq.nextTime = 0
      
              if( !seq.isRunning ) { 
                seq.start( false, priority )
              }
            }
    
            _seq.repeat = function( numberOfTimes ) {
              var repeatCount = 0
      
              var filter = function( args, ptrn ) {
                if( args[2] % (ptrn.getLength() - 1) === 0 && args[2] !== 0) {
                  repeatCount++
                  if( repeatCount === numberOfTimes ) {
                    ptrn.seq.stop()
                  }
                }
                return args
              }
      
              valuesPattern.filters.push( filter )
            }
            
            valuesPattern.seq = _seq
            //durationsPattern.seq = _seq 
            
            obj.seqs.push( _seq )
            keyList.push( key )
          }
        }()
      }
      
      if( 'scale' in obj ) {
        var noteIndex = keyList.indexOf( 'note' ),
            chordIndex = keyList.indexOf( 'chord' )
            
        //var makeNoteFunction = function( notes, obj ) {

        // if( noteIndex > -1 ) {
        //   obj.seqs[ noteIndex ].values = makeNoteFunction( obj.seqs[ noteIndex ].values, obj )
        // }
        
        if( chordIndex > -1 ) {
          var _chord = $.extend( [], obj.seqs[ chordIndex ] ),
              count = 0
              
          obj.seqs[ chordIndex ] = [ function() {
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
    }else if( typeof arguments[0] === 'function' || Array.isArray( arguments[0] ) ){
      obj.seqs = [{
        key:'functions',
        values: Array.isArray( arguments[0] ) ? arguments[0] : [ arguments[ 0 ] ],
        durations: Gibber.Clock.time( arguments[ 1 ] )
      }]
      if( typeof arguments[1] === 'function' || Array.isArray( arguments[1] ) ) {
        obj.seqs[0].durations = arguments[ 1  ]
      }
      keyList.push('functions')
    }
      
    seq = new Gibberish.PolySeq( obj )
    seq.timeModifier = Gibber.Clock.time.bind( Gibber.Clock )
		seq.name = 'Seq'
    seq.save = {}
    
    seq.oldShuffle = seq.shuffle
    delete seq.shuffle
    
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

    var nextTime = seq.nextTime,
        oldNextTime = seq.__lookupSetter__('nextTime')
    Object.defineProperty( seq, 'nextTime', {
      get: function() { return nextTime },
      set: function(v) { nextTime = Gibber.Clock.time( v ); oldNextTime( nextTime ) }
    })
    
    var offset = seq.offset
    Object.defineProperty( seq, 'offset', {
      get: function() { return offset },
      set: function(v) { offset = v; seq.nextTime += offset }
    })
    seq.nextTime += seq.offset
    
    for( var i = 0; i < keyList.length; i++ ) {
      (function(_seq) {
        var key = keyList[ i ],
            _i  = i

        Object.defineProperty( _seq, key, {
          get: function() { return _seq.seqs[ _i ].values },
          set: function(v) {
            // if( key === 'note' && _seq.scale ) {
            //   v = makeNoteFunction( v, _seq )
            // }
            _seq.seqs[ _i ].values = v  
          }
        })
      })(seq)
    }
    
    var _durations = durationsPattern
    Object.defineProperty( seq, 'durations', {
      get: function() { return _durations },
      set: function(v) {
        _durations = v
        for( var i = 0; i < seq.seqs.length; i++ ) {
          var _seq = seq.seqs[i]
          _seq.durations = _durations
        }
      }
    })
    
    if( arguments[0] && ! arguments[0].doNotStart ) {
      seq.start( true )
    }
    
    seq.toString = function() { return '> Seq' }
    seq.gibber = true
     
    $.extend( seq, {
      constructor: Seq,
      replaceWith: function( replacement ) { this.kill() },
      kill: function() { 
        if( this.target && this.target.sequencers )
          this.target.sequencers.splice( this.target.sequencers.indexOf( this ), 1 )
      
          console.log("SEQ KILL", this )
        this.stop().disconnect()
        
        Seq.children.splice( Seq.children.indexOf( this ), 1 )
      },
      applyScale : function() {
        // for( var i = 0; i < this.seqs.length; i++ ) {
        //   var s = this.seqs[ i ]
        //   if( s.key === 'note' || s.key === 'frequency' ) {
        //     s.values = makeNoteFunction( s.values, this )
        //   }
        // }
      },
      once : function() {
        this.repeat( 1 )
        return this
      },
      reset : function() {
        for( var i = 0; i < this.seqs.length; i++ ) {  
          this.seqs[ i ].values[0].reset()
        }
      },
      shuffle : function() {
        for( var i = 0; i < this.seqs.length; i++ ) {
          this.seqs[ i ].values[0].shuffle()
        }
      },
      // repeat : function( numberOfTimes ) { 
      //   var repeatCount = 0
      //   
      //   var filter = function( args, ptrn ) {
      //     if( args[2] % (ptrn.getLength() - 1) === 0 && args[2] !== 0) {
      //       ptrn.seq.stop()
      //     }
      //     return args
      //   }
      //   
      // }
    })
    
    Seq.children.push( seq )
    
    return seq
  }
  
  Seq.children = []
  
  var ScaleSeq = function() {
    var args = arguments[0],
        scale
    
    args.root = args.root || 'c4'
    args.mode = args.mode || 'aeolian'
    
    scale = Gibber.Theory.Scale( args.root, args.mode )
    
    delete args.root; delete args.mode
    
    args.scale = scale
    
    return Seq( args )
  }
  
  var Seqs = { 'Seq': Seq, 'ScaleSeq':ScaleSeq }
  
  return Seqs 
}