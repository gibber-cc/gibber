(function() {
//"use strict" 
// can't use strict because eval is used to evaluate user code in the run method
// I should wrap this in a Function call instead...
var $ = require( './dollar' )

var Gibber = {
  Presets: {},
  GraphicsLib: {},
  Binops: {},
  scale : null,
  minNoteFrequency:50,
  started:false,
  
  export: function( target ) {
    Gibber.Utilities.export( target )
    
    if( Gibber.Audio ) {
      Gibber.Audio.export( target )
    }
    
    if( Gibber.Graphics ) {
      Gibber.Graphics.export( target )
    }
  },
  
  init: function( _options ) {                        
      if( typeof window === 'undefined' ) { // check for node.js
        window = GLOBAL // is this a good idea? makes a global window available in all files required in node
        document = GLOBAL.document = false
      }else if( typeof GLOBAL !== 'undefined' ) { // I can't remember why I put this in there...
        if( !GLOBAL.document ) document = GLOBAL.document = false
      }
      
      var options = {
        globalize: true,
        canvas: null,
        target: window,
        graphicsMode:'3d'
      }
      
      if( typeof _options === 'object' ) $.extend( options, _options )
      
      if( Gibber.Audio ) {
        Gibber.Audio.init() 
      
        if( options.globalize ) {
          options.target.Master = Gibber.Audio.Master    
        }else{
          $.extend( Gibber, Gibber.Audio )
        }
      }
      
      if( Gibber.Graphics ) {
        Gibber.Graphics.init( options.graphicsMode )
      }
      
      if( options.globalize ) {
        Gibber.export( options.target )
      }
      
      options.target.$ = $ // TODO: geez louise
            
      Gibber.Utilities.init()
      
      // Gibber.isInstrument = true
  },
  // interfaceIsReady : function() {
  //   if( !Gibber.started ) {
  //     if( typeof Gibber.Audio.context.currentTime !== 'undefined' ) {
  //       Gibber.started = true
  //       if( Gibber.isInstrument ) eval( loadFile.text )
  //     }
  //   }
  // },
  Modules : {},
 	import : function( path, exportTo ) {
    var _done = null;
    console.log( 'Loading module ' + path + '...' )

    if( path.indexOf( 'http:' ) === -1 ) { 
      console.log( 'loading via post', path )
      $.post(
        Gibber.Environment.SERVER_URL + '/gibber/'+path, {},
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
      var script = document.createElement( 'script' )
      script.src = path
      
      script.onload = function () {
        console.log( 'Module ' + path + ' is now loaded.' )
        if( _done !== null ) { _done() }
      };

      document.head.appendChild( script )
    }
    return { done: function( fcn ) { _done =  fcn } }
 	},  
  
  // log: function( msg ) { 
  //   //console.log( "LOG", typeof msg )
  //   if( typeof msg !== 'undefined' ) {
  //     if( typeof msg !== 'function') {
  //       console.log( msg )
  //     }else{
  //       console.log( 'Function' )
  //     }
  //   }
  // },
  
  scriptCallbacks: [],
  
  run: function( script, pos, cm ) { // called by Gibber.Environment.Keymap.modes.javascript
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
        if( typeof result !== 'function' ) {
          log( result )
        }else{
          log( 'Function' )
        }
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
  
  clear : function() {
    if( Gibber.Audio ) Gibber.Audio.clear();
    
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
    var min = typeof target.min === 'function' ? target.min() : target.min,
        max = typeof target.max === 'function' ? target.max() : target.max,
        _min = typeof from.min === 'function' ? from.min() : from.min,
        _max = typeof from.max === 'function' ? from.max() : from.max
        
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
    
    console.log( target.timescale, fromTimescale )
    
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
    
    target.object[ target.Name ].mappingObjects = []
    
    Gibber.createProxyProperty( target.object[ target.Name ], 'min', 1, 0, {
      'min':min, 'max':max, output: target.output,
      timescale: target.timescale,
      dimensions:1
    })
    
    Gibber.createProxyProperty( target.object[ target.Name ], 'max', 1, 0, {
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
    
    if( typeof target.object.mappings === 'undefined' ) target.object.mappings = []
    
    target.object.mappings.push( mapping )
    
    Gibber.defineSequencedProperty( target.object[ target.Name ], 'invert' )
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
      obj.seq = Gibber.Audio.Seqs.Seq({ doNotStart:true, scale:obj.scale, priority:priority })
    }
    
    fnc.seq = function( v,d ) {  

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
      
      if( args.durations === null ) { obj.seq.autofire.push( seq ) }
      
      Object.defineProperties( fnc.seq, {
        values: {
          configurable:true,
          get: function() { return obj.seq.seqs[ seqNumber ].values },
          set: function(v) {
            if( !Array.isArray(v) ) {
              v = [ v ]
            }
            if( key === 'note' && obj.seq.scale ) {  
              v = makeNoteFunction( v, obj.seq )
            }
            obj.seq.seqs[ seqNumber ].values = v //.splice( 0, 10000, v )
            //Gibber.defineSequencedProperty( obj.seq.seqs[ seqNumber ].values, 'reverse' )
          }
        },
        durations: {
          configurable:true,
          get: function() { return obj.seq.seqs[ seqNumber ].durations },
          set: function(v) {
            if( !Array.isArray(v) ) {
              v = [ v ]
            }
            obj.seq.seqs[ seqNumber ].durations = v   //.splice( 0, 10000, v )
            //Gibber.defineSequencedProperty( obj.seq.seqs[ seqNumber ].durations, 'reverse' )  
          }
        },
      })
      
      //Gibber.defineSequencedProperty( obj.seq.seqs[ seqNumber ].values, 'reverse' )
      //Gibber.defineSequencedProperty( obj.seq.seqs[ seqNumber ].durations, 'reverse' )      
      
      if( !obj.seq.isRunning ) {
        obj.seq.offset = Gibber.Clock.time( obj.offset )
        obj.seq.start( true, priority )
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
      obj.seq = Gibber.Audio.Seqs.Seq({ doNotStart:true, scale:obj.scale })      
    }
    
    obj.mappingProperties = mappingProperties
    obj.mappingObjects = []
    
    for( var key in mappingProperties ) {
      if( ! mappingProperties[ key ].doNotProxy ) {
        Gibber.createProxyProperty( obj, key, shouldSeq, shouldRamp )
      }
    }
  },  
}

Gibber.Utilities = require( './utilities' )( Gibber )
Gibber.Audio = require( './audio' )( Gibber )
Gibber.mappings = require( './mappings' )( Gibber, Gibber.Audio.Core )
//Gibber.Graphics = require( './graphics/graphics' )( Gibber )

module.exports = Gibber

})()