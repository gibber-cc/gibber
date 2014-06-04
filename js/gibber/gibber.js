(function() {
//"use strict" // can't use strict because eval is used to evaluate user code in the run method 

// TODO: get rid of window object here
window.Gibber = window.G = {
  Presets: {},
  
  LOGARITHMIC : 1,
  LINEAR : 0,
  
  scale : null,
  minNoteFrequency:50,
  
  init: function() { 
    $script([ 
      'external/teoria.min',
      'gibber/clock',
      'gibber/seq',
      'gibber/audio/fx',      
    ], function() { 
      
      $.extend( window, Gibber.FX ) // must do before loading synths due to presets
      
      $script([
      'gibber/audio/theory',
      'gibber/audio/oscillators',
      'gibber/audio/synths',
      'gibber/audio/bus', 
      'gibber/audio/analysis',
      'gibber/audio/envelopes',       			     
      'gibber/audio/drums',
      'gibber/utilities',
      'external/esprima',
			], 'gibber', function() {
  
      Gibber.Audio = Gibberish
      
      $.extend( window, Gibber.Busses )       
      $.extend( window, Gibber.Oscillators )
      $.extend( window, Gibber.Synths )
      $.extend( window, Gibber.Percussion )      
      $.extend( window, Gibber.Envelopes )
      
      Gibber.Audio.init()
      Gibber.Audio.Time.export()
      window.sec = window.seconds
      Gibber.Audio.Binops.export()
      
			Gibber.Esprima = window.esprima
      Gibber.Master = window.Master = Bus().connect( Gibberish.out )
      Master.type = 'Bus'
      $.extend( true, Master, Gibber.ugen ) 
      Master.fx.ugen = Master
      
      Gibber.scale = Scale( 'c4','Minor' )
      
      Gibber.isInstrument = window.isInstrument // TODO: better way to do this without global?
      //Gibber.createMappingAbstractions( Master, Gibber.Busses.mappingProperties )
      
      // override so that all ugens connect to Gibber's Master bus by default
      Gibber.Audio.ugen.connect = 
        Gibber.Audio._oscillator.connect =
        Gibber.Audio._synth.connect =
        Gibber.Audio._effect.connect =
        Gibber.Audio._bus.connect =
        Gibber.connect;
        
      Gibber.Audio.defineUgenProperty = Gibber.defineUgenProperty
      
      $script.ready('environment', function() {
        Gibber.Clock.start( true )
        if( !window.isInstrument ) {
          Gibber.Clock.addMetronome( Gibber.Environment.Metronome )
        }
				window.Clock = Gibber.Clock
      })
      
      window.Seq = Gibber.Seq
      
      window.ScaleSeq = Gibber.ScaleSeq
      window.Rndi = Gibberish.Rndi
      window.Rndf = Gibberish.Rndf      
      window.rndi = Gibberish.rndi
      window.rndf = Gibberish.rndf
			
			window.module = Gibber.import
      
    }) })
   },
   interfaceIsReady : function() {
     if( Gibber.isInstrument ) eval( loadFile.text )
   },
  Modules : {},
 	import : function( path, exportTo ) {
    var _done = null;
    console.log( 'Loading module ' + path + '...' )

    if( path.indexOf( 'http:' ) === -1 ) { 
      console.log( 'loading via post ', path )
      $.post(
        'http://gibber.mat.ucsb.edu/gibber/'+path, {},
        function( d ) {
          d = JSON.parse( d )
          eval( d.text )

          if( exportTo && Gibber.Modules[ path ] ) {
            $.extend( exportTo, Gibber.Modules[ path ] )
            Gibber.Modules[ path ] = exportTo
          }  
          if( Gibber.Modules[ path ] ) {
            if( Gibber.Modules[ path ].init ) {
              Gibber.Modules[ path ].init()
            }
            console.log( 'Module ' + path + ' is now loaded.' )
          }else{
            console.log( 'Publication ' + path + ' is loaded. It may not be a valid module.')
          }
          
          if( _done !== null ) { _done( Gibber.Modules[ path ] ) }

          return false;
        }
      )
    }else{
      $script.get( path, function() { 
        // can't be guaranteed a that a module will be created... 
        console.log( 'Module ' + path + ' is now loaded.' )
        if( _done !== null ) { _done() }
      })
    }
    return {  done: function( fcn ) { _done =  fcn } }
 	},  
  // override for gibberish method
  defineUgenProperty : function(key, initValue, obj) {
    var isTimeProp = Gibber.Clock.timeProperties.indexOf(key) > -1,
        prop = obj.properties[key] = {
          value:  isTimeProp ? Gibber.Clock.time( initValue ) : initValue,
          binops: [],
          parent : obj,
          name : key,
        },
        mappingName = key.charAt(0).toUpperCase() + key.slice(1);
    
    Object.defineProperty(obj, key, {
      configurable: true,
      get: function() { return prop.value },
      set: function(val) { 
        if( obj[ mappingName ] && obj[ mappingName ].mapping ) {
          if( obj[ mappingName ].mapping.remove )
            obj[ mappingName ].mapping.remove( true ) // pass true to avoid setting property inside of remove method
        }

        prop.value = isTimeProp ? Gibber.Clock.time( val ) : val
        
        Gibberish.dirty(obj);
      },
    });

    obj[key] = prop.value
  },
  
  // override for gibberish method
  polyInit : function(ugen) {
    ugen.mod = ugen.polyMod;
    ugen.removeMod = ugen.removePolyMod;
    
    for( var key in ugen.polyProperties ) {
      (function( _key ) {
        var value = ugen.polyProperties[ _key ],
            isTimeProp = Gibber.Clock.timeProperties.indexOf( _key ) > -1

        Object.defineProperty(ugen, _key, {
          get : function() { return value; },
          set : function( val ) { 
            for( var i = 0; i < ugen.children.length; i++ ) {
              ugen.children[ i ][ _key ] = isTimeProp ? Gibber.Clock.time( val ) : val;
            }
          },
        });
        
      })( key );
    }
  },
  
  // override for gibberish method to use master bus
  connect : function( bus, position ) {
    if( typeof bus === 'undefined' ) bus = Gibber.Master
    
    if( this.destinations.indexOf( bus ) === -1 ){
      bus.addConnection( this, 1, position )
      if( position !== 0 ) {
        this.destinations.push( bus )
      }
    }
    
    return this
  },

  log: function( msg ) { console.log( msg ) },
  
  scriptCallbacks: [],
  
  run: function( script, pos, cm ) { // called by Gibber.Environment.modes.javascript
		var _start = pos.start ? pos.start.line : pos.line,
				tree
    
	  try{
			tree = Gibber.Esprima.parse(script, { loc:true, range:true} )
		}catch(e) {
			console.error( "Parse error on line " + ( _start + e.lineNumber ) + " : " + e.message.split(':')[1] )
			return
		}
    
    // must wrap i with underscores to avoid confusion in the eval statement with commands that use proxy i
    for( var __i__ = 0; __i__ < tree.body.length; __i__++ ) {
      var obj = tree.body[ __i__ ],
					start = { line:_start + obj.loc.start.line - 1, ch: obj.loc.start.column },
					end   = { line:_start + obj.loc.end.line - 1, ch: obj.loc.end.column },
				  src   = cm.getRange( start, end ),
          result = null
			
			//console.log( start, end, src )
			try{
				result = eval( src )
        log( result )
			}catch( e ) {
				console.error( "Error evaluating expression beginning on line " + (start.line + 1) + '\n' + e.message )
			}
      
      if( this.scriptCallbacks.length > 0 ) {
        for( var ___i___ = 0; ___i___ < this.scriptCallbacks.length; ___i___++ ) {
          this.scriptCallbacks[ ___i___ ]( obj, cm, pos, start, end, src, _start )
        }
      }
    }
  },
  
  processArguments: function(args, type) {    
    var obj
    
    if( args.length ) {
      if( typeof args[0] === 'string' && type !== 'Drums' && type !== 'XOX' ) {
        obj = Gibber.getPreset( args[0], type )
        
        if( typeof args[1] == 'object' ) {
          $.extend( obj, args[ 1 ] )
        }
        return obj
      }
      return Array.prototype.slice.call(args, 0)
    }
    
    return obj
  },
  
  processArguments2 : function(obj, args, type) {
    if( args.length ) {
      var firstArg = args[ 0 ]
    
      if( typeof firstArg === 'string' && type !== 'Drums' && type !== 'XOX' && type !== 'Shader' ) {
        preset = Gibber.getPreset( args[0], type )
      
        if( typeof args[1] === 'object' ) {
          $.extend( preset, args[ 1 ] )
        }
      
        $.extend( obj, preset )
        
        if( obj.presetInit ) obj.presetInit() 
      }else if( $.isPlainObject( firstArg ) && typeof firstArg.type === 'undefined' ) {
        $.extend( obj, firstArg )
      }else{
        var keys = Object.keys( obj.properties )
                
        if( obj.type === 'FX' ) {
          for( var i = 0; i < args.length; i++ ) { obj[ keys[ i + 1 ] ] = args[ i ] }
        }else{
          for( var i = 0; i < args.length; i++ ) { obj[ keys[ i ] ] = args[ i ] }
        }
        
      }
    }      
  },
    
  getPreset: function( presetName, ugenType ) {
    var obj = {}
    
    if( Gibber.Presets[ ugenType ] ) {
      if( Gibber.Presets[ ugenType ][ presetName ] ) {
        obj = Gibber.Presets[ ugenType ][ presetName ]
      }else{
        Gibber.log( ugenType + ' does not have a preset named ' + presetName + '.' )
      }
    }else{
      Gibber.log( ugenType + ' does not have a preset named ' + presetName + '.' )
    }
    
    return obj
  },
  
  stopAudio: function() {    
    Gibberish.analysisUgens.length = 0
    Gibberish.sequencers.length = 0
    
    for( var i = 0; i < Gibber.Master.inputs.length; i++ ) {
      Gibber.Master.inputs[ i ].value.disconnect()
    }
    
    Gibber.Master.inputs.length = 0
    
    Gibber.Clock.reset()

    console.log( 'Audio stopped.')
  },
  
  clear : function() {
    this.stopAudio();
    
    if( Gibber.Graphics ) Gibber.Graphics.clear()

    Gibber.proxy( window )
		
    $.publish( '/gibber/clear', {} )
    
    console.log( 'Gibber has been cleared.' )
  },
  
  proxy: function( target ) {
		var letters = "abcdefghijklmnopqrstuvwxyz"
    
		for(var l = 0; l < letters.length; l++) {
			var lt = letters.charAt(l);
      if( typeof window[ lt ] !== 'undefined' ) { 
        delete window[ lt ] 
        delete window[ '___' + lt ]
      }

      (function() {
				var ltr = lt;
      
				Object.defineProperty( target, ltr, {
          configurable: true,
					get:function() { return target[ '___'+ltr] },
					set:function( newObj ) {
            if( newObj ) {
              if( target[ '___'+ltr ] ) { 
                if( typeof target[ '___'+ltr ].replaceWith === 'function' ) {
                  target[ '___'+ltr ].replaceWith( newObj )
                  console.log( target[ '___'+ltr ].name + ' was replaced with ' + newObj.name )
                }
              }
              target[ '___'+ltr ] = newObj
            }else{
						  if( target[ '___'+ltr ] ) {
						  	 var variable = target[ '___'+ltr ]
						  	 if( variable ) {
						  		 if( typeof variable.kill === 'function' /*&& target[ '___'+ltr ].destinations.length > 0 */) {
						  			 variable.kill();
						  		 }
						  	 }
						  }
            }
          }
        });
      })();     
    }
  },

  construct: function( constructor, args ) {
    function F() {
      return constructor.apply( this, args );
    }
    F.prototype = constructor.prototype;
    return new F();
  },
  
  createMappingObject : function(target, from) {
    var min = target.min, max = target.max, _min = from.min, _max = from.max, mapping

    if( typeof from.object === 'undefined' && from.Value) { // if using an interface object directly to map
      from = from.Value
    }
    
    if( typeof target.object[ target.Name ].mapping !== 'undefined') {
      target.object[ target.Name ].mapping.replace( from.object, from.name, from.Name )
      return
    }
    
    if( typeof from.targets !== 'undefined' ) {
      if( from.targets.indexOf( target ) === -1 ) from.targets.push( [target, target.Name] )
    }
    
    var fromTimescale = from.Name !== 'Out' ? from.timescale : 'audioOut' // check for audio Out, which is a faux property
    
    mapping = Gibber.mappings[ target.timescale ][ fromTimescale ]( target, from )
    
    target.object[ target.name ].toString = function() { return '> continuous mapping: ' + from.name + ' -> ' + target.name }
    
    Object.defineProperties( target.object[ target.Name ], {
      'min' : {
        configurable:true,
        get : function() { return min },
        set : function(v) { min = v;  target.object[ target.Name ].mapping.outputMin = min }
      },
      'max' : {
        configurable:true,
        get : function() { return max },
        set : function(v) { max = v; target.object[ target.Name ].mapping.outputMax = max }
      },
    })
    
    target.object[target.Name].mappingObjects = []
    
    Gibber.createProxyProperty( target.object[target.Name], 'min', 1, 0, {
      'min':min, 'max':max, output: target.output,
      timescale: target.timescale,
      dimensions:1
    })
    
    Gibber.createProxyProperty( target.object[target.Name], 'max', 1, 0, {
      'min':min, 'max':max, output: target.output,
      timescale: target.timescale,
      dimensions:1
    })
    
    Object.defineProperties( from.object[ from.Name ], {
      'min' : {
        configurable:true,
        get : function() { return _min },
        set : function(v) { _min = v; target.object[ target.Name ].mapping.inputMin = _min }
      },
      'max' : {
        configurable:true,
        get : function() { return _max },
        set : function(v) { _max = v; target.object[ target.Name ].mapping.inputMax = _max }
      },
    })
    
    target.object[ target.Name ].invert = function() {
      target.object[ target.Name ].mapping.invert()
    }
    
    Gibber.defineSequencedProperty( target.object[ target.Name ].mapping, 'invert' )
    
  },
  
  defineSequencedProperty : function( obj, key, priority ) {
    var fnc = obj[ key ], seq, seqNumber
    
    // for( var i = obj.seq.seqs.length - 1; i >= 0; i-- ) {
    //   var s = obj.seq.seqs[ i ]
    //   if( s.key === key ) {
    //     seq = s,
    //     seqNumber = i
    //     break;
    //   }
    // }
    
    if( !obj.seq ) {
      obj.seq = Gibber.Seq({ doNotStart:true, scale:obj.scale, priority:priority })
    }
    
    fnc.seq = function( v,d ) {
      if( typeof d === 'undefined' ) { // for sequencing functions with no arguments
        d = v
        v = null
      }
      
      var args = {
        key: key,
        values: $.isArray(v) || v !== null && typeof v !== 'function' && typeof v.length === 'number' ? v : [v],
        durations: $.isArray(d) ? d : typeof d !== 'undefined' ? [d] : null,
        target: obj,
        'priority': priority
      }
            
      if( typeof seq !== 'undefined' ) {
        seq.shouldStop = true
        obj.seq.seqs.splice( seqNumber, 1 )
      }
      
      obj.seq.add( args )
      
      seqNumber = obj.seq.seqs.length - 1
      seq = obj.seq.seqs[ seqNumber ]
      
      if( args.durations === null ) {
        obj.seq.autofire.push( seq )
      }
      
      if( !obj.seq.isRunning ) { 
        obj.seq.start( false, priority )
      }
      return obj
    }
    
    fnc.seq.stop = function() { seq.shouldStop = true } 
    
    // TODO: property specific stop/start/shuffle etc. for polyseq
    fnc.seq.start = function() {
      seq.shouldStop = false
      obj.seq.timeline[0] = [ seq ]                
      obj.seq.nextTime = 0
      
      if( !obj.seq.isRunning ) { 
        obj.seq.start( false, priority )
      }
    }
  },
  
  defineRampedProperty : function( obj, _key ) {
    var fnc = obj[ _key ], key = _key.slice(1), cancel
    
    fnc.ramp = function( from, to, length ) {
      if( arguments.length < 2 ) {
        console.err( 'ramp requires at least two arguments: target and time.' )
        return
      }
      
      if( typeof length === 'undefined' ) { // if only to and length arguments
        length = to
        to = from
        from = obj[ key ]()
      }
      
      if( cancel ) cancel()
      
      if( typeof from !== 'object' ) {
        obj[ key ] = Line( from, to, length )
      }else{
        from.retrigger( to, Gibber.Clock.time( length ) )
      }
      
      cancel = future( function() {
        obj[ key ] = to
      }, length )
      
      return obj
    }
  },
  
  createProxyMethods : function( obj, methods ) {
    for( var i = 0; i < methods.length; i++ ) Gibber.defineSequencedProperty( obj, methods[ i ] ) 
  },
  
  createProxyProperty: function( obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority ) {
    var propertyName = _key,
        useMappings = _useMappings === false ? false : true,
        propertyDict = useMappings ? dict || obj.mappingProperties[ propertyName ] : null,
        __n = propertyName.charAt(0).toUpperCase() + propertyName.slice(1),
        mapping, fnc
        
    mapping = $.extend( {}, propertyDict, {
      Name  : __n,
      name  : propertyName,
      type  : 'mapping',
      value : obj[ propertyName ],
      object: obj,
      targets: [],
			oldSetter: obj.__lookupSetter__( propertyName ),
			oldGetter: obj.__lookupGetter__( propertyName ),
      oldMappingGetter: obj.__lookupGetter__( __n ),
      oldMappingSetter: obj.__lookupSetter__( __n ),          
    })
    
    if( ! obj.mappingObjects ) obj.mappingObjects = []
    // voodoo to make method act like property
    obj.mappingObjects.push( mapping )
    
    var __propertyName = useMappings ? '_' + propertyName : propertyName
    
    fnc = obj[ '_' + propertyName ] = ( function() {
      var _fnc = function(v) {
        if( typeof v !== 'undefined' ) {
          mapping.value = v
          
          if( mapping.oldSetter ) { mapping.oldSetter( mapping.value ) }
          return obj
        }
        return mapping.value
      }
      return _fnc
    })()    

    fnc.valueOf = function() { return mapping.value }
    mapping.toString = function() { return '> continuous mapping: ' + mapping.name  }
    
    if( useMappings ) {
      Object.defineProperty( obj, propertyName, {
        configurable: true,
        get: function() { return obj[ '_' + propertyName ] },
        set: function(v) { 
          if( typeof v === 'object' && v.type === 'mapping' ) {
            Gibber.createMappingObject( mapping, v )
          }else{
            if( typeof obj[ mapping.Name ].mapping !== 'undefined' ) { 
              //if( obj[ mapping.Name ].mapping.op ) obj[ mapping.Name ].mapping.op.remove()
              if( obj[ mapping.Name ].mapping.remove )
                obj[ mapping.Name ].mapping.remove( true )
            }

            obj[ '_' + propertyName ]( v ) 
          }
          return obj
        }
      })
    }else{
      ( function() { 
        var __fnc = fnc
        Object.defineProperty( obj, propertyName, {
          configurable: true,
          get: function() { return obj['_'+propertyName] },
          set: function(v) { 
            obj['_'+propertyName]( v )
            return obj
          }
        })
      })()
    }
    
    if( shouldSeq )
      Gibber.defineSequencedProperty( obj, __propertyName, priority )
    
    if( shouldRamp )
      Gibber.defineRampedProperty( obj, __propertyName )
    
    // capital letter mapping sugar
    if( useMappings ) {
      Object.defineProperty( obj, mapping.Name, {
        configurable: true,
        get : function()  {
          if( typeof mapping.oldMappingGetter === 'function' ) mapping.oldMappingGetter()
          return mapping 
        },
        set : function( v ) {
          obj[ mapping.Name ] = v
          if( typeof mapping.oldMappingSetter === 'function' ) mapping.oldMappingSetter( v )
        }
      })
    }
  },
  
  // obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority
  createProxyProperties : function( obj, mappingProperties, noSeq, noRamp ) {
    var shouldSeq = typeof noSeq === 'undefined' ? true : noSeq,
        shouldRamp = typeof noRamp === 'undefined' ? true : noRamp
    
    obj.gibber = true // keyword identifying gibber object, needed for notation parser
    
    if( !obj.seq && shouldSeq ) {
      obj.seq = Gibber.Seq({ doNotStart:true, scale:obj.scale })      
    }
    
    obj.mappingProperties = mappingProperties
    obj.mappingObjects = []
    
    for( var key in mappingProperties ) {
      if( ! mappingProperties[ key ].doNotProxy ) {
        Gibber.createProxyProperty( obj, key, shouldSeq, shouldRamp )
      }
    }
  },  
  
  object: {
    class: null,
    text : null,
    init: function( classIdentifier ) {
      this.class = classIdentifier
      this.text = $( '.' + classIdentifier )
    },
  },
  
  ugen: {
    sequencers : [],
    fx: $.extend( [], {
      add: function() {
        var end = this.length === 0 ? this.ugen : this[ this.length - 1 ]
        
        end.disconnect()
        
        for( var i = 0; i < arguments.length; i++ ) {
          var fx = arguments[ i ]
          fx.input = end
          
          end = fx
          
          this.push( fx )
        }
        
        if( this.ugen !== Master ) {
          end.connect()
        }else{
          end.connect( Gibberish.out )
        }
                
        return this.ugen
      },
      
      remove: function() {
        if( arguments.length > 0 ) {
          for( var i = 0; i < arguments.length; i++ ) {
            var arg = arguments[ i ];
						
						if( typeof arg === 'string' ) { // if identified using the fx name
							for( var j = 0; j < this.length; j++ ) {
								if( this[ j ].name === arg ) {
									this.remove( j )
								}
							}
							continue;
						}
						
            if( typeof arg === 'number' ) { // if identified via position in fx chain
							var ugenToRemove = this[ arg ]
							ugenToRemove.disconnect()
              this.splice( arg, 1 )
							
              if( typeof this[ arg ] !== 'undefined') {
								
								// reset input for current position in chain
								var newConnectionNumber = arg - 1
								if( newConnectionNumber !== -1 ) {
									this[ arg ].input = this[ newConnectionNumber ]
								}else{
									this[ arg ].input = this.ugen
								}
								
								// reset input for next position in chain, or connect to Master bus
                if( typeof this[ arg + 1 ] !== 'undefined' ) { // if there is another fx ahead in chain...
                  this[ arg + 1 ].input = arg === 0 ? this.ugen : this[ arg ]
                }else{
                  if( this.ugen !== Master ) {
                    this.ugen.connect( Gibber.Master )
                  }else{
                    this.ugen.connect( Gibberish.out )
                  }
                }
              }else{
                if( this.length > 0 ) { // if there is an fx behind in chain
                  this[ arg - 1 ].connect( Gibber.Master )
                }else{
                  if( this.ugen !== Master ) {
                    this.ugen.connect( Gibber.Master ) // no more fx
                  }else{
                    this.ugen.connect( Gibberish.out )
                  }
                }
              }
            }
          }
        }else{ // remove all fx
          if( this.length > 0) {
            this[ this.length - 1 ].disconnect()
            if( this.ugen !== Master ) {
              this.ugen.connect( Gibber.Master )
            }else{
              this.ugen.connect( Gibberish.out )
            }
            this.ugen.codegen()
            this.length = 0
          }else{
            Gibber.log( this.ugen.name + ' does not have any fx to remove. ')
          }
        }
      },
    }),
    
    replaceWith: function( replacement ) {
      for( var i = 0; i < this.destinations.length; i++ ) {
        replacement.connect( this.destinations[i] )
      }
      
      for( var i = 0; i < this.sequencers.length; i++ ) {
        this.sequencers[ i ].target = replacement
        replacement.sequencers.push( this.sequencers[i] )
      }
      
      for( var i = 0; i < this.mappingObjects.length; i++ ) {
        var mapping = this.mappingObjects[ i ]

        if( mapping.targets.length > 0 ) {
          for( var j = 0; j < mapping.targets.length; j++ ) {
            var _mapping = mapping.targets[ j ]
            
            if( replacement.mappingProperties[ mapping.name ] ) {
              _mapping[ 0 ].mapping.replace( replacement, mapping.name, mapping.Name )
            }else{ // replacement object does not have property that was assigned to mapping
              _mapping[ 0 ].mapping.remove()
            }
          }
        }
      }
  
      this.kill()
    },

    kill: function() { 
      var end = this.fx.length !== 0 ? this.fx[ this.fx.length - 1 ] : this
      if( this.seq.isRunning ) this.seq.disconnect()
      end.disconnect()
      
      for( var i = 0; i < this.fx.length; i++ ) {
        var fx = this.fx[ i ]
        if( fx.seq.isRunning ) fx.seq.disconnect()
      }
      
      this.disconnect()
      
      if( this.clearMarks ) // check required for modulators
        this.clearMarks()
      
      console.log( this.name + " has been terminated.")
    },

    play: function( notes, durations, repeat ) {
      if( this.note ) {
        this.note.seq( notes, durations )
      }else if( this.frequency ) {
        this.frequency.seq( notes, durations )
      }
      
      return this
    },

    // stop : function() {
    //   if( this.seq ) this.seq.stop()
    // },
    // start : function() {
    //   if( this.seq ) this.seq.start()
    // },
    
    fadeIn : function( _time, endLevel ) {
      if( isNaN( endLevel ) ) {
        endLevel = 1
      }

      var time = Gibber.Clock.time( _time ),
          line = new Gibberish.Line( 0, endLevel, Gibber.Clock.time( time ) )
          
      this.amp = line
      
      future( function() { this.amp = endLevel }.bind( this ), time)
      
      return this
    },
    
    fadeOut : function( _time ) {
      var time = Gibber.Clock.time( _time ),
          line = new Gibberish.Line( this.amp(), 0, Gibber.Clock.time( time ) )
          
      this.amp = line
      
      future( function() { this.amp = 0 }.bind( this ), time )
      
      return this
    },
  }
}

})()
