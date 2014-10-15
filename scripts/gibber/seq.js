!function() {
  
  //"use strict"
  
  var Gibberish = require( 'gibberish-dsp' ),
      Gibber,
      $ = require( './dollar' ),
      doNotSequence = [ 'durations', 'target', 'scale', 'offset', 'doNotStart', 'priority' ]

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
          console.error( "The frequency could not be obtained from the current scale. Did you specify an invalid mode or root note?")
          obj.stop()
        }
      }          
      //freq = typeof obj.scale.notes[ idx ] === 'number' ? obj.scale.notes[ idx ] : obj.scale.notes[ idx ].fq()			
      if( count >= _note.length ) count = 0
			
      return freq
    }]
  }
  
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
          targetsType = typeof arg.target ,
          priority = arg.priority,
          hasScale
      
      obj.target = arg.target
      if( typeof arg.scale === 'object' ) obj.scale = arg.scale
      if( typeof arg.offset === 'number' ) obj.offset = Gibber.Clock.time( arg.offset )
      
      if( durationsType === 'array') {
        obj.durations = arg.durations
      }else if( durationsType !== 'undefined') {
        obj.durations = [ arg.durations ]
      }else{
        
      }
      
      obj.keysAndValues = {}
      obj.seqs = []
      obj.autofire = []
      
      for( var key in arg ) {
        if( doNotSequence.indexOf( key ) === -1 ) {
          var valueType = $.type( arg[ key ] )
          
          var _seq = {
            key: key,
            target: obj.target,
            durations:obj.durations
          }
          
          if( valueType === 'array' || typeof arg.length === 'number' ) {
            _seq.values = arg[ key ]
          }else if( valueType !== 'undefined' ) {
            _seq.values = [ arg[ key ] ]
          }
                    
          obj.seqs.push( _seq )
          keyList.push( key )
        }
      }
      
      if( 'scale' in obj ) {
        var noteIndex = keyList.indexOf( 'note' ),
            chordIndex = keyList.indexOf( 'chord' )
            
            //  var makeNoteFunction = function( notes, obj ) {

        if( noteIndex > -1 ) {
          obj.seqs[ noteIndex ].values = makeNoteFunction( obj.seqs[ noteIndex ].values, obj )
        }
        
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
            if( key === 'note' && _seq.scale ) {
              v = makeNoteFunction( v, _seq )
            }
            _seq.seqs[ _i ].values = v  
          }
        })
      })(seq)
    }
    
    var _durations = null
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
    
    return seq
  }
  
  $.extend( Gibberish.PolySeq.prototype, {
    constructor: Seq,
    replaceWith: function( replacement ) { this.kill() },
    kill: function() { 
      if( this.target && this.target.sequencers )
        this.target.sequencers.splice( this.target.sequencers.indexOf( this ), 1 )
      
      this.stop().disconnect()
    },
    applyScale : function() {
      for( var i = 0; i < this.seqs.length; i++ ) {
        var s = this.seqs[ i ]
        if( s.key === 'note' || s.key === 'frequency' ) {
          s.values = makeNoteFunction( s.values, this )
        }
      }
    },
    once : function() {
      this.repeat( 1 )
      return this
    },
    reset : function() {
      if( Object.keys( this.save ).length !== 0 ) {
        for( var key in this.save ) {
          var val = this.save[ key ]
          for( var i = 0; i < this.seqs.length; i++ ) {
            if( this.seqs[ i ].key === key ) {
              if( Array.isArray( val ) ) {
                this.seqs[ i ].values = this.save[ key ].slice(0)
              }else{
                this.seqs[ i ].values = this.save[ key ]
              }
              break;
            }
          }
        }
      }
    },
    shuffle : function() { // original Gibberish.PolySeq.shuffle is deleted in constructor after being saved
      if( Object.keys( this.save ).length === 0 ) {
        for( var i = 0; i < this.seqs.length; i++ ) {
          var val = this.seqs[ i ].values
          if( Array.isArray( val ) ) {
            this.save[ this.seqs[ i ].key ] = val.slice(0)
          }else{
            this.save[ this.seqs[ i ].key ] = val
          }
        }
      }
      
      var args = Array.prototype.slice.call( arguments, 0 )
        
      this.oldShuffle.apply( this, args )
    },
  })
  
  var ScaleSeq = function() {
    var args = arguments[0],
        scale
    
    args.root = args.root || 'c4'
    args.mode = args.mode || 'aeolian'
    
    console.log( args )
    scale = Gibber.Theory.Scale( args.root, args.mode )
    
    delete args.root; delete args.mode
    
    args.scale = scale
    
    return Seq( args )
  }
  
  var Seqs = { 'Seq': Seq, 'ScaleSeq':ScaleSeq }

  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Seqs }
  
}()