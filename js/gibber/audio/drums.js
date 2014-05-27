(function() {
  "use strict"
  
  Gibber.Percussion = {}
  
  var types = [
    'Kick',
    'Snare',
    'Hat',
    'Conga',
    'Cowbell',
    'Clave',
    'Tom',
  ],
  _mappingProperties = {
    Drums: {
      pitch: { min: .25, max: 4, output: Gibber.LINEAR,     timescale: 'audio' },
      amp:   { min: 0,   max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',},
      pan:   { min: 0,   max: 1, output: Gibber.LINEAR,timescale: 'audio',},
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    XOX: {
      //pitch: { min: .25, max: 4, output: Gibber.LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',},
      pan:   { min: 0,   max: 1, output: Gibber.LINEAR,timescale: 'audio',},
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },      
    },
    Kick    : { 
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    Snare   : { 
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC, timescale: 'audio' },
      snappy: { min: .25, max: 1.5, output: Gibber.LOGARITHMIC, timescale: 'audio' },
      tune: { min: 0, max: 2, output: Gibber.LOGARITHMIC, timescale: 'audio' },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },    
    },
    Hat     : { 
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    Conga   : { 
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    Cowbell : { 
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',},
    },
    Clave   : { 
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',}, },
    Tom     : { 
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',}, 
    },
  }

  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Gibber.Percussion[ name ] = function() {
        var args = Array.prototype.slice.call(arguments),
            obj
        
        if( typeof args[0] === 'object' && typeof args[0].maxVoices === 'undefined') { 
          args[0].maxVoices = 1
        }else if( typeof args[0] === 'undefined') {
          args[0] = { maxVoices:1 }
        }
        
        obj = Gibber.processArguments( args, name )
      
        if( Array.isArray( obj ) ) {
          obj = Gibber.construct( Gibberish[ type ], obj ).connect( Gibber.Master )
        }else{
          obj =  new Gibberish[ type ]( obj ).connect( Gibber.Master )
        }
      
        obj.type = 'Gen'
        
        $.extend( true, obj, Gibber.ugen )
        
        obj.fx.ugen = obj
        
        // override note method to allow note names
        obj._note = obj.note.bind(obj)
        obj.note = function() {
          var args = Array.prototype.splice.call( arguments, 0 )

          if( typeof args[0] === 'string' ) {
            args[0] = Gibber.Theory.Teoria.note( args[0] ).fq()
          }
          
          this._note.apply( this, args )
        }
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] )
        Gibber.createProxyMethods( obj, [ 'note' ] )
                
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })

        return obj
      }
    })()
  
  }
  
  function Drums (_sequence, _timeValue, _amp, _freq){    
    var args = Array.prototype.slice.call(arguments),
        obj = {}, 
        props = Gibber.processArguments( args, 'Drums' )
        
    $.extend( true, obj, props)
  
    if( Array.isArray( obj ) ) {
      obj = Gibber.construct( Gibberish.Bus2, obj ).connect( Gibber.Master )
    }else{
      obj =  new Gibberish.Bus2( obj ).connect( Gibber.Master )
    }
    
		obj.name = 'Drums'
    obj.type = 'Gen'
    obj.children = []
    
    $.extend( true, obj, Gibber.ugen )
    
    obj.fx.ugen = obj
  
    Object.defineProperty(obj, '_', { get: function() { obj.disconnect(); return obj }, set: function() {} })
		
  	obj.kit = Drums.kits['default'];
    
  	if(typeof arguments[0] === "object") {
  		if(arguments[0].kit) {
  			obj.kit = Drums.kits[arguments[0].kit];
  			arguments[0].kit = obj.kit;
  		}
  	}
	
  	for(var key in obj.kit) {
  		var drum = obj.kit[key];
  		obj[key] = { sampler: new Gibberish.Sampler({ file:drum.file, pitch:1, amp:drum.amp }), pitch:drum.pitch, amp:drum.amp }
  		obj[key].sampler.pan = drum.pan
  		obj[key].sampler.connect( obj )
  		obj[key].fx = obj[key].sampler.fx
  		obj.children.push( obj[key].sampler )
  	}
	
    obj.mod = obj.polyMod
    obj.removeMod = obj.removePolyMod
	
  	obj.connect();
    
    Gibber.createProxyProperties( obj, _mappingProperties[ 'Drums' ] )    
    
  	obj.pitch(1);
    
    if( typeof props !== 'undefined') {
      switch( $.type( props[0] ) ) {
        case 'string':
          var notes = props[0], _seqs = [], _durations = [], __durations = [], seqs = notes.split('|'), timeline = {}
          
          for( var i = 0; i < seqs.length; i++ ) {
            var seq = seqs[i], duration, hasTime = false, idx = seq.indexOf(',')

            if( idx > -1 ) {
              var _value = seq.substr( 0, idx ),
                  duration = seq.substr( idx + 1 )
              
              duration = eval(duration)
              hasTime = true
              seq = _value.trim().split('')
            }else{
              seq = seq.trim().split('')
              duration = 1 / seq.length  
            }
            
            if( seq.indexOf('.rnd(') > -1) {// || seq.indexOf('.random(') > -1 ) {
              seq = seq.split( '.rnd' )[0]
              seq = seq.split('').rnd()
            }
            
            if( typeof props[1] !== 'undefined') { duration = props[1] }
            
            obj.seq.add({
              key:'note',
              values:seq,
              durations:duration,
              target:obj
            })
          }

          break;
        case 'object':
      		if( typeof props[0].note === 'string' ) props[0].note = props[0].note.split("")
      		props[0].target = obj
          props[0].durations = props[0].durations ? Gibber.Clock.Time( props[0].durations ) : Gibber.Clock.Time( 1 / props[0].note.length )
          props[0].offset = props[0].offset ? Gibber.Clock.time( props[0].offset ) : 0
      	  //obj.seq = Seq( props[0] );
          
          break;
        default:
          break;
      }
    }

  	if( typeof props === "undefined" ) props = {};
	
  	if( props.pitch ) obj.pitch = props.pitch;
	
  	if( typeof props.snare !== "undefined" ) 	{ $.extend( obj.snare.sampler, props.snare ); $.extend( obj.snare, props.snare); }
  	if( typeof props.kick !== "undefined" ) 	{ $.extend( obj.kick.sampler, props.kick ); $.extend( obj.kick, props.kick); }
  	if( typeof props.hat !== "undefined" ) 	{ $.extend( obj.hat.sampler, props.hat ); $.extend( obj.hat, props.hat); }
  	if( typeof props.openHat !== "undefined" ) { $.extend( obj.openHat.sampler, props.openHat ); $.extend( obj.openHat, props.openHat); }
 	
  	obj.amp   = isNaN(_amp) ? 1 : _amp;
	
  	if( obj.seq && obj.seq.tick ) { Gibberish.future( obj.seq.tick, 1 ) }
    
    obj.note = function(nt) {
      var p = typeof obj.pitch === 'function' ? obj.pitch() : obj.pitch
      if( $.isArray( nt ) ) {
        for( var i = 0; i < nt.length; i++ ) {
          var note = nt[ i ]

      		for(var key in this.kit) {
      			if(note === this.kit[key].symbol) {
      				this[ key ].sampler.note( 1, this[key].amp );
              var p = this.pitch() 
              if( this[ key ].sampler.pitch !== p )
                this[ key ].sampler.pitch = p
      				break;
      			}
      		}
        }
      }else{
    		for(var key in this.kit) {
    			if(nt === this.kit[key].symbol) {
    				this[ key ].sampler.note( 1, this[key].amp );
            var p = this.pitch() 
            if( this[ key ].sampler.pitch !== p )
              this[ key ].sampler.pitch = p
    				break;
    			}
    		}
      }
  	}
    
    obj.start = function() { obj.seq.start() }
    obj.stop = function() { obj.seq.stop() }
    obj.shuffle = function() { obj.seq.shuffle() }
    obj.reset = function() { obj.seq.reset() }

    Gibber.createProxyMethods( obj, [ 'play','stop','shuffle','reset','start' ] )
            
    obj.seq.start()

    obj.kill = function() {
      var end = this.fx.length !== 0 ? this.fx[ this.fx.length - 1 ] : this
      end.disconnect()
           
      obj.seq.kill()
    }

    Object.defineProperties( obj, {
      offset: {
        get: function() { return obj.seq.offset },
        set: function(v) { obj.seq.offset = Gibber.Clock.time(v)}
      }
    })
        
    obj.toString = function() { return '> Drums : ' + obj.seq.seqs[0].values.join('') }
    return obj
  }
  
  function EDrums (_sequence, _timeValue, _amp, _freq){    
    var args = Array.prototype.slice.call(arguments),
        obj = {}, 
        props = Gibber.processArguments( args, 'Drums' )
        
    $.extend( true, obj, props)
  
    if( Array.isArray( obj ) ) {
      obj = Gibber.construct( Gibberish.Bus2, obj ).connect( Gibber.Master )
    }else{
      obj =  new Gibberish.Bus2( obj ).connect( Gibber.Master )
    }
    
    obj.name = 'XOX'
    obj.type = 'Gen'
    obj.children = []
    
    $.extend( true, obj, Gibber.ugen )
    
    obj.fx.ugen = obj
  
    Object.defineProperty(obj, '_', { get: function() { obj.kill(); return obj }, set: function() {} })
		
  	obj.pitch = 1;
  	/*obj.kit = Drums.kits['default'];
    
  	if(typeof arguments[0] === "object") {
  		if(arguments[0].kit) {
  			obj.kit = Drums.kits[arguments[0].kit];
  			arguments[0].kit = obj.kit;
  		}
  	}*/
	  
    // connect in note method
    obj.kick = Gibber.Percussion.Kick().disconnect()//new Gibberish.Kick()//.connect( obj )
    obj.snare = Gibber.Percussion.Snare().disconnect()//new Gibberish.Snare()//.connect( obj )
    obj.hat = Gibber.Percussion.Hat().disconnect()//new Gibberish.Hat()//.connect( obj )
    
    obj.kick.connect( obj )
    obj.snare.connect( obj )
    obj.hat.connect( obj )
    
    obj.children.push( obj.kick, obj.snare, obj.hat )
	
    obj.mod = obj.polyMod
    obj.removeMod = obj.removePolyMod

    obj.set = function( v ) { obj.seq.note = v.split('') }
    
    Gibber.createProxyProperties( obj, _mappingProperties[ 'XOX' ] )
    
    obj.start = function() { obj.seq.start() }
    obj.stop = function() { obj.seq.stop() }
    obj.shuffle = function() { obj.seq.shuffle() }
    obj.reset = function() { obj.seq.reset() }

    Gibber.createProxyMethods( obj, [ 'play','stop','shuffle','reset','start' ] )

    if( typeof props !== 'undefined') {
      switch( $.type( props[0] ) ) {
        case 'string':
          var notes = props[0], _seqs = [], _durations = [], __durations = [], seqs = notes.split('|'), timeline = {}
          
          console.log(seqs)
          for( var i = 0; i < seqs.length; i++ ) {
            var seq = seqs[i], duration, hasTime = false, idx = seq.indexOf(',')

            if( idx > -1 ) {
              var _value = seq.substr( 0, idx ),
                  duration = seq.substr( idx + 1 )
              
              duration = eval(duration)
              hasTime = true
              seq = _value.trim().split('')
            }else{
              seq = seq.trim().split('')
              duration = 1 / seq.length  
            }
            
            if( seq.indexOf('.rnd(') > -1) {// || seq.indexOf('.random(') > -1 ) {
              seq = seq.split( '.rnd' )[0]
              seq = seq.split('').rnd()
            }else if( seq.indexOf('.random(') > -1 ) {
              seq = seq.split( '.random' )[0]
              seq = seq.split('').rnd()
            }
            
            if( typeof props[1] !== 'undefined') { duration = props[1] }
            
            obj.seq.add({
              key:'note',
              values:seq,
              durations:duration,
              target:obj
            })
          }  
          
          break;
        case 'object':
      		if( typeof props[0].note === 'string' ) props[0].note = props[0].note.split("")
      		props[0].target = obj
          props[0].durations = props[0].durations ? Gibber.Clock.Time( props[0].durations ) : Gibber.Clock.Time( 1 / props[0].note.length )
          props[0].offset = props[0].offset ? Gibber.Clock.time( props[0].offset ) : 0
      	  obj.seq = Seq( props[0] );
          
          break;
        default:
          break;
      }
    }

  	if( typeof props === "undefined" ) props = {};
	
  	if( props.pitch ) obj.pitch = props.pitch;
	
  	if( typeof props.snare !== "undefined" ) 	{ $.extend( obj.snare.sampler, props.snare ); $.extend( obj.snare, props.snare); }
  	if( typeof props.kick !== "undefined" ) 	{ $.extend( obj.kick.sampler, props.kick ); $.extend( obj.kick, props.kick); }
  	if( typeof props.hat !== "undefined" ) 	{ $.extend( obj.hat.sampler, props.hat ); $.extend( obj.hat, props.hat); }
  	if( typeof props.openHat !== "undefined" ) { $.extend( obj.openHat.sampler, props.openHat ); $.extend( obj.openHat, props.openHat); }
 	
  	obj.amp   = isNaN(_amp) ? 1 : _amp;
	
  	if( obj.seq.tick ) { Gibberish.future( obj.seq.tick,1 ) }

    var kcd = 1,
        scd = 1,
        hcd = 1,
        kf = null,
        sf = null,
        hf = null;
        
    obj.note = function(nt) {
      switch(nt) {
        case 'x': 
          if(kcd === 1) {
            //obj.kick.connect( obj ); 
            kcd = 0;
          }
          
          obj.kick.note();
          
          if( kf !== null ) {
            kf()
            kf = null
          }

          kf = future( function() {
              //obj.kick.disconnect()
              kcd = 1
              kf = null
          }, obj.kick.decay * 110000 ) 
          
          break;
          
        case 'o': 
          if(scd === 1) {
            //obj.snare.connect( obj ); 
            scd = 0;
          }
        
          obj.snare.note();
        
          if( sf !== null ) {
            sf()
            sf = null
          }

          sf = future( function() {
              //obj.snare.disconnect()
              scd = 1
              sf = null
          }, obj.snare.decay ) 
        
          break;
        case '*': 
          if(hcd === 1) {
            //obj.hat.connect( obj ); 
            hcd = 0;
          }
      
          obj.hat.note( 5000 );
      
          if( hf !== null ) {
            hf()
            hf = null
          }

          hf = future( function() {
              //obj.hat.disconnect()
              hcd = 1
              hf = null
          }, 5500 ) 
      
          break;

        case '-': 
          if(hcd === 1) {
            //obj.hat.connect( obj ); 
            hcd = 0;
          }
    
          obj.hat.note( 30000 );
    
          if( hf !== null ) {
            hf()
            hf = null
          }

          hf = future( function() {
              //obj.hat.disconnect()
              hcd = 1
              hf = null
          }, 30500 ) 
    
          break;
      }
  	}
    
    //Gibber.createProxyMethods( obj, [ 'play','stop','shuffle','reset' ] )

    obj.kill = function() {
      var end = this.fx.length !== 0 ? this.fx[ this.fx.length - 1 ] : this
      end.disconnect()
           
      obj.seq.kill()
    }
     
    obj.seq.start()
    
    obj.toString = function() { return '> EDrums : ' + obj.seq.seqs[0].values.join('') }
    
    return obj
  }
  
  Drums.kits = {
  	original: {
  		kick:     { file:"resources/audiofiles/kick.wav",   symbol:'x', amp:1, pitch:1, pan:0 	},
  		snare:    { file:"resources/audiofiles/snare.wav", 	symbol:'o', amp:1, pitch:1, pan:.15 },
  		hat:      { file:"resources/audiofiles/hat.wav",    symbol:'*', amp:1, pitch:1, pan:-.1 },
  		openHat:  { file:"resources/audiofiles/openHat.wav",symbol:'-', amp:1, pitch:1, pan:-.2 },
  	},
  	electronic: {
  		kick:     { file:"resources/audiofiles/electronic/kick.wav",    symbol:'x', amp:1.5, pitch:1, pan:0 },
  		snare:    { file:"resources/audiofiles/electronic/snare.wav",   symbol:'o', amp:1.5, pitch:1, pan:.15 },
  		hat:      { file:"resources/audiofiles/electronic/hat.wav",     symbol:'*', amp:1.5, pitch:1, pan:-.1 },
  		openHat:  { file:"resources/audiofiles/electronic/openhat.wav", symbol:'-', amp:1.5, pitch:1, pan:-.2 },
  	},
  	beatbox: {
  	    in_tss: { file:'resources/audiofiles/beatbox/^tss.wav' , symbol:'T', amp:1, pitch:1, pan: 0.1 },
  	    f:      { file:'resources/audiofiles/beatbox/f.wav'    , symbol:'f', amp:1, pitch:1, pan:-0.1 },
  	    h:      { file:'resources/audiofiles/beatbox/h.wav'    , symbol:'h', amp:1, pitch:1, pan: 0.1 },
  	    s:      { file:'resources/audiofiles/beatbox/s.wav'    , symbol:'s', amp:1, pitch:1, pan:-0.1 },

  	    d:      { file:'resources/audiofiles/beatbox/d.wav'    , symbol:'d', amp:1, pitch:1, pan: 0.8 },
  	    t:      { file:'resources/audiofiles/beatbox/t.wav'    , symbol:'t', amp:1, pitch:1, pan: 0.4 },
  	    k:      { file:'resources/audiofiles/beatbox/k.wav'    , symbol:'k', amp:1, pitch:1, pan:-0.1 },
  	    in_k:   { file:'resources/audiofiles/beatbox/^k.wav'   , symbol:'K', amp:1, pitch:1, pan:-0.4 },
  	    eight:  { file:'resources/audiofiles/beatbox/8.wav'    , symbol:'8', amp:1, pitch:1, pan:-0.8 },

  	    psh:    { file:'resources/audiofiles/beatbox/psh.wav'  , symbol:'p', amp:1, pitch:1, pan: 0.1 },
  	    in_p:   { file:'resources/audiofiles/beatbox/^p.wav'   , symbol:'P', amp:1, pitch:1, pan:-0.1 },
  	    pf:     { file:'resources/audiofiles/beatbox/pf.wav'   , symbol:'F', amp:1, pitch:1, pan: 0.2 },
  	    phs:    { file:'resources/audiofiles/beatbox/phs.wav'  , symbol:'H', amp:1, pitch:1, pan:-0.2 },

  	    b:      { file:'resources/audiofiles/beatbox/b.wav'    , symbol:'b', amp:1, pitch:1, pan: 0.3 },
  	    dot:    { file:'resources/audiofiles/beatbox/dot.wav'  , symbol:'.', amp:1, pitch:1, pan: 0.0 },
  	    duf:    { file:'resources/audiofiles/beatbox/duf.wav'  , symbol:'D', amp:1, pitch:1, pan:-0.3 },

  	    o:      { file:'resources/audiofiles/beatbox/o.wav'    , symbol:'o', amp:1, pitch:1, pan: 0.6 },
  	    a:      { file:'resources/audiofiles/beatbox/a.wav'    , symbol:'a', amp:1, pitch:1, pan: 0.8 },
  	    u:      { file:'resources/audiofiles/beatbox/u.wav'    , symbol:'u', amp:1, pitch:1, pan:-0.8 },

  	    m:      { file:'resources/audiofiles/beatbox/m.wav'    , symbol:'m', amp:1, pitch:1, pan:-0.6 },
  	    n:      { file:'resources/audiofiles/beatbox/n.wav'    , symbol:'n', amp:1, pitch:1, pan: 0.0 },
  	},
  };
  Drums.kits.default = Drums.kits.electronic;
  
  //Gibber.presets.Drums = {}

  Gibber.Drums = window.Drums = Drums
  Gibber.EDrums = window.XOX = window.EDrums = EDrums
})()
