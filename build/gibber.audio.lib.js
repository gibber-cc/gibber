!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Gibber=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
!function() {

"use strict"

var hasZepto = typeof Zepto === 'function',
    hasJQuery = typeof jQuery === 'function',
    has$ = typeof global.$ === 'object' || typeof global.$ === 'function',
    $ = null,
    hasConflict = hasZepto || hasJQuery || has$,
    isArray = Array.isArray,
    isObject = function( obj ) { return typeof obj === 'object' },
    isPlainObject = function( obj ) {
      return isObject(obj) && Object.getPrototypeOf( obj ) == Object.prototype
    }

if( !hasConflict ) {
  $ = {}
}else if( hasJQuery ) {
  $ = jQuery 
}else if( hasZepto ) {
  $ = Zepto
}else if( has$ ){
  $ = global.$
}else{
  $ = {}
}

// taken from Zepto: zeptojs.com
function extend(target, source, deep) {
  for (var key in source)
    if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
      if (isPlainObject(source[key]) && !isPlainObject(target[key]))
        target[key] = {}
      if (isArray(source[key]) && !isArray(target[key]))
        target[key] = []
      extend(target[key], source[key], deep)
    }
    else if (source[key] !== undefined) target[key] = source[key]
}

if( !hasConflict ) {
  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function( target ){
    var deep, args = Array.prototype.slice.call(arguments, 1)

    if (typeof target === 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }
  
  $.isArray = Array.isArray 
  $.isPlainObject = isPlainObject

  $.type = function( val ) {
    return typeof val
  }
}

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
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(_dereq_,module,exports){
(function() {
//"use strict" 
// can't use strict because eval is used to evaluate user code in the run method
// I should wrap this in a Function call instead...
var $ = _dereq_( './dollar' )

var Gibber = {
  dollar: $,
  Presets: {},
  GraphicsLib: {},
  Binops: {},
  scale : null,
  minNoteFrequency:50,
  started:false,
  outputCurves : {
    LINEAR:0,
    LOGARITHMIC:1
  },
  
  export: function( target ) {
    Gibber.Utilities.export( target )
    
    if( Gibber.Audio ) {
      Gibber.Audio.export( target )
    }
    
    if( Gibber.Graphics ) {
      Gibber.Graphics.export( target )
    }
    
    if( Gibber.Interface ) {
      Gibber.Interface.export( target )
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
        // this happens dynamically when a graphics object is first created to save CPU
        // Gibber.Graphics.init( options.graphicsMode ) 
      }
      
      if( Gibber.Interface ) {}
      
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
                    
          var f = new Function( "return " + d.text )
          
          Gibber.Modules[ path ] = f()
          
          if( exportTo && Gibber.Modules[ path ] ) {
            $.extend( exportTo, Gibber.Modules[ path ] )
            //Gibber.Modules[ path ] = exportTo
          }
          if( Gibber.Modules[ path ] ) {
            if( typeof Gibber.Modules[ path ].init === 'function' ) {
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
    
    // console.log( "MAPPING", from, target )
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
    
    //console.log( target.timescale, fromTimescale )
    
    mapping = Gibber.mappings[ target.timescale ][ fromTimescale ]( target, from )
    
    //target.object[ target.name ].toString = function() { return '> continuous mapping: ' + from.name + ' -> ' + target.name }
    
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
    
    if( typeof from.object.mappings === 'undefined' ) from.object.mappings = []
    
    from.object.mappings.push( mapping )
    
    Gibber.defineSequencedProperty( target.object[ target.Name ], 'invert' )
    
    return mapping
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
    
    if( !obj.seq && Gibber.Audio ) {
      obj.seq = Gibber.Audio.Seqs.Seq({ doNotStart:true, scale:obj.scale, priority:priority, target:obj })
    }
    
    fnc.seq = function( v,d ) {  

      var args = {
            'key': key,
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
  
  defineProperty : function( obj, propertyName, shouldSeq, shouldRamp, mappingsDictionary, shouldUseMappings, priority, useOldGetter ) {
    var originalValue = typeof obj[ propertyName ] === 'object' ? obj[ propertyName ].valueOf() : obj[ propertyName ],
        Name = propertyName.charAt( 0 ).toUpperCase() + propertyName.slice( 1 ),
        property = function( v ) {
          var returnValue = property
          
          if( v ) { 
            obj[ propertyName ] = v
            returnValue = obj
          }
          
          return returnValue
        }

    // TODO: get rid of this line
    mappingsDictionary = shouldUseMappings ? mappingsDictionary || obj.mappingProperties[ propertyName ] : null
    
    $.extend( property, mappingsDictionary )
    
    $.extend( property, {
      'propertyName': propertyName, // can't redfine 'name' on a function, unless we eval or something...
      'Name':   Name,  
      value:    originalValue,
      type:     'property',
      object:   obj,
      targets:  [],
      valueOf:  function() { return property.value },
      toString: function() { return property.value.toString() },
      oldSetter: obj.__lookupSetter__( propertyName ),
      oldGetter: obj.__lookupGetter__( propertyName ),      
      oldMappingObjectGetter: obj.__lookupGetter__( Name ),
      oldMappingObjectSetter: obj.__lookupSetter__( Name )
    })
    
    Object.defineProperty( obj, propertyName, {
      configurable:true,
      get: function(){ 
        // var returnValue = property
        // if( useOldGetter ) {
        //   console.log( property.oldGetter )
        //   returnValue = property.oldGetter()
        // }
        // else if( property.oldMappingObjectGetter ) {
        //   return property.oldMappingObjectGetter()
        // }
        // return returnValue || property
        return property
      },
      set: function( v ){
        if( (typeof v === 'function' || typeof v === 'object' && v.type === 'mapping') && ( v.type === 'property' || v.type === 'mapping' ) ) {
          //console.log( "CREATING MAPPING", property )
          Gibber.createMappingObject( property, v )
        }else{
          if( shouldUseMappings && obj[ property.Name ] ) {
            if( typeof obj[ property.Name ].mapping !== 'undefined' ) { 
              if( obj[ property.Name ].mapping.remove ) obj[ property.Name ].mapping.remove( true )
            }
          }
          
          var newValue = v
        
          if( property.oldSetter ) {
            var setterResult = property.oldSetter.call( obj, v )
            if( typeof setterResult !== 'undefined' ) { newValue = setterResult }
          }
          
          property.value = newValue
        }
        
        return obj
      }
    })
    
    if( shouldSeq  ) Gibber.defineSequencedProperty( obj, propertyName, priority )
    if( shouldRamp ) Gibber.defineRampedProperty( obj, propertyName )
    
    // capital letter mapping sugar
    if( shouldUseMappings ) {
      Object.defineProperty( obj, property.Name, {
        configurable: true,
        get : function()  {
          if( typeof property.oldMappingObjectGetter === 'function' ) property.oldMappingObjectGetter()
          return property
        },
        set : function( v ) {
          obj[ property.Name ] = v
          if( typeof mapping.oldMappingObjectSetter === 'function' ) mapping.oldMappingObjectSetter( v )
        }
      })
    }
  },
  
  createProxyProperty: function( obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority ) {
    _useMappings = _useMappings === false ? false : true
    
    Gibber.defineProperty( obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority )
  },
  
  // obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority
  createProxyProperties : function( obj, mappingProperties, noSeq, noRamp ) {
    var shouldSeq = typeof noSeq === 'undefined' ? true : noSeq,
        shouldRamp = typeof noRamp === 'undefined' ? true : noRamp
    
    obj.gibber = true // keyword identifying gibber object, needed for notation parser    
    
    obj.mappingProperties = mappingProperties
    obj.mappingObjects = []
    
    for( var key in mappingProperties ) {
      if( ! mappingProperties[ key ].doNotProxy ) {
        Gibber.createProxyProperty( obj, key, shouldSeq, shouldRamp, mappingProperties[ key ] )
      }
    }
  },  
}

Gibber.Utilities = _dereq_( './utilities' )( Gibber )
// Gibber.Audio     = require( 'gibber.audio.lib/scripts/gibber/audio' )( Gibber )
// Gibber.Graphics  = require( 'gibber.graphics.lib/scripts/gibber/graphics/graphics' )( Gibber )
// Gibber.Interface = require( 'gibber.interface.lib/scripts/gibber/interface/interface' )( Gibber )
Gibber.mappings  = _dereq_( './mappings' )( Gibber )

module.exports = Gibber

})()
},{"./dollar":1,"./mappings":3,"./utilities":4}],3:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {  
  var mappings = {
    audio : {
      graphics: function( target, from ) {
				if( typeof from.object.track === 'undefined' ) from.object.track = {}
				
        var proxy = typeof from.object.track[ from.propertyName ] !== 'undefined' ? from.object.track[ from.propertyName ] : new Gibber.Audio.Core.Proxy2( from.object, from.propertyName ),
            op    = new Gibber.Audio.Core.OnePole({ a0:.005, b1:.995 }),
            mapping
        
        from.object.track = proxy;

        mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( proxy, target.min, target.max, from.min, from.max, target.output, from.wrap ) 
        
        op.input = mapping
        
        target.object[ target.propertyName ] = op
        
        mapping.proxy = proxy
        mapping.op = op
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.propertyName ] = target.object[ target.Name ].mapping.getValue()
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      interface: function( target, from ) {
        // TODO: why does the proxy track from.name instead of from.propertyName? maybe because interface elements don't get passed to mapping init?
        var proxy = typeof from.track !== 'undefined' ? from.track : new Gibber.Audio.Core.Proxy2( from.object, from.name ),
            op    = new Gibber.Audio.Core.OnePole({ a0:.005, b1:.995 }),
            range = target.max - target.min,
            percent = ( target.object[ target.propertyName ] - target.min ) / range,
            widgetValue = from.min + ( ( from.max - from.min ) * percent ),
            mapping
                
        if( from.object.setValue ) from.object.setValue( widgetValue )
        
        from.track = proxy
        
        mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( proxy, target.min, target.max, from.min, from.max, target.output, from.wrap ) 
        
        op.input = mapping
        target.object[ target.propertyName ] = op
        
        mapping.proxy = proxy
        mapping.op = op

        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) target.object[ target.propertyName ] = mapping.getValue()
          
          //if( mapping.op ) mapping.op.remove()
          
          delete mapping
        }
        
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.name + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
                
        mapping.replace = function( replacementObject, key, Key  ) {
          proxy.setInput( replacementObject )
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var proxy, mapping
        
        if( typeof from.object.track !== 'undefined' ) {
          proxy = from.object.track
          proxy.count++
        } else {
          proxy = new Gibber.Audio.Core.Proxy2( from.object, from.propertyName )
          proxy.count = 1
        }
        from.object.track = proxy
        
        target.object[ target.propertyName ] = Gibber.Audio.Core.Binops.Map( proxy, target.min, target.max, from.min, from.max )
        
        mapping = target.object[ target.Name ].mapping = target.object[ target.propertyName ] // must call getter function explicitly
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.propertyName ] = mapping.getValue()
          }
          
          if( mapping.op ) mapping.op.remove()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key ) {
          var proxy = new Gibber.Audio.Core.Proxy2( replacementObject, key )
          mapping.input = proxy
          if( replacementObject[ Key ].targets && replacementObject[ Key ].targets.indexOf( target ) === -1 ) {
            replacementObject[ Key ].targets.push( [target, target.Name] )
          }
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        var mapping
        
        mapping = Gibber.Audio.Core.Binops.Map( null, target.min, target.max, 0, 1, 0 )
        
        target.object[ target.propertyName ] = target.object[ target.Name ].mapping = mapping
        
        if( typeof from.object.track !== 'undefined' ) {
          mapping.follow = from.object.track
          mapping.follow.count++
        } else {
          mapping.follow = new Gibber.Audio.Analysis.Follow({ input:from.object, useAbsoluteValue: true })
          mapping.follow.count = 1
        }
        
        from.object.track = mapping.input = mapping.follow
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.propertyName ] = target.object[ target.Name ].mapping.getValue()
          }
          
          if( mapping.bus )
            mapping.bus.disconnect()
          
          if( mapping.follow ) {
            mapping.follow.count--
            if( mapping.follow.count === 0) {
              delete from.object.track
              mapping.follow.remove()
            }
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) {
          mapping.follow.input = replacementObject   
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
        }
      
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          configurable:true,
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
                
        return mapping
      }
    },
    graphics: {
      graphics: function( target, from ) {
        // rewrite getValue function of Map object to call Map callback and then return appropriate value
        var map = Gibber.Audio.Core.Binops.Map( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            old = map.getValue.bind( map ),
            mapping
        
        map.getValue = function() {
          //console.log( from.propertyName, from, target.min, target.max, from.min, from.max )
          map.callback( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          return old()
        }
        
        mapping = target.object[ target.Name ].mapping = map
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          target.object.mod( target.propertyName, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          if( target.object.mod ) {
            target.object.removeMod( target.propertyName )
          }else{
            target.modObject.removeMod( target.modName )
          }
          target.object[ target.propertyName ] = target.object[ target.Name ].mapping.getValue()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) { mapping.input = replacementObject }
        
        return mapping
      },
      interface: function( target, from ) {
        // console.log( "FROM", from.propertyName, target.min, target.max, from.min, from.max )
        var _map = Gibber.Audio.Core.Binops.Map( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            mapping
            
        if( typeof from.object.functions === 'undefined' ) {
          from.object.functions = {}
          from.object.onvaluechange = function() {
            for( var key in from.object.functions ) {
              from.object.functions[ key ]()
            }
          }
        }

        mapping = target.object[ target.Name ].mapping = _map

        target.mapping.from = from
        
        var fcn_name = target.propertyName + ' <- ' + from.object.propertyName + '.' + from.Name

        from.object.functions[ fcn_name ] = function() {
          var val = mapping.callback( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          // target.object[ target.Name ].value = val
          // console.log( target.Name )
          target.object[ target.Name ].oldSetter.call( target.object[ target.Name ], val )
        }
        // from.object.onvaluechange = function() {          
        //   var val = map.callback( this[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap )
        //   target.object[ target.propertyName ] = val
        // }
        mapping.replace = function() {
          // var old = from.functions[ target.Name ]
        } 
        
        mapping.remove  = function() {
          console.log( "mapping removed" )
          delete from.object.functions[ fcn_name ]
        } 
        
        if( from.object.setValue ) 
          from.object.setValue( target.object[ target.propertyName ] )
        
        // if( typeof from.object.label !== 'undefined' ) {
        //   from.object.label = target.object.propertyName + '.' + target.Name
        // }
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.propertyName + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var mapping
        
        mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( null, target.min, target.max, from.min, from.max, target.output, from.wrap )
      
        mapping.follow = typeof from.object.track !== 'undefined' ? from.object.track : new Gibber.Audio.Core.Follow({ input:from.object[ from.propertyName ], useAbsoluteValue: false })
        
        from.object.track = target.object[ target.Name ].mapping.follow
        // assign input after Map ugen is created so that follow can be assigned to the mapping object
        mapping.input = mapping.follow
      
        mapping.bus = new Gibber.Audio.Core.Bus2({ amp:0 }).connect()

        mapping.connect( mapping.bus )
        
        mapping.replace = function( replacementObject, key, Key ) {
          mapping.follow.input = replacementObject            
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          //console.log( target.object, target.object.mod )
          target.object.mod( target.propertyName, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }

          if( target.object.mod ) {
            target.object.removeMod( target.propertyName )
          }else{
            target.modObject.removeMod( target.modName )
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        if( typeof target.object[ target.Name ].mapping === 'undefined') {
          var mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( null, target.min, target.max, 0, 1, 0 )   
          if( typeof from.object.track !== 'undefined' ) {
            mapping.follow = from.object.track
            mapping.follow.count++
          } else {
            mapping.follow = new Gibber.Audio.Core.Follow({ input:from.object })
            mapping.follow.count = 1
          }
          from.object.track = mapping.follow
          
          var env = mapping.follow.bufferSize
          Object.defineProperty( target.object[ target.Name ], 'env', {
            configurable: true,
            get: function() { return env },
            set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
          })
          
          mapping.input = mapping.follow
          mapping.bus = new Gibber.Audio.Core.Bus2({ amp:0 }).connect()
          mapping.connect( mapping.bus )
        
          mapping.replace = function( replacementObject, key, Key  ) {
            // _console.log( key, replacementObject )
            
            // what if new mapping isn't audio type?
            if ( replacementObject[ Key ].timescale === from.timescale ) {
              var idx = mapping.follow.input[ from.Name ].targets.indexOf( target )
              if( idx >= -1 ) {
                mapping.follow.input[ from.Name ].targets.splice( idx, 1 )
              }
            
              mapping.follow.input = replacementObject   
              if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
            }else{
              mapping.bus.disconnect()
              mapping.follow.remove()
              Gibber.createMappingObject( target, replacementObject )
            }
            
          }
        }else{
          console.log("REPLACING MAPPING")
          mapping.replace( from.object, from.propertyName, from.Name )
          return mapping
        }
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties of vectors
          //console.log( target.object, target.object.mod )
          target.object.mod( target.propertyName, mapping, '=' )
        }else if (target.modObject) {
          target.modObject.mod( target.modName, mapping, '=' )
        }else{
          !function() {
            var _mapping = mapping
            target.object.update = function() { 
              target.object[ target.propertyName ]( _mapping.getValue() )
            }
          }()
          //target.object.mod( target.propertyName, mapping, '=' ) 
        }
        
        //target.object[ target.Name ].mapping = mapping
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }

          if( target.object.mod ) {
            target.object.removeMod( target.propertyName )
          }else if( target.modObject ) {
            target.modObject.removeMod( target.modName )
          }else{
            console.log( 'removing update ')
            //target.object.update = function() {}
          }
          
          target.object.mappings.splice( target.object.mappings.indexOf( mapping ), 1 )
          from.object.mappings.splice( from.object.mappings.indexOf( mapping ), 1 ) 
          
          var targets = target.object[ target.Name ].targets,
              idx = targets.indexOf( mappings )
          
          if( idx !== -1 ) {
            targets.splice( idx, 1 )
          }
          
          delete target.object[ target.Name ].mapping
        }
        return mapping
      }
    },
    notation: {
      graphics: function( target, from ) {
        // rewrite getValue function of Map object to call Map callback and then return appropriate value

        var map = Gibber.Audio.Core.Binops.Map( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            old = map.getValue.bind( map ),
            mapping
        
        map.getValue = function() {
          map.callback( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          return old()
        }
        
        mapping = target.object[ target.Name ].mapping = map
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          target.object.mod( target.propertyName, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          if( target.object.mod ) {
            target.object.removeMod( target.propertyName )
          }else{
            target.modObject.removeMod( target.modName )
          }
          target.object[ target.propertyName ] = target.object[ target.Name ].mapping.getValue()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) { mapping.input = replacementObject }
        
        return mapping
      },
      interface: function( target, from ) {
        // console.log( "FROM", from.propertyName, target.min, target.max, from.min, from.max )
        var _map = Gibber.Audio.Core.Binops.Map( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            mapping
            
        if( typeof from.object.functions === 'undefined' ) {
          from.object.functions = {}
          from.object.onvaluechange = function() {
            for( var key in from.object.functions ) {
              from.object.functions[ key ]()
            }
          }
        }

        mapping = target.object[ target.Name ].mapping = _map

        target.mapping.from = from
        
        var fcn_name = target.propertyName + ' <- ' + from.object.propertyName + '.' + from.Name

        from.object.functions[ fcn_name ] = function() {
          var val = mapping.callback( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          // target.object[ target.Name ].value = val
          // console.log( target.Name )
          target.object[ target.Name ].oldSetter.call( target.object[ target.Name ], val )
        }
        // from.object.onvaluechange = function() {          
        //   var val = map.callback( this[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap )
        //   target.object[ target.propertyName ] = val
        // }
        mapping.replace = function() {
          // var old = from.functions[ target.Name ]
        } 
        
        mapping.remove  = function() {
          console.log( "mapping removed" )
          delete from.object.functions[ fcn_name ]
        } 
        
        if( from.object.setValue ) 
          from.object.setValue( target.object[ target.propertyName ] )
        
        // if( typeof from.object.label !== 'undefined' ) {
        //   from.object.label = target.object.propertyName + '.' + target.Name
        // }
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.propertyName + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var mapping
        
        mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( null, target.min, target.max, from.min, from.max, target.output, from.wrap )
  
        if( typeof from.object.track !== 'undefined' && from.object.track.input === from.object.properties[ from.propertyName ] ) {
          mapping.follow = from.object.track
          mapping.follow.count++
        }else{
          mapping.follow = new Gibber.Audio.Core.Follow({ input:from.object.properties[ from.propertyName ], useAbsoluteValue: false })
          mapping.follow.count = 1
        }
        
        from.object.track = target.object[ target.Name ].mapping.follow
        
        // assign input after Map ugen is created so that follow can be assigned to the mapping object
        mapping.input = mapping.follow
      
        mapping.bus = new Gibber.Audio.Core.Bus2({ amp:0 }).connect()

        mapping.connect( mapping.bus )
        
        mapping.replace = function( replacementObject, key, Key ) {
          mapping.follow.input = replacementObject            
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
        
        mapping.update = function() {   
          target.object[ target.propertyName ]( mapping.getValue() )
        }
        mapping.text = target.object

        // let Notation object handle scheduling updates
        Gibber.Environment.Notation.add( mapping )
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }
          
          Gibber.Environment.Notation.remove( mapping )
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        if( typeof target.object[ target.Name ].mapping === 'undefined') {
          var mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( null, target.min, target.max, 0, 1, 0 )
          
          console.log( "MAPPING", from )
          
          if( typeof from.object.track !== 'undefined' && from.object.track.input === from.object.properties[ from.propertyName ] ) {
            mapping.follow = from.object.track
            mapping.follow.count++
          }else{
            mapping.follow = new Gibber.Audio.Core.Follow({ input:from.object, useAbsoluteValue: true })
            mapping.follow.count = 1
          }
          
          from.object.track = mapping.follow
          
          var env = mapping.follow.bufferSize
          Object.defineProperty( target.object[ target.Name ], 'env', {
            configurable:true,
            get: function() { return env },
            set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
          })
          
          mapping.input = mapping.follow
          mapping.bus = new Gibber.Audio.Core.Bus2({ amp:0 }).connect()
          mapping.connect( mapping.bus )
        
          mapping.replace = function( replacementObject, key, Key  ) {
            // _console.log( key, replacementObject )
            
            // what if new mapping isn't audio type?
            if ( replacementObject[ Key ].timescale === from.timescale ) {
              var idx = mapping.follow.input[ from.Name ].targets.indexOf( target )
              if( idx >= -1 ) {
                mapping.follow.input[ from.Name ].targets.splice( idx, 1 )
              }
            
              mapping.follow.input = replacementObject   
              if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
            }else{
              mapping.bus.disconnect()
              mapping.follow.remove()
              Gibber.createMappingObject( target, replacementObject )
            }
            
          }
        }else{
          mapping.replace( from.object, from.propertyName, from.Name )
          return mapping
        }
        
        mapping.update = function() {   
          target.object[ target.propertyName ]( mapping.getValue() )
        }
        mapping.text = target.object

        // let Notation object handle scheduling updates
        Gibber.Environment.Notation.add( mapping )
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }
          
          Gibber.Environment.Notation.remove( mapping )
          
          delete target.object[ target.Name ].mapping
        }
        return mapping
      }
    },
  } 
  
  return mappings
}

module.exports.outputCurves= {
  LINEAR:0,
  LOGARITHMIC:1
}
},{}],4:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {

"use strict"

var soloGroup = [],
    isSoloing = false,
    $ = Gibber.dollar,
    Synths = { Presets: {} },
    Gibberish = Gibber.Audio ? Gibber.Audio.Core : null ,//require( 'gibberish-dsp' ),
    Clock = Gibber.Clock,
    rnd = Math.random,

    Utilities = {
      seq : function() {
        var arg = arguments[0],
            type = typeof arg,
            list = [],
            output = null
    
        if( type === 'object' ) {
          if( Array.isArray( arg ) ) type = 'array'
        }
    
        // switch( type ) {
        //   case 'function':
        //     output = arg
        //     break;
        //   case 'array':
        //     for( var i = 0; i < arg.length; i++ ) {
        //       var elem = arg[ i ]
        //       if( typeof )
        //     }
        //     break;
        //   default: 
        //     output = function() { return arg }
        //     break;
        // }
    
        return output
      },
      random :  function() {
        var dict = {},
            lastChosen = null;
    
        for(var i = 0; i < arguments.length; i+=2) {
          dict[ "" + arguments[i] ] = { repeat: arguments[i+1], count: 0 };
        }

        this.pick = function() {
          var value = 0, index, lastValue;
          if(this[lastChosen]) lastValue = this[lastChosen]

          if(lastChosen !== null && dict[ lastValue ].count++ <= dict[ lastValue ].repeat) {
            index = lastChosen;
            if( dict[ lastValue ].count >= dict[ lastValue ].repeat) {
              dict[ lastValue ].count = 0;
              lastChosen = null;
            };
          }else{
            index = Utilities.rndi(0, this.length - 1);
            value = this[index];
            if( typeof dict[ ""+value ] !== 'undefined' ) {
              dict[ ""+value ].count = 1;
              lastChosen = index;
            }else{
              lastChosen = null;
            }
          }
      
        	return index; // return index, not value as required by secondary notation stuff
        };
    
        return this;
      },
  
      random2 : function() {
        var dict = {},
            lastChosen = null,
            that = this;
    
        for(var i = 0; i < arguments.length; i+=2) {
          dict[ "" + arguments[i] ] = { repeat: arguments[i+1], count: 0 };
        }

        this.pick = function() {
          var value = 0, index, lastValue;
          if(that[lastChosen]) lastValue = that[lastChosen]

          if(lastChosen !== null && dict[ lastValue ].count++ <= dict[ lastValue ].repeat) {
            index = lastChosen;
            if( dict[ lastValue ].count >= dict[ lastValue ].repeat) {
              dict[ lastValue ].count = 0;
              lastChosen = null;
            };
          }else{
            index = Utilities.rndi(0, that.length - 1);
            value = that[index];
            if( typeof dict[ ""+value ] !== 'undefined' ) {
              dict[ ""+value ].count = 1;
              lastChosen = index;
            }else{
              lastChosen = null;
            }
          }
      
        	return that[ index ]; // return index, not value as required by secondary notation stuff
        }
    
        return this.pick
      },
  
      choose: function( length ) {
        var output = null
    
        if( isNaN( length ) ) length = 1
    
        if( length !== 1 ) {
          var arr = []
    
          for( var i = 0; i < length; i++ ) {
            arr[ i ] = this[ Utilities.rndi( 0, this.length - 1 ) ]
          }
      
          output = arr
        }else{
          output = this[ Utilities.rndi( 0, this.length - 1 ) ]
        }
    
      	return output;
      },

      future : function(func, time) { 
        var count = 0
        
        var __seq = Gibber.Audio.Seqs.Seq(
          function() {
            if( count === 1 ) {
              func()
              __seq.stop()
              __seq.disconnect()
            }
            count++
          }, 
          Gibber.Audio.Clock.time( time ) 
        )
    
        return function(){ __seq.stop(); __seq.disconnect(); }
      },
  
      shuffle : function( arr ) {
      	for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
      },
  
      solo : function( ugen ) {
        var args = Array.prototype.slice.call( arguments, 0 );
        if( ugen ) {
          if( isSoloing ) { Utilities.solo(); } // quick toggle on / off
      
          for( var j = 0; j < args.length; j++ ) { // check if user soloed ugen, but fx is actually feeding Master bus
            var arg = args[ j ]
            if( arg.fx.length > 0 ) { 
              args[j] = arg.fx[ arg.fx.length - 1 ] // get last fx in chain
            }
          }
      
          for(var i = 0; i < Master.inputs.length; i++) {
            //console.log( i, Master.inputs[i] )
            var idx = args.indexOf( Master.inputs[i].value ),
                _ugen = Master.inputs[i].value,
                name = _ugen.name
            
            if( idx === -1 ) {
              if( name !== 'polyseq' &&  name !== 'Seq' ) { // TODO: please, please, don't route seqs into master bus...
                Master.inputs[i]._amp = Master.inputs[i].amp
                Master.inputs[i].amp = 0//value = Mul( Master.inputs[i].value, 0 )
                soloGroup.push( Master.inputs[i] );
              }
            }
          }
          isSoloing = true;
        }else{
          for( var i = 0; i < soloGroup.length; i++ ) {
            soloGroup[i].amp = soloGroup[i]._amp
          }
          soloGroup.length = 0
          isSoloing = false;
        } 
      },
      fill : function( length, fnc ) {
        if( isNaN( length ) ) length = 16
        if( typeof fnc !== 'function' ) { fnc = Rndf() }
    
        fnc = fnc.bind( this )
    
        for( var i = 0; i < length; i++ ) {
          this[ i ] = fnc()
        }
    
        return this
      },
      merge : function() {
        var output = []
      	for( var i = 0; i < this.length; i++ ) {
          var arg = this[ i ]
          if( Array.isArray( arg ) ) {
            for( var j = 0; j < arg.length; j++ ) {
      				output.push( arg[ j ] )
            }
          }else{
            output.push( arg )
          }
        }
  
        return output
      },
      weight : function() {
        var weights = Array.prototype.slice.call( arguments, 0 )
        this.pick = function() {
          var returnValue = this[0],
              total = 0,
              _rnd = Utilities.rndf();
  
          for(var i = 0; i < weights.length; i++) {
            total += weights[i];
            if( _rnd < total ) { 
              returnValue = i;
              break;
            }
          }
          return returnValue;
        }
    
      	return this
      },
      gibberArray: function( arr ) {
        
      },
      rndf : function(min, max, number, canRepeat) {
        canRepeat = typeof canRepeat === "undefined" ? true : canRepeat;
      	if(typeof number === "undefined" && typeof min != "object") {
      		if(arguments.length == 1) {
      			max = arguments[0]; min = 0;
      		}else if(arguments.length == 2) {
      			min = arguments[0];
      			max = arguments[1];
      		}else{
      			min = 0;
      			max = 1;
      		}

      		var diff = max - min,
      		    r = Math.random(),
      		    rr = diff * r
	
      		return min + rr;
      	}else{
      		var output = [];
      		var tmp = [];
      		if(typeof number === "undefined") {
      			number = max || min.length;
      		}
		
      		for(var i = 0; i < number; i++) {
      			var num;
      			if(typeof arguments[0] === "object") {
      				num = arguments[0][rndi(0, arguments[0].length - 1)];
      			}else{
      				if(canRepeat) {
      					num = Utilities.rndf(min, max);
      				}else{
                num = Utilities.rndf(min, max);
                while(tmp.indexOf(num) > -1) {
                  num = Utilities.rndf(min, max);
                }
      					tmp.push(num);
      				}
      			}
      			output.push(num);
      		}
      		return output;
      	}
      },
  
      Rndf : function() {
        var _min, _max, quantity, random = Math.random, canRepeat;
    
        if(arguments.length === 0) {
          _min = 0; _max = 1;
        }else if(arguments.length === 1) {
          _max = arguments[0]; _min = 0;
        }else if(arguments.length === 2) {
          _min = arguments[0]; _max = arguments[1];
        }else if(arguments.length === 3) {
          _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
        }else{
          _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
        }    
  
        return function() {
          var value, min, max, range;
    
          min = typeof _min === 'function' ? _min() : _min
          max = typeof _max === 'function' ? _max() : _max
      
          if( typeof quantity === 'undefined') {
            value = Utilities.rndf( min, max )
          }else{
            value = Utilities.rndf( min, max, quantity, canRepeat )
          }
    
          return value;
        }
      },

      rndi : function( min, max, number, canRepeat ) {
        var range;
    
        if(arguments.length === 0) {
          min = 0; max = 1;
        }else if(arguments.length === 1) {
          max = arguments[0]; min = 0;
        }else if( arguments.length === 2 ){
          min = arguments[0]; max = arguments[1];
        }else{
          min = arguments[0]; max = arguments[1]; number = arguments[2]; canRepeat = arguments[3];
        }    
  
        range = max - min
        if( range < number ) canRepeat = true
  
        if( typeof number === 'undefined' ) {
          range = max - min
          return Math.round( min + Math.random() * range );
        }else{
      		var output = [];
      		var tmp = [];
		
      		for(var i = 0; i < number; i++) {
      			var num;
      			if(canRepeat) {
      				num = Utilities.rndi(min, max);
      			}else{
      				num = Utilities.rndi(min, max);
      				while(tmp.indexOf(num) > -1) {
      					num = Utilities.rndi(min, max);
      				}
      				tmp.push(num);
      			}
      			output.push(num);
      		}
      		return output;
        }
      },

      Rndi : function() {
        var _min, _max, quantity, random = Math.random, round = Math.round, canRepeat, range;
    
        if(arguments.length === 0) {
          _min = 0; _max = 1;
        }else if(arguments.length === 1) {
          _max = arguments[0]; _min = 0;
        }else if(arguments.length === 2) {
          _min = arguments[0]; _max = arguments[1];
        }else if(arguments.length === 3) {
          _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
        }else{
          _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
        }  
  
        range = _max - _min
        if( typeof quantity === 'number' && range < quantity ) canRepeat = true
  
        return function() {
          var value, min, max, range;
    
          min = typeof _min === 'function' ? _min() : _min
          max = typeof _max === 'function' ? _max() : _max
    
          if( typeof quantity === 'undefined') {
            value = Utilities.rndi( min, max )
          }else{
            value = Utilities.rndi( min, max, quantity, canRepeat )
          }
    
          return value;
        }
      },
      export : function( target ) {
        target.rndi = Utilities.rndi
        target.rndf = Utilities.rndf
        target.Rndi = Utilities.Rndi
        target.Rndf = Utilities.Rndf
        
        target.future = Utilities.future
        target.solo = Utilities.solo
      },
      init: function() {
        // window.solo = Utilities.solo
        // window.future = Utilities.future // TODO: fix global reference
        Array.prototype.random = Array.prototype.rnd = Utilities.random
        Array.prototype.weight = Utilities.weight
        Array.prototype.fill = Utilities.fill
        Array.prototype.choose = Utilities.choose
        // Array.prototype.Rnd = Utilities.random2
        Array.prototype.merge = Utilities.merge
      }  
    }
  
  return Utilities
}

},{}],5:[function(_dereq_,module,exports){
!function(e,t){"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?module.exports=t():e.Gibberish=t()}(this,function(){function createInput(){console.log("connecting audio input..."),navigator.getUserMedia({audio:!0},function(e){console.log("audio input connected"),Gibberish.mediaStreamSource=Gibberish.context.createMediaStreamSource(e),Gibberish.mediaStreamSource.connect(Gibberish.node),_hasInput=!0},function(){console.log("error opening audio input")})}var Gibberish={memo:{},codeblock:[],analysisCodeblock:[],analysisUgens:[],dirtied:[],id:0,isDirty:!1,out:null,debug:!1,callback:"",audioFiles:{},sequencers:[],callbackArgs:["input"],callbackObjects:[],analysisCallbackArgs:[],analysisCallbackObjects:[],createCallback:function(){this.memo={},this.codeblock.length=0,this.callbackArgs.length=0,this.callbackObjects.length=0,this.analysisCallbackArgs.length=0,this.dirtied.length=0,this.codestring="",this.args=["input"],this.memo={},this.out.codegen();var e=this.codeblock.slice(0);if(this.analysisUgens.length>0){this.analysisCodeblock.length=0;for(var t=0;t<this.analysisUgens.length;t++)this.analysisCallbackArgs.push(this.analysisUgens[t].analysisSymbol)}if(this.args=this.args.concat(this.callbackArgs),this.args=this.args.concat(this.analysisCallbackArgs),this.codestring+=e.join("	"),this.codestring+="\n	",this.analysisUgens.length>0){this.analysisCodeblock.length=0;for(var t=0;t<this.analysisUgens.length;t++)this.codeblock.length=0,this.analysisUgens[t].analysisCodegen();this.codestring+=this.analysisCodeblock.join("\n	"),this.codestring+="\n	"}return this.codestring+="return "+this.out.variable+";\n",this.callbackString=this.codestring,this.debug&&console.log(this.callbackString),[this.args,this.codestring]},audioProcess:function(e){var t,i,s=e.outputBuffer.getChannelData(0),n=e.outputBuffer.getChannelData(1),r=e.inputBuffer.getChannelData(0),a=Gibberish,o=a.callback,h=a.sequencers,u=(Gibberish.out.callback,a.callbackObjects.slice(0));u.unshift(0);for(var c=0,l=e.outputBuffer.length;l>c;c++){for(var b=0;b<h.length;b++)h[b].tick();if(a.isDirty){t=a.createCallback();try{o=a.callback=new Function(t[0],t[1])}catch(e){console.error("ERROR WITH CALLBACK : \n\n",t)}a.isDirty=!1,u=a.callbackObjects.slice(0),u.unshift(0)}u[0]=r[c],i=o.apply(null,u),s[c]=i[0],n[c]=i[1]}},audioProcessFirefox:function(e){var t,i=Gibberish,s=i.callback,n=i.sequencers,r=i.callbackObjects.slice(0);r.unshift(0);for(var a=0,o=e.length;o>a;a+=2){for(var h=0;h<n.length;h++)n[h].tick();if(i.isDirty){t=i.createCallback();try{s=i.callback=new Function(t[0],t[1])}catch(u){console.error("ERROR WITH CALLBACK : \n\n",s)}i.isDirty=!1,r=i.callbackObjects.slice(0),r.unshift(0)}var c=s.apply(null,r);e[a]=c[0],e[a+1]=c[1]}},clear:function(){this.out.inputs.length=0,this.analysisUgens.length=0,this.sequencers.length=0,this.callbackArgs.length=2,this.callbackObjects.length=1,Gibberish.dirty(this.out)},dirty:function(e){if("undefined"!=typeof e){for(var t=!1,i=0;i<this.dirtied.length;i++)this.dirtied[i].variable===e.variable&&(t=!0);t||(this.isDirty=!0,this.dirtied.push(e))}else this.isDirty=!0},generateSymbol:function(e){return e+"_"+this.id++},AudioDataDestination:function(e,t){var i=new Audio;i.mozSetup(2,e);var s,n=0,r=e/2,a=null;setInterval(function(){var e;if(a){if(e=i.mozWriteAudio(a.subarray(s)),n+=e,s+=e,s<a.length)return;a=null}var o=i.mozCurrentSampleOffset(),h=o+r-n;if(h>0){var u=new Float32Array(h);t(u),e=i.mozWriteAudio(u),o=i.mozCurrentSampleOffset(),e<u.length&&(a=u,s=e),n+=e}},100)},init:function(){var e,t,i="undefined"==typeof arguments[0]?1024:arguments[0];return"undefined"!=typeof webkitAudioContext?e=webkitAudioContext:"undefined"!=typeof AudioContext&&(e=AudioContext),t=function(){if("undefined"!=typeof e){if(document&&document.documentElement&&"ontouchstart"in document.documentElement&&(window.removeEventListener("touchstart",t),"ontouchstart"in document.documentElement)){var i=Gibberish.context.createBufferSource();i.connect(Gibberish.context.destination),i.noteOn(0)}}else alert("Your browser does not support javascript audio synthesis. Please download a modern web browser that is not Internet Explorer.");Gibberish.onstart&&Gibberish.onstart()},Gibberish.context=new e,Gibberish.node=Gibberish.context.createScriptProcessor(i,2,2,Gibberish.context.sampleRate),Gibberish.node.onaudioprocess=Gibberish.audioProcess,Gibberish.node.connect(Gibberish.context.destination),Gibberish.out=new Gibberish.Bus2,Gibberish.out.codegen(),Gibberish.dirty(Gibberish.out),document&&document.documentElement&&"ontouchstart"in document.documentElement?window.addEventListener("touchstart",t):t(),this},makePanner:function(){for(var e=[],t=[],i=Math.sqrt(2)/2,s=0;1024>s;s++){var n=-1+s/1024*2;e[s]=i*(Math.cos(n)-Math.sin(n)),t[s]=i*(Math.cos(n)+Math.sin(n))}return function(i,s,n){var r,a,o,h,u,c,l="object"==typeof i,b=l?i[0]:i,p=l?i[1]:i;return r=1023*(s+1)/2,a=0|r,o=r-a,a=1023&a,h=1023===a?0:a+1,u=e[a],c=e[h],n[0]=(u+o*(c-u))*b,u=t[a],c=t[h],n[1]=(u+o*(c-u))*p,n}},defineUgenProperty:function(e,t,i){var s=i.properties[e]={value:t,binops:[],parent:i,name:e};Object.defineProperty(i,e,{configurable:!0,get:function(){return s.value},set:function(e){s.value=e,Gibberish.dirty(i)}})},polyInit:function(e){e.mod=e.polyMod,e.removeMod=e.removePolyMod,e.voicesClear=function(){if(e.children.length>0){for(var t=0;t<e.children.length;t++)e.children[t].disconnect();e.children.length=0,e.voiceCount=0}};for(var t in e.polyProperties)!function(t){var i=e.polyProperties[t];Object.defineProperty(e,t,{configurable:!0,get:function(){return i},set:function(s){i=s;for(var n=0;n<e.children.length;n++)e.children[n][t]=i}})}(t);var i=e.maxVoices;Object.defineProperty(e,"maxVoices",{get:function(){return i},set:function(e){i=e,this.voicesClear(),this.initVoices()}})},interpolate:function(e,t){var i=0|t,s=i+1>e.length-1?0:i+1;return frac=t-i,e[i]+frac*(e[s]-e[i])},pushUnique:function(e,t){for(var i=e,s=!0,n=0;n<t.length;n++)if(i===t[n]){s=!1;break}s&&t.push(i)},"export":function(e,t){for(var i in Gibberish[e])t[i]=Gibberish[e][i]},ugen:function(){Gibberish.extend(this,{processProperties:function(){if("object"!=typeof arguments[0][0]||"undefined"!=typeof arguments[0][0].type||Array.isArray(arguments[0][0])||"op"===arguments[0][0].name){var e=0;for(var t in this.properties)"object"==typeof this.properties[t]&&"undefined"!=typeof this.properties[t].binops?"undefined"!=typeof arguments[0][e]&&(this.properties[t].value=arguments[0][e++]):"undefined"!=typeof arguments[0][e]&&(this.properties[t]=arguments[0][e++])}else{var i=arguments[0][0];for(var t in i)"undefined"!=typeof i[t]&&("object"==typeof this.properties[t]&&"undefined"!=typeof this.properties[t].binops?this.properties[t].value=i[t]:this[t]=i[t])}return this},valueOf:function(){return this.codegen(),this.variable},codegen:function(){var e="",t=null;if(Gibberish.memo[this.symbol])return Gibberish.memo[this.symbol];t=this.variable?this.variable:Gibberish.generateSymbol("v"),Gibberish.memo[this.symbol]=t,this.variable=t,e+="var "+t+" = "+this.symbol+"(";for(var i in this.properties){var s=this.properties[i],n="";if(Array.isArray(s.value)){0===s.value.length&&(n=0);for(var r=0;r<s.value.length;r++){var a=s.value[r];n+="object"==typeof a?null!==a?a.valueOf():"null":"function"==typeof s.value?s.value():s.value,n+=r<s.value.length-1?", ":""}}else"object"==typeof s.value?null!==s.value&&(n=s.value.codegen?s.value.valueOf():s.value):"undefined"!==s.name&&(n="function"==typeof s.value?s.value():s.value);if(0!=s.binops.length){for(var o=0;o<s.binops.length;o++)e+="(";for(var h=0;h<s.binops.length;h++){var u,c=s.binops[h];u="number"==typeof c.ugen?c.ugen:null!==c.ugen?c.ugen.valueOf():"null","="===c.binop?(e=e.replace(n,""),e+=u):"++"===c.binop?e+=" + Math.abs("+u+")":(0===h&&(e+=n),e+=" "+c.binop+" "+u+")")}}else e+=n;e+=", "}return" "===e.charAt(e.length-1)&&(e=e.slice(0,-2)),e+=");\n",this.codeblock=e,-1===Gibberish.codeblock.indexOf(this.codeblock)&&Gibberish.codeblock.push(this.codeblock),-1===Gibberish.callbackArgs.indexOf(this.symbol)&&"op"!==this.name&&Gibberish.callbackArgs.push(this.symbol),-1===Gibberish.callbackObjects.indexOf(this.callback)&&"op"!==this.name&&Gibberish.callbackObjects.push(this.callback),this.dirty=!1,t},init:function(){if(this.initalized||(this.symbol=Gibberish.generateSymbol(this.name),this.codeblock=null,this.variable=null),"undefined"==typeof this.properties&&(this.properties={}),!this.initialized){this.destinations=[];for(var e in this.properties)Gibberish.defineUgenProperty(e,this.properties[e],this)}if(arguments.length>0&&"object"==typeof arguments[0][0]&&"undefined"===arguments[0][0].type){var t=arguments[0][0];for(var e in t)this[e]=t[e]}return this.initialized=!0,this},mod:function(e,t,i){var s=this.properties[e],n={ugen:t,binop:i};s.binops.push(n),Gibberish.dirty(this)},removeMod:function(e,t){if("undefined"==typeof t)this.properties[e].binops.length=0;else if("number"==typeof t)this.properties[e].binops.splice(t,1);else if("object"==typeof t)for(var i=0,s=this.properties[e].binops.length;s>i;i++)this.properties[e].binops[i].ugen===t&&this.properties[e].binops.splice(i,1);Gibberish.dirty(this)},polyMod:function(e,t,i){for(var s=0;s<this.children.length;s++)this.children[s].mod(e,t,i);Gibberish.dirty(this)},removePolyMod:function(){var e=Array.prototype.slice.call(arguments,0);if("amp"!==arguments[0]&&"pan"!==arguments[0])for(var t=0;t<this.children.length;t++)this.children[t].removeMod.apply(this.children[t],e);else this.removeMod.apply(this,e);Gibberish.dirty(this)},smooth:function(e){var t=new Gibberish.OnePole;this.mod(e,t,"=")},connect:function(e,t){return"undefined"==typeof e&&(e=Gibberish.out),-1===this.destinations.indexOf(e)&&(e.addConnection(this,1,t),this.destinations.push(e)),this},send:function(e,t){return-1===this.destinations.indexOf(e)?(e.addConnection(this,t),this.destinations.push(e)):e.adjustSendAmount(this,t),this},disconnect:function(e,t){var i;if(e)i=this.destinations.indexOf(e),i>-1&&this.destinations.splice(i,1),e.removeConnection(this);else{for(var s=0;s<this.destinations.length;s++)this.destinations[s].removeConnection(this);this.destinations=[]}return Gibberish.dirty(this),this}})}};Array2=function(){this.length=0},Array2.prototype=[],Array2.prototype.remove=function(e,t){if(t="undefined"==typeof t?!0:t,"undefined"==typeof e){for(var i=0;i<this.length;i++)delete this[i];this.length=0}else if("number"==typeof e)this.splice(e,1);else if("string"==typeof e){for(var s=[],i=0;i<this.length;i++){var n=this[i];if(n.type===e||n.name===e){if(!t)return void this.splice(i,1);s.push(i)}}for(var i=0;i<s.length;i++)this.splice(s[i],1)}else if("object"==typeof e)for(var r=this.indexOf(e);r>-1;)this.splice(r,1),r=this.indexOf(e);this.parent&&Gibberish.dirty(this.parent)},Array2.prototype.get=function(e){if("number"==typeof e)return this[e];if("string"==typeof e)for(var t=0;t<this.length;t++){var i=this[t];if(i.name===e)return i}else if("object"==typeof e){var s=this.indexOf(e);if(s>-1)return this[s]}return null},Array2.prototype.replace=function(e,t){if(t.parent=this,t.input=e.input,"number"!=typeof e){var i=this.indexOf(e);i>-1&&this.splice(i,1,t)}else this.splice(e,1,t);this.parent&&Gibberish.dirty(this.parent)},Array2.prototype.insert=function(e,t){if(e.parent=this,this.input=this.parent,Array.isArray(e))for(var i=0;i<e.length;i++)this.splice(t+i,0,e[i]);else this.splice(t,0,e);this.parent&&Gibberish.dirty(this.parent)},Array2.prototype.add=function(){for(var e=0;e<arguments.length;e++)arguments[e].parent=this,arguments[e].input=this.parent,this.push(arguments[e]);this.parent&&(console.log("DIRTYING"),Gibberish.dirty(this.parent))};var rnd=Math.random;Gibberish.rndf=function(e,t,i,s){if(s="undefined"==typeof s?!0:s,"undefined"==typeof i&&"object"!=typeof e){1==arguments.length?(t=arguments[0],e=0):2==arguments.length?(e=arguments[0],t=arguments[1]):(e=0,t=1);var n=t-e,r=Math.random(),a=n*r;return e+a}var o=[],h=[];"undefined"==typeof i&&(i=t||e.length);for(var u=0;i>u;u++){var c;if("object"==typeof arguments[0])c=arguments[0][rndi(0,arguments[0].length-1)];else if(s)c=Gibberish.rndf(e,t);else{for(c=Gibberish.rndf(e,t);h.indexOf(c)>-1;)c=Gibberish.rndf(e,t);h.push(c)}o.push(c)}return o},Gibberish.Rndf=function(){{var e,t,i,s;Math.random}return 0===arguments.length?(e=0,t=1):1===arguments.length?(t=arguments[0],e=0):2===arguments.length?(e=arguments[0],t=arguments[1]):3===arguments.length?(e=arguments[0],t=arguments[1],i=arguments[2]):(e=arguments[0],t=arguments[1],i=arguments[2],s=arguments[3]),function(){var n,r,a;return r="function"==typeof e?e():e,a="function"==typeof t?t():t,n="undefined"==typeof i?Gibberish.rndf(r,a):Gibberish.rndf(r,a,i,s)}},Gibberish.rndi=function(e,t,i,s){var n;if(0===arguments.length?(e=0,t=1):1===arguments.length?(t=arguments[0],e=0):2===arguments.length?(e=arguments[0],t=arguments[1]):(e=arguments[0],t=arguments[1],i=arguments[2],s=arguments[3]),n=t-e,i>n&&(s=!0),"undefined"==typeof i)return n=t-e,Math.round(e+Math.random()*n);for(var r=[],a=[],o=0;i>o;o++){var h;if(s)h=Gibberish.rndi(e,t);else{for(h=Gibberish.rndi(e,t);a.indexOf(h)>-1;)h=Gibberish.rndi(e,t);a.push(h)}r.push(h)}return r},Gibberish.Rndi=function(){{var e,t,i,s,n;Math.random,Math.round}return 0===arguments.length?(e=0,t=1):1===arguments.length?(t=arguments[0],e=0):2===arguments.length?(e=arguments[0],t=arguments[1]):3===arguments.length?(e=arguments[0],t=arguments[1],i=arguments[2]):(e=arguments[0],t=arguments[1],i=arguments[2],s=arguments[3]),n=t-e,"number"==typeof i&&i>n&&(s=!0),function(){var n,r,a;return r="function"==typeof e?e():e,a="function"==typeof t?t():t,n="undefined"==typeof i?Gibberish.rndi(r,a):Gibberish.rndi(r,a,i,s)}},Gibberish.extend=function(e,t){for(var i in t){{i.split(".")}t[i]instanceof Array&&t[i].length<100?(e[i]=t[i].slice(0),"fx"===i&&(e[i].parent=t[i].parent)):"object"!=typeof t[i]||null===t[i]||t[i]instanceof Float32Array?e[i]=t[i]:(e[i]=e[i]||{},arguments.callee(e[i],t[i]))}return e},Function.prototype.clone=function(){return eval("["+this.toString()+"]")[0]},String.prototype.format=function(e,t,i){function s(){var s=this,n=arguments.length+1;for(e=0;n>e;i=arguments[e++])t=i,s=s.replace(RegExp("\\{"+(e-1)+"\\}","g"),t);return s}return s.native=String.prototype.format,s}(),Gibberish.future=function(e,t){var i=new Gibberish.Sequencer({values:[function(){},function(){e(),i.stop(),i.disconnect()}],durations:[t]}).start();return i.cancel=function(){i.stop(),i.disconnect()},i},Gibberish.Proxy=function(){var e=0;Gibberish.extend(this,{name:"proxy",type:"effect",properties:{},callback:function(){return e}}).init(),this.input=arguments[0],e=this.input.parent[this.input.name],delete this.input.parent[this.input.name],this.input.parent.properties[this.input.name].value=this,Object.defineProperty(this.input.parent,this.input.name,{get:function(){return e},set:function(t){e=t}}),Gibberish.dirty(this.input.parent)},Gibberish.Proxy.prototype=new Gibberish.ugen,Gibberish.Proxy2=function(){var e=arguments[0],t=arguments[1];Gibberish.extend(this,{name:"proxy2",type:"effect",properties:{},callback:function(){var i=e[t];return Array.isArray(i)?(i[0]+i[1]+i[2])/3:i}}).init(),this.getInput=function(){return e},this.setInput=function(t){e=t},this.getName=function(){return t},this.setName=function(e){t=e}},Gibberish.Proxy2.prototype=new Gibberish.ugen,Gibberish.Proxy3=function(){var e=arguments[0],t=arguments[1];Gibberish.extend(this,{name:"proxy3",type:"effect",properties:{},callback:function(){var i=e[t];return i||0}}),this.init(),this.codegen=function(){console.log(" CALLED "),this.variable||(this.variable=Gibberish.generateSymbol("v")),Gibberish.callbackArgs.push(this.symbol),Gibberish.callbackObjects.push(this.callback),this.codeblock="var "+this.variable+" = "+this.symbol+"("+e.properties[t].codegen()+");\n"}},Gibberish.Proxy3.prototype=new Gibberish.ugen,Gibberish.oscillator=function(){this.type="oscillator",this.oscillatorInit=function(){return this.fx=new Array2,this.fx.parent=this,this}},Gibberish.oscillator.prototype=new Gibberish.ugen,Gibberish._oscillator=new Gibberish.oscillator,Gibberish.Wavetable=function(){var e=0,t=null,i=Gibberish.context.sampleRate/1024,s=0;this.properties={frequency:440,amp:.25,sync:0},this.getTable=function(){return t},this.setTable=function(e){t=e,i=Gibberish.context.sampleRate/t.length},this.getTableFreq=function(){return i},this.setTableFreq=function(e){i=e},this.getPhase=function(){return e},this.setPhase=function(t){e=t},this.callback=function(n,r){var a,o,h,u,c,l;for(e+=n/i;e>=1024;)e-=1024;return a=0|e,o=e-a,a=1023&a,h=1023===a?0:a+1,u=t[a],c=t[h],0!==l&&(s=l),(u+o*(c-u))*r}},Gibberish.Wavetable.prototype=Gibberish._oscillator,Gibberish.Table=function(e){this.__proto__=new Gibberish.Wavetable,this.name="table";var t=2*Math.PI;if("undefined"==typeof e){e=new Float32Array(1024);for(var i=1024;i--;)e[i]=Math.sin(i/1024*t)}this.setTable(e),this.init(),this.oscillatorInit()},Gibberish.asmSine=function(e,t,i){"use asm";function s(){for(var e=1024,t=1024;e=e-1|0;)t-=1,h[e>>2]=+a(+(t/1024)*6.2848);c=44100/1024}function n(e,t,i){e=+e,t=+t,i=+i;var s=0,n=0,r=0,a=0,l=0,b=0;return o=+(o+e/c),o>=1024&&(o=+(o-1024)),s=+u(o),a=o-s,n=~~s,r=(n|0)==1024?0:n+1|0,l=+h[n>>2],b=+h[r>>2],+((l+a*(b-l))*t)}function r(e){return e|=0,+h[e>>2]}var a=e.Math.sin,o=0,h=new e.Float32Array(i),u=e.Math.floor,c=0;return{init:s,gen:n,get:r}},Gibberish.asmSine2=function(){this.properties={frequency:440,amp:.5,sr:Gibberish.context.sampleRate},this.name="sine";var e=new ArrayBuffer(4096),t=Gibberish.asmSine(window,null,e);return t.init(),this.getTable=function(){return e},this.get=t.get,this.callback=t.gen,this.init(),this.oscillatorInit(),this.processProperties(arguments),this},Gibberish.asmSine2.prototype=Gibberish._oscillator,Gibberish.Sine=function(){this.__proto__=new Gibberish.Wavetable,this.name="sine";for(var e=2*Math.PI,t=new Float32Array(1024),i=1024;i--;)t[i]=Math.sin(i/1024*e);this.setTable(t),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Sine2=function(){this.__proto__=new Gibberish.Sine,this.name="sine2";var e=this.__proto__.callback,t=Gibberish.makePanner(),i=[0,0];this.callback=function(s,n,r){var a=e(s,n);return i=t(a,r,i)},this.init(),this.oscillatorInit(),Gibberish.defineUgenProperty("pan",0,this),this.processProperties(arguments)},Gibberish.Square=function(){this.__proto__=new Gibberish.Wavetable,this.name="square";for(var e=(2*Math.PI,new Float32Array(1024)),t=1024;t--;)e[t]=t/1024>.5?1:-1;this.setTable(e),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Saw=function(){this.__proto__=new Gibberish.Wavetable,this.name="saw";for(var e=new Float32Array(1024),t=1024;t--;)e[t]=4*((t/1024/2+.25)%.5-.25);this.setTable(e),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Saw2=function(){this.__proto__=new Gibberish.Saw,this.name="saw2";var e=this.__proto__.callback,t=Gibberish.makePanner(),i=[0,0];this.callback=function(s,n,r){var a=e(s,n);return i=t(a,r,i)},this.init(),Gibberish.defineUgenProperty("pan",0,this)},Gibberish.Triangle=function(){this.__proto__=new Gibberish.Wavetable,this.name="triangle";for(var e=new Float32Array(1024),t=Math.abs,i=1024;i--;)e[i]=1-4*t((i/1024+.25)%1-.5);this.setTable(e),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Triangle2=function(){this.__proto__=new Gibberish.Triangle,this.name="triangle2";var e=this.__proto__.callback,t=Gibberish.makePanner(),i=[0,0];this.callback=function(s,n,r){var a=e(s,n);return t(a,r,i)},this.init(),this.oscillatorInit(),Gibberish.defineUgenProperty("pan",0,this),this.processProperties(arguments)},Gibberish.Saw3=function(){var e=0,t=0,i=2.5,s=-1.5,n=0,r=Math.sin,a=11;pi_2=2*Math.PI,flip=0,signHistory=0,ignore=!1,sr=Gibberish.context.sampleRate,Gibberish.extend(this,{name:"saw",properties:{frequency:440,amp:.15,sync:0,sr:Gibberish.context.sampleRate},callback:function(o){var h=o/sr,u=.5-h,c=a*u*u*u*u,l=.376-.752*h,b=1-2*h,p=0;return t+=h,t-=t>1?2:0,e=.5*(e+r(pi_2*(t+e*c))),p=i*e+s*n,n=e,p+=l,p*=b}}),Object.defineProperty(this,"scale",{get:function(){return a},set:function(e){a=e}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Saw3.prototype=Gibberish._oscillator,Gibberish.PWM=function(){var e=0,t=0,i=0,s=0,n=0,r=2.5,a=-1.5,o=Math.sin,h=11;pi_2=2*Math.PI,test=0,sr=Gibberish.context.sampleRate,Gibberish.extend(this,{name:"pwm",properties:{frequency:440,amp:.15,pulsewidth:.05,sr:Gibberish.context.sampleRate},callback:function(u,c,l){var b=u/sr,p=.5-b,f=h*p*p*p*p,d=1-2*b,g=0;return n+=b,n-=n>1?2:0,e=.5*(e+o(pi_2*(n+e*f))),t=.5*(t+o(pi_2*(n+t*f+l))),g=t-e,g=r*g+a*(i-s),i=e,s=t,g*d*c}}),Object.defineProperty(this,"scale",{get:function(){return h},set:function(e){h=e}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.PWM.prototype=Gibberish._oscillator,Gibberish.Noise=function(){var e=Math.random;Gibberish.extend(this,{name:"noise",properties:{amp:1},callback:function(t){return(2*e()-1)*t}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Noise.prototype=Gibberish._oscillator,Gibberish.KarplusStrong=function(){var e=[0],t=0,i=Math.random,s=Gibberish.makePanner(),n=Gibberish.context.sampleRate,r=[0,0];Gibberish.extend(this,{name:"karplus_strong",frequency:0,properties:{blend:1,damping:0,amp:1,channels:2,pan:0},note:function(t){var s=Math.floor(n/t);e.length=0;for(var r=0;s>r;r++)e[r]=2*i()-1;this.frequency=t},callback:function(n,a,o,h,u){var c=e.shift(),l=i()>n?-1:1;a=a>0?a:0;var b=l*(c+t)*(.5-a/100);return t=b,e.push(b),b*=o,1===h?b:s(b,u,r)}}).init().oscillatorInit().processProperties(arguments)},Gibberish.KarplusStrong.prototype=Gibberish._oscillator,Gibberish.PolyKarplusStrong=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"poly_karplus_strong",maxVoices:5,voiceCount:0,_frequency:0,polyProperties:{blend:1,damping:0},note:function(e,t){var i=this.children[this.voiceCount++];this.voiceCount>=this.maxVoices&&(this.voiceCount=0),i.note(e,t),this._frequency=e},initVoices:function(){for(var e=0;e<this.maxVoices;e++){var t={blend:this.blend,damping:this.damping,channels:2,amp:1},i=new Gibberish.KarplusStrong(t).connect(this);this.children.push(i)}}}),this.amp=1/this.maxVoices,this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices),Gibberish.polyInit(this),this.initVoices(),this.processProperties(arguments),this.initialized=!1,Gibberish._synth.oscillatorInit.call(this),Gibberish.dirty(this)},Gibberish.bus=function(){this.type="bus",this.inputCodegen=function(){var e,t=this.value.valueOf();return e=t+", "+this.amp,this.codeblock=e,e},this.addConnection=function(){var e=arguments[2],t={value:arguments[0],amp:arguments[1],codegen:this.inputCodegen,valueOf:function(){return this.codegen()}};"undefined"!=typeof e?this.inputs.splice(e,0,t):this.inputs.push(t),Gibberish.dirty(this)},this.removeConnection=function(e){for(var t=0;t<this.inputs.length;t++)if(this.inputs[t].value===e){this.inputs.splice(t,1),Gibberish.dirty(this);break}},this.adjustSendAmount=function(e,t){for(var i=0;i<this.inputs.length;i++)if(this.inputs[i].value===e){this.inputs[i].amp=t,Gibberish.dirty(this);break}},this.callback=function(){var e=arguments[arguments.length-2],t=arguments[arguments.length-1];output[0]=output[1]=0;for(var i=0;i<arguments.length-2;i+=2){var s="object"==typeof arguments[i],n=arguments[i+1];output[0]+=s?arguments[i][0]*n:arguments[i]*n,output[1]+=s?arguments[i][1]*n:arguments[i]*n}return output[0]*=e,output[1]*=e,panner(output,t,output)}},Gibberish.bus.prototype=new Gibberish.ugen,Gibberish._bus=new Gibberish.bus,Gibberish.Bus=function(){return Gibberish.extend(this,{name:"bus",properties:{inputs:[],amp:1},callback:function(){for(var e=0,t=arguments.length-1,i=arguments[t],s=0;t>s;s++)e+=arguments[s];return e*=i}}),this.init(),this.processProperties(arguments),this},Gibberish.Bus.prototype=Gibberish._bus,Gibberish.Bus2=function(){this.name="bus2",this.type="bus",this.properties={inputs:[],amp:1,pan:0};var e=[0,0],t=Gibberish.makePanner();this.callback=function(){var i=arguments,s=i.length,n=i[s-2],r=i[s-1];e[0]=e[1]=0;for(var a=0,o=s-2;o>a;a+=2){var h="object"==typeof i[a],u=i[a+1];e[0]+=h?i[a][0]*u||0:i[a]*u||0,e[1]+=h?i[a][1]*u||0:i[a]*u||0}return e[0]*=n,e[1]*=n,t(e,r,e)},this.show=function(){console.log(e,args)},this.getOutput=function(){return e},this.getArgs=function(){return args},this.init(arguments),this.processProperties(arguments)},Gibberish.Bus2.prototype=Gibberish._bus,Gibberish.envelope=function(){this.type="envelope"},Gibberish.envelope.prototype=new Gibberish.ugen,Gibberish._envelope=new Gibberish.envelope,Gibberish.ExponentialDecay=function(){var e=Math.pow,t=0,i=0;Gibberish.extend(this,{name:"ExponentialDecay",properties:{decay:.5,length:11050},callback:function(s,n){return t=e(s,i),i+=1/n,t},trigger:function(){i="number"==typeof arguments[0]?arguments[0]:0}}).init()},Gibberish.ExponentialDecay.prototype=Gibberish._envelope,Gibberish.Line=function(e,t,i,s){var n,r={name:"line",properties:{start:e||0,end:isNaN(t)?1:t,time:i||Gibberish.context.sampleRate,loops:s||!1},retrigger:function(e,t){a=0,this.start=n,this.end=e,this.time=t,o=(e-n)/t}},a=0,o=(t-e)/i;return this.callback=function(e,t,i,s){return n=i>a?e+a++*o:t,a=n>=t&&s?0:a,n},Gibberish.extend(this,r),this.init(),this},Gibberish.Line.prototype=Gibberish._envelope,Gibberish.AD=function(e,t){var i=0,s=0;Gibberish.extend(this,{name:"AD",properties:{attack:e||1e4,decay:t||1e4},run:function(){return s=0,i=0,this},callback:function(e,t){if(e=0>e?22050:e,t=0>t?22050:t,0===s){var n=1/e;i+=n,i>=1&&s++}else if(1===s){var n=1/t;i-=n,0>=i&&(i=0,s++)}return i},getState:function(){return s}}).init().processProperties(arguments)},Gibberish.AD.prototype=Gibberish._envelope,Gibberish.ADSR=function(e,t,i,s,n,r,a){var o={name:"adsr",type:"envelope",requireReleaseTrigger:"undefined"!=typeof a?a:!1,properties:{attack:isNaN(e)?1e4:e,decay:isNaN(t)?1e4:t,sustain:isNaN(i)?22050:i,release:isNaN(s)?1e4:s,attackLevel:n||1,sustainLevel:r||.5,releaseTrigger:0},run:function(){this.setPhase(0),this.setState(0)},stop:function(){this.releaseTrigger=1}};Gibberish.extend(this,o);var h=0,u=0,c=0,l=this;return this.callback=function(e,t,i,s,n,r,a){var o=0;return c=1===c?1:a,0===u?(o=h/e*n,++h/e>=1&&(u++,h=t)):1===u?(o=h/t*(n-r)+r,--h<=0&&(null!==i?(u+=1,h=i):(u+=2,h=s))):2===u?(o=r,l.requireReleaseTrigger&&c?(u++,h=s,l.releaseTrigger=0,c=0):h--<=0&&!l.requireReleaseTrigger&&(u++,h=s)):3===u&&(h--,o=h/s*r,0>=h&&u++),o},this.call=function(){return this.callback(this.attack,this.decay,this.sustain,this.release,this.attackLevel,this.sustainLevel,this.releaseTrigger)},this.setPhase=function(e){h=e},this.setState=function(e){u=e,h=0},this.getState=function(){return u},this.init(),this},Gibberish.ADSR.prototype=Gibberish._envelope,Gibberish.ADR=function(e,t,i,s,n){var r={name:"adr",type:"envelope",properties:{attack:isNaN(e)?11025:e,decay:isNaN(t)?11025:t,release:isNaN(i)?22050:i,attackLevel:s||1,releaseLevel:n||.2},run:function(){this.setPhase(0),this.setState(0)}};Gibberish.extend(this,r);var a=0,o=0;return this.callback=function(e,t,i,s,n){var r=0;return 0===o?(r=a/e*s,++a/e===1&&(o++,a=t)):1===o?(r=a/t*(s-n)+n,--a<=0&&(o+=1,a=i)):2===o&&(a--,r=a/i*n,0>=a&&o++),r},this.setPhase=function(e){a=e},this.setState=function(e){o=e,a=0},this.getState=function(){return o},this.init(),this},Gibberish.ADR.prototype=Gibberish._envelope,Gibberish.analysis=function(){this.type="analysis",this.codegen=function(){if(Gibberish.memo[this.symbol])return Gibberish.memo[this.symbol];var e=this.variable?this.variable:Gibberish.generateSymbol("v");return Gibberish.memo[this.symbol]=e,this.variable=e,Gibberish.callbackArgs.push(this.symbol),Gibberish.callbackObjects.push(this.callback),this.codeblock="var "+this.variable+" = "+this.symbol+"();\n",-1===Gibberish.codeblock.indexOf(this.codeblock)&&Gibberish.codeblock.push(this.codeblock),this.variable},this.analysisCodegen=function(){var e=0;this.input.codegen?(e=this.input.codegen(),e.indexOf("op")>-1&&console.log("ANALYSIS BUG")):e=this.input.value?"undefined"!=typeof this.input.value.codegen?this.input.value.codegen():this.input.value:"null";var t=this.analysisSymbol+"("+e+",";for(var i in this.properties)"input"!==i&&(t+=this[i]+",");return t=t.slice(0,-1),t+=");",this.analysisCodeblock=t,-1===Gibberish.analysisCodeblock.indexOf(this.analysisCodeblock)&&Gibberish.analysisCodeblock.push(this.analysisCodeblock),-1===Gibberish.callbackObjects.indexOf(this.analysisCallback)&&Gibberish.callbackObjects.push(this.analysisCallback),t},this.remove=function(){Gibberish.analysisUgens.splice(Gibberish.analysisUgens.indexOf(this),1)},this.analysisInit=function(){this.analysisSymbol=Gibberish.generateSymbol(this.name),Gibberish.analysisUgens.push(this),Gibberish.dirty()}},Gibberish.analysis.prototype=new Gibberish.ugen,Gibberish._analysis=new Gibberish.analysis,Gibberish.Follow=function(){this.name="follow",this.properties={input:0,bufferSize:4410,mult:1,useAbsoluteValue:!0};var e=Math.abs,t=[0],i=0,s=0,n=0;this.analysisCallback=function(r,a,o,h){"object"==typeof r&&(r=r[0]+r[1]),i+=h?e(r):r,i-=t[s],t[s]=h?e(r):r,s=(s+1)%a,t[s]=t[s]?t[s]:0,n=i/a*o},this.callback=this.getValue=function(){return n},this.init(),this.analysisInit(),this.processProperties(arguments);var r=(this.__lookupSetter__("bufferSize"),this.bufferSize);Object.defineProperty(this,"bufferSize",{get:function(){return r},set:function(e){r=e,i=0,t=[0],s=0}})},Gibberish.Follow.prototype=Gibberish._analysis,Gibberish.SingleSampleDelay=function(){this.name="single_sample_delay",this.properties={input:arguments[0]||0,amp:arguments[1]||1};var e=0;this.analysisCallback=function(t){e=t},this.callback=function(){return e},this.getValue=function(){return e},this.init(),this.analysisInit(),this.processProperties(arguments)},Gibberish.SingleSampleDelay.prototype=Gibberish._analysis,Gibberish.Record=function(e,t,i){var s=new Float32Array(t),n=0,r=!1,a=this;Gibberish.extend(this,{name:"record",oncomplete:i,properties:{input:0,size:t||0},analysisCallback:function(e,t){r&&(s[n++]="object"==typeof e?e[0]+e[1]:e,n>=t&&(r=!1,a.remove()))},record:function(){return n=0,r=!0,this},getBuffer:function(){return s},getPhase:function(){return n},remove:function(){"undefined"!=typeof this.oncomplete&&this.oncomplete();for(var e=0;e<Gibberish.analysisUgens.length;e++){var t=Gibberish.analysisUgens[e];if(t===this)return Gibberish.callbackArgs.indexOf(this.analysisSymbol)>-1&&Gibberish.callbackArgs.splice(Gibberish.callbackArgs.indexOf(this.analysisSymbol),1),Gibberish.callbackObjects.indexOf(this.analysisCallback)>-1&&Gibberish.callbackObjects.splice(Gibberish.callbackObjects.indexOf(this.analysisCallback),1),void Gibberish.analysisUgens.splice(e,1)}}}),this.properties.input=e,this.init(),this.analysisInit(),Gibberish.dirty()},Gibberish.Record.prototype=Gibberish._analysis,Gibberish.effect=function(){this.type="effect"},Gibberish.effect.prototype=new Gibberish.ugen,Gibberish._effect=new Gibberish.effect,Gibberish.Distortion=function(){var e=Math.abs,t=Math.log,i=Math.LN2;Gibberish.extend(this,{name:"distortion",properties:{input:0,amount:50},callback:function(s,n){var r;return n=n>2?n:2,"number"==typeof s?(r=s*n,s=r/(1+e(r))/(t(n)/i)):(r=s[0]*n,s[0]=r/(1+e(r))/(t(n)/i),r=s[1]*n,s[1]=r/(1+e(r))/(t(n)/i)),s}}).init().processProperties(arguments)},Gibberish.Distortion.prototype=Gibberish._effect,Gibberish.Gain=function(){Gibberish.extend(this,{name:"gain",properties:{input:0,amount:1},callback:function(e,t){return"number"==typeof e?e*=t:(e[0]*=t,e[1]*=t),e}}).init().processProperties(arguments)},Gibberish.Gain.prototype=Gibberish._effect,Gibberish.Delay=function(){var e=[],t=0;e.push(new Float32Array(2*Gibberish.context.sampleRate)),e.push(new Float32Array(2*Gibberish.context.sampleRate)),Gibberish.extend(this,{name:"delay",properties:{input:0,time:22050,feedback:.5,wet:1,dry:1},callback:function(i,s,n,r,a){var o="number"==typeof i?1:2,h=t++%88200,u=(h+(0|s))%88200;
return 1===o?(e[0][u]=(i+e[0][h])*n,i=i*a+e[0][h]*r):(e[0][u]=(i[0]+e[0][h])*n,i[0]=i[0]*a+e[0][h]*r,e[1][u]=(i[1]+e[1][h])*n,i[1]=i[1]*a+e[1][h]*r),i}});var i=Math.round(this.properties.time);Object.defineProperty(this,"time",{configurable:!0,get:function(){return i},set:function(e){i=Math.round(e),Gibberish.dirty(this)}}),this.init(),this.processProperties(arguments)},Gibberish.Delay.prototype=Gibberish._effect,Gibberish.Decimator=function(){var e=0,t=[],i=Math.pow,s=Math.floor;Gibberish.extend(this,{name:"decimator",properties:{input:0,bitDepth:16,sampleRate:1},callback:function(n,r,a){e+=a;var o="number"==typeof n?1:2;if(1===o){if(e>=1){var h=i(r,2);t[0]=s(n*h)/h,e-=1}n=t[0]}else{if(e>=1){var h=i(r,2);t[0]=s(n[0]*h)/h,t[1]=s(n[1]*h)/h,e-=1}n=t}return n}}).init().processProperties(arguments)},Gibberish.Decimator.prototype=Gibberish._effect,Gibberish.RingModulation=function(){var e=(new Gibberish.Sine).callback,t=[0,0];Gibberish.extend(this,{name:"ringmod",properties:{input:0,frequency:440,amp:.5,mix:.5},callback:function(i,s,n,r){var a="number"==typeof i?1:2,o=1===a?i:i[0],h=e(s,n);if(o=o*(1-r)+o*h*r,2===a){var u=i[1];return u=u*(1-r)+u*h*r,t[0]=o,t[1]=u,t}return o}}).init().processProperties(arguments)},Gibberish.RingModulation.prototype=Gibberish._effect,Gibberish.DCBlock=function(){var e=0,t=0;Gibberish.extend(this,{name:"dcblock",type:"effect",properties:{input:0},reset:function(){e=0,t=0},callback:function(i){var s=i-e+.9997*t;return e=i,t=s,s}}).init().processProperties(arguments)},Gibberish.DCBlock.prototype=Gibberish._effect,Gibberish.Tremolo=function(){var e=(new Gibberish.Sine).callback;Gibberish.extend(this,{name:"tremolo",type:"effect",properties:{input:0,frequency:2.5,amp:.5},callback:function(t,i,s){var n="number"==typeof t?1:2,r=e(i,s);return 1===n?t*=r:(t[0]*=r,t[1]*=r),t}}).init().processProperties(arguments)},Gibberish.Tremolo.prototype=Gibberish._effect,Gibberish.OnePole=function(){var e=0;Gibberish.extend(this,{name:"onepole",type:"effect",properties:{input:0,a0:.15,b1:.85},callback:function(t,i,s){var n=t*i+e*s;return e=n,n},smooth:function(t,i){this.input=i[t],e=this.input,i[t]=this,this.obj=i,this.property=t,this.oldSetter=i.__lookupSetter__(t),this.oldGetter=i.__lookupGetter__(t);var s=this;Object.defineProperty(i,t,{get:function(){return s.input},set:function(e){s.input=e}})},remove:function(){Object.defineProperty(this.obj,this.property,{get:this.oldGetter,set:this.oldSetter}),this.obj[this.property]=this.input}}).init().processProperties(arguments)},Gibberish.OnePole.prototype=Gibberish._effect,Gibberish.Filter24=function(){var e=[0,0,0,0],t=[0,0,0,0],i=[0,0],s=isNaN(arguments[0])?.1:arguments[0],n=isNaN(arguments[1])?3:arguments[1];_isLowPass="undefined"!=typeof arguments[2]?arguments[2]:!0,Gibberish.extend(this,{name:"filter24",properties:{input:0,cutoff:s,resonance:n,isLowPass:_isLowPass},callback:function(s,n,r,a){var o="number"==typeof s?1:2,h=1===o?s:s[0],u=e[3]*r;if(u=u>1?1:u,n=0>n?0:n,n=n>1?1:n,h-=u,e[0]=e[0]+(-e[0]+h)*n,e[1]=e[1]+(-e[1]+e[0])*n,e[2]=e[2]+(-e[2]+e[1])*n,e[3]=e[3]+(-e[3]+e[2])*n,h=a?e[3]:h-e[3],2===o){var c=s[1];return u=t[3]*r,u=u>1?1:u,c-=u,t[0]=t[0]+(-t[0]+c)*n,t[1]=t[1]+(-t[1]+t[0])*n,t[2]=t[2]+(-t[2]+t[1])*n,t[3]=t[3]+(-t[3]+t[2])*n,c=a?t[3]:c-t[3],i[0]=h,i[1]=c,i}return h}}).init().processProperties(arguments)},Gibberish.Filter24.prototype=Gibberish._effect,Gibberish.SVF=function(){var e=[0,0],t=[0,0],i=Math.PI,s=[0,0];Gibberish.extend(this,{name:"SVF",properties:{input:0,cutoff:440,Q:2,mode:0,sr:Gibberish.context.sampleRate},callback:function(n,r,a,o,h){var u="number"==typeof n?1:2,c=1===u?n:n[0],l=2*i*r/h;a=1/a;var b=t[0]+l*e[0],p=c-b-a*e[0],f=l*p+e[0],d=p+b;if(e[0]=f,t[0]=b,c=0===o?b:1===o?p:2===o?f:d,2===u){var g=n[1],b=t[1]+l*e[1],p=g-b-a*e[1],f=l*p+e[1],d=p+b;e[1]=f,t[1]=b,g=0===o?b:1===o?p:2===o?f:d,s[0]=c,s[1]=g}else s=c;return s}}).init().processProperties(arguments)},Gibberish.SVF.prototype=Gibberish._effect,Gibberish.Biquad=function(){var e=x2=y1=y2=0,t=[0,0],i=.001639,s=.003278,n=.001639,r=-1.955777,a=.960601,o="LP",h=2e3,u=.5,c=Gibberish.context.sampleRate;Gibberish.extend(this,{name:"biquad",properties:{input:null},calculateCoefficients:function(){switch(o){case"LP":var e=2*Math.PI*h/c,t=Math.sin(e),l=Math.cos(e),b=t/(2*u);i=(1-l)/2,s=1-l,n=i,a0=1+b,r=-2*l,a=1-b;break;case"HP":var e=2*Math.PI*h/c,t=Math.sin(e),l=Math.cos(e),b=t/(2*u);i=(1+l)/2,s=-(1+l),n=i,a0=1+b,r=-2*l,a=1-b;break;case"BP":var e=2*Math.PI*h/c,t=Math.sin(e),l=Math.cos(e),p=Math.log(2)/2*u*e/t,b=t*(Math.exp(p)-Math.exp(-p))/2;i=b,s=0,n=-b,a0=1+b,r=-2*l,a=1-b;break;default:return}i/=a0,s/=a0,n/=a0,r/=a0,a/=a0},callback:function(o){var h="number"==typeof o?1:2,u=0,c=0,l=1===h?o:o[0];return u=i*l+s*e+n*x2-r*y1-a*y2,x2=e,e=o,y2=y1,y1=u,2===h&&(inR=o[1],c=i*inR+s*e[1]+n*x2[1]-r*y1[1]-a*y2[1],x2[1]=e[1],e[1]=o[1],y2[1]=y1[1],y1[1]=c,t[0]=u,t[1]=c),1===h?u:t}}).init(),Object.defineProperties(this,{mode:{get:function(){return o},set:function(e){o=e,this.calculateCoefficients()}},cutoff:{get:function(){return h},set:function(e){h=e,this.calculateCoefficients()}},Q:{get:function(){return u},set:function(e){u=e,this.calculateCoefficients()}}}),this.processProperties(arguments),this.calculateCoefficients()},Gibberish.Biquad.prototype=Gibberish._effect,Gibberish.Flanger=function(){var e=[new Float32Array(88200),new Float32Array(88200)],t=88200,i=(new Gibberish.Sine).callback,s=Gibberish.interpolate,n=-100,r=0;Gibberish.extend(this,{name:"flanger",properties:{input:0,rate:.25,feedback:0,amount:125,offset:125},callback:function(a,o,h,u){var c="number"==typeof a?1:2,l=n+i(o,.95*u);l>t?l-=t:0>l&&(l+=t);var b=s(e[0],l);return e[0][r]=1===c?a+b*h:a[0]+b*h,2===c?(a[0]+=b,b=s(e[1],l),e[1][r]=a[1]+b*h,a[1]+=b):a+=b,++r>=t&&(r=0),++n>=t&&(n=0),a}}).init().processProperties(arguments),n=-1*this.offset},Gibberish.Flanger.prototype=Gibberish._effect,Gibberish.Vibrato=function(){var e=[new Float32Array(88200),new Float32Array(88200)],t=88200,i=(new Gibberish.Sine).callback,s=Gibberish.interpolate,n=-100,r=0;Gibberish.extend(this,{name:"vibrato",properties:{input:0,rate:5,amount:.5,offset:125},callback:function(a,o,h,u){var c="number"==typeof a?1:2,l=n+i(o,h*u-1);l>t?l-=t:0>l&&(l+=t);var b=s(e[0],l);return e[0][r]=1===c?a:a[0],2===c?(a[0]=b,b=s(e[1],l),e[1][r]=a[1],a[1]=b):a=b,++r>=t&&(r=0),++n>=t&&(n=0),a}}).init().processProperties(arguments),n=-1*this.offset},Gibberish.Vibrato.prototype=Gibberish._effect,Gibberish.BufferShuffler=function(){var e=[new Float32Array(88200),new Float32Array(88200)],t=88200,i=0,s=0,n=0,r=0,a=0,o=Math.random,h=1,u=!1,c=!1,l=!1,b=Gibberish.interpolate,p=!1,f=1,d=!1,g=Gibberish.rndf,m=[0,0];Gibberish.extend(this,{name:"buffer_shuffler",properties:{input:0,chance:.25,rate:11025,length:22050,reverseChange:.5,pitchChance:.5,pitchMin:.25,pitchMax:2,wet:1,dry:0},callback:function(y,v,G,k,x,_,w,A,S,P){var R="number"==typeof y?1:2;a?++r%(k-400)===0&&(u=!1,c=!0,h=1,r=0):(e[0][s]=1===R?y:y[0],e[1][s]=1===R?y:y[1],s++,s%=t,d=0===s?1:d,n++,n%G==0&&o()<v&&(l=o()<x,a=!0,l||(i=s-k,0>i&&(i=t+i)),p=o()<_,p&&(f=g(w,A)),h=1,u=!0,c=!1)),i+=l?-1*f:f,0>i?i+=t:i>=t&&(i-=t);var q,M,C,T,I=b(e[0],i);return u?(h-=.0025,C=I*(1-h),q=1===R?C+y*h:C+y[0]*h,2===R&&(T=b(e[1],i),C=T*(1-h),M=1===R?q:C+y[1]*h),.0025>=h&&(u=!1)):c?(h-=.0025,C=I*h,q=1===R?C+y*h:C+y[0]*(1-h),2===R&&(T=b(e[1],i),C=T*h,M=C+y[1]*(1-h)),.0025>=h&&(c=!1,a=!1,l=!1,f=1,p=0)):1===R?q=a&&d?I*S+y*P:y:(T=b(e[1],i),q=a&&d?I*S+y[0]*P:y[0],M=a&&d?T*S+y[1]*P:y[1]),m=[q,M],1===R?q:m}}).init().processProperties(arguments)},Gibberish.BufferShuffler.prototype=Gibberish._effect,Gibberish.AllPass=function(e){var t=-1,i=new Float32Array(e||500),s=i.length;Gibberish.extend(this,{name:"allpass",properties:{input:0},callback:function(e){t=++t%s;var n=i[t],r=-1*e+n;return i[t]=e+.5*n,r}})},Gibberish.Comb=function(e){var t=new Float32Array(e||1200),i=t.length,s=0,n=0;Gibberish.extend(this,{name:"comb",properties:{input:0,feedback:.84,damping:.2},callback:function(e,r,a){var o=++s%i,h=t[o];return n=h*(1-a)+n*a,t[o]=e+n*r,h}})},Gibberish.Reverb=function(){var e={combCount:8,combTuning:[1116,1188,1277,1356,1422,1491,1557,1617],allPassCount:4,allPassTuning:[556,441,341,225],allPassFeedback:.5,fixedGain:.015,scaleDamping:.4,scaleRoom:.28,offsetRoom:.7,stereoSpread:23},t=.84,i=[],s=[],n=[0,0];Gibberish.extend(this,{name:"reverb",roomSize:.5,properties:{input:0,wet:.5,dry:.55,roomSize:.84,damping:.5},callback:function(e,t,r,a,o){for(var h="object"==typeof e?2:1,u=1===h?e:e[0]+e[1],c=.015*u,l=c,b=0;8>b;b++){var p=i[b](c,.98*a,.4*o);l+=p}for(var b=0;4>b;b++)l=s[b](l);return n[0]=n[1]=u*r+l*t,n}}).init().processProperties(arguments),this.setFeedback=function(e){t=e};for(var r=0;8>r;r++)i.push(new Gibberish.Comb(e.combTuning[r]).callback);for(var r=0;4>r;r++)s.push(new Gibberish.AllPass(e.allPassTuning[r],e.allPassFeedback).callback)},Gibberish.Reverb.prototype=Gibberish._effect,Gibberish.Granulator=function(e){var t=[];buffer=null,interpolate=Gibberish.interpolate,panner=Gibberish.makePanner(),bufferLength=0,debug=0,write=0,self=this,out=[0,0],_out=[0,0],rndf=Gibberish.rndf,numberOfGrains=e.numberOfGrains||20,Gibberish.extend(this,{name:"granulator",bufferLength:88200,reverse:!0,spread:.5,properties:{speed:1,speedMin:-0,speedMax:0,grainSize:1e3,position:.5,positionMin:0,positionMax:0,amp:.2,fade:.1,pan:0,shouldWrite:!1},setBuffer:function(e){buffer=e,bufferLength=e.length},callback:function(e,i,s,n,r,a,o,h,u,c){for(var l=0;numberOfGrains>l;l++){var b=t[l];if(b._speed>0){b.pos>b.end&&(b.pos=(o+rndf(r,a))*buffer.length,b.start=b.pos,b.end=b.start+n,b._speed=e+rndf(i,s),b._speed=b._speed<.1?.1:b._speed,b._speed=b._speed<.1&&b._speed>0?.1:b._speed,b._speed=b._speed>-.1&&b._speed<0?-.1:b._speed,b.fadeAmount=b._speed*u*n,b.pan=rndf(-1*self.spread,self.spread));for(var p=b.pos;p>buffer.length;)p-=buffer.length;for(;0>p;)p+=buffer.length;var f=interpolate(buffer,p);f*=b.pos<b.fadeAmount+b.start?(b.pos-b.start)/b.fadeAmount:1,f*=b.pos>b.end-b.fadeAmount?(b.end-b.pos)/b.fadeAmount:1}else{b.pos<b.end&&(b.pos=(o+rndf(r,a))*buffer.length,b.start=b.pos,b.end=b.start-n,b._speed=e+rndf(i,s),b._speed=b._speed<.1&&b._speed>0?.1:b._speed,b._speed=b._speed>-.1&&b._speed<0?-.1:b._speed,b.fadeAmount=b._speed*u*n);for(var p=b.pos;p>buffer.length;)p-=buffer.length;for(;0>p;)p+=buffer.length;var f=interpolate(buffer,p);f*=b.pos>b.start-b.fadeAmount?(b.start-b.pos)/b.fadeAmount:1,f*=b.pos<b.end+b.fadeAmount?(b.end-b.pos)/b.fadeAmount:1}_out=panner(f*h,b.pan,_out),out[0]+=_out[0],out[1]+=_out[1],b.pos+=b._speed}return panner(out,c,out)}}).init().processProperties(arguments);for(var i=0;numberOfGrains>i;i++)t[i]={pos:self.position+Gibberish.rndf(self.positionMin,self.positionMax),_speed:self.speed+Gibberish.rndf(self.speedMin,self.speedMax)},t[i].start=t[i].pos,t[i].end=t[i].pos+self.grainSize,t[i].fadeAmount=t[i]._speed*self.fade*self.grainSize,t[i].pan=Gibberish.rndf(-1*self.spread,self.spread);"undefined"!=typeof e.buffer&&(buffer=e.buffer,bufferLength=buffer.length)},Gibberish.Granulator.prototype=Gibberish._effect,Gibberish.synth=function(){this.type="oscillator",this.oscillatorInit=function(){this.fx=new Array2,this.fx.parent=this}},Gibberish.synth.prototype=new Gibberish.ugen,Gibberish._synth=new Gibberish.synth,Gibberish.Synth=function(e){this.name="synth",this.properties={frequency:0,pulsewidth:.5,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,releaseTrigger:0,glide:.15,amp:.25,channels:2,pan:0,sr:Gibberish.context.sampleRate},this.note=function(s,n){if(0!==n){if("object"!=typeof this.frequency){if(t&&s===c&&e.requireReleaseTrigger)return this.releaseTrigger=1,void(c=null);this.frequency=c=s,this.releaseTrigger=0}else this.frequency[0]=c=s,this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof n&&(this.amp=n),i.run()}else this.releaseTrigger=1},e=e||{};var t="undefined"==typeof e.useADSR?!1:e.useADSR,i=t?new Gibberish.ADSR:new Gibberish.AD,s=i.getState,n=i.callback,r=new Gibberish.PWM,a=r.callback,o=(new Gibberish.OnePole).callback,h=Gibberish.makePanner(),u=this,c=0,l=[0,0];i.requireReleaseTrigger=e.requireReleaseTrigger||!1,this.callback=function(e,i,r,c,b,p,f,d,g,m,y,v,G,k){m=m>=1?.99999:m,e=o(e,1-m,m);var x,_;return t?(x=n(r,c,b,p,f,d,g),g&&(u.releaseTrigger=0),s()<4?(_=a(e,1,i,k)*x*y,1===v?_:h(_,G,l)):(_=l[0]=l[1]=0,1===v?_:l)):s()<2?(x=n(r,c),_=a(e,1,i,k)*x*y,1===v?_:h(_,G,l)):(_=l[0]=l[1]=0,1===v?_:l)},this.getEnv=function(){return i},this.getOsc=function(){return r},this.setOsc=function(e){r=e,a=r.callback};var b="PWM";Object.defineProperty(this,"waveform",{get:function(){return b},set:function(e){this.setOsc(new Gibberish[e])}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Synth.prototype=Gibberish._synth,Gibberish.PolySynth=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"polysynth",maxVoices:5,voiceCount:0,frequencies:[],_frequency:0,polyProperties:{frequency:0,glide:0,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,pulsewidth:.5,waveform:"PWM"},note:function(e,t){var i=this.frequencies.indexOf(e),s=i>-1?i:this.voiceCount++,n=this.children[s];n.note(e,t),-1===i?(this.frequencies[s]=e,this._frequency=e,this.voiceCount>=this.maxVoices&&(this.voiceCount=0)):delete this.frequencies[s]},initVoices:function(){for(var e=0;e<this.maxVoices;e++){var t={waveform:this.waveform,attack:this.attack,decay:this.decay,sustain:this.sustain,release:this.release,attackLevel:this.attackLevel,sustainLevel:this.sustainLevel,pulsewidth:this.pulsewidth,channels:2,amp:1,useADSR:this.useADSR||!1,requireReleaseTrigger:this.requireReleaseTrigger||!1},i=new Gibberish.Synth(t).connect(this);this.children.push(i)}}}),this.amp=1/this.maxVoices,this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices,this.useADSR="undefined"!=typeof arguments[0].useADSR?arguments[0].useADSR:!1,this.requireReleaseTrigger="undefined"!=typeof arguments[0].requireReleaseTrigger?arguments[0].requireReleaseTrigger:!1),Gibberish.polyInit(this),this.initVoices(),this.processProperties(arguments),Gibberish._synth.oscillatorInit.call(this)},Gibberish.Synth2=function(e){this.name="synth2",this.properties={frequency:0,pulsewidth:.5,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,releaseTrigger:0,cutoff:.25,resonance:3.5,useLowPassFilter:!0,glide:.15,amp:.25,channels:1,pan:0,sr:Gibberish.context.sampleRate},this.note=function(s,n){if(0!==n){if("object"!=typeof this.frequency){if(t&&s===l&&e.requireReleaseTrigger)return this.releaseTrigger=1,void(l=null);this.frequency=l=s,this.releaseTrigger=0}else this.frequency[0]=l=s,this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof n&&(this.amp=n),i.run()}else this.releaseTrigger=1},e=e||{};var t="undefined"==typeof e.useADSR?!1:e.useADSR,i=t?new Gibberish.ADSR:new Gibberish.AD,s=i.getState,n=i.callback,r=new Gibberish.PWM,a=r.callback,o=new Gibberish.Filter24,h=o.callback,u=(new Gibberish.OnePole).callback,c=Gibberish.makePanner(),l=0,b=this,p=[0,0];i.requireReleaseTrigger=e.requireReleaseTrigger||!1,this.callback=function(e,i,r,o,l,f,d,g,m,y,v,G,k,x,_,w,A){k=k>=1?.99999:k,e=u(e,1-k,k);var S,P;return t?(S=n(r,o,l,f,d,g,m),m&&(b.releaseTrigger=0),s()<4?(P=h(a(e,.15,i,A),y*S,v,G)*S*x,1===_?P:c(P,w,p)):(P=p[0]=p[1]=0,1===_?P:p)):s()<2?(S=n(r,o),P=h(a(e,.15,i,A),y*S,v,G)*S*x,1===_?P:c(P,w,p)):(P=p[0]=p[1]=0,1===_?P:p)},this.getUseADSR=function(){return t},this.getEnv=function(){return i},this.getOsc=function(){return r},this.setOsc=function(e){r=e,a=r.callback};var f="PWM";Object.defineProperty(this,"waveform",{get:function(){return f},set:function(e){this.setOsc(new Gibberish[e])}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Synth2.prototype=Gibberish._synth,Gibberish.PolySynth2=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"polysynth2",maxVoices:5,voiceCount:0,frequencies:[],_frequency:0,polyProperties:{frequency:0,glide:0,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,pulsewidth:.5,resonance:3.5,cutoff:.25,useLowPassFilter:!0,waveform:"PWM"},note:function(e,t){var i=this.frequencies.indexOf(e),s=i>-1?i:this.voiceCount++,n=this.children[s];n.note(e,t),-1===i?(this.frequencies[s]=e,this._frequency=e,this.voiceCount>=this.maxVoices&&(this.voiceCount=0)):delete this.frequencies[s]},initVoices:function(){this.dirty=!0;for(var e=0;e<this.maxVoices;e++){var t={attack:this.attack,decay:this.decay,sustain:this.sustain,release:this.release,attackLevel:this.attackLevel,sustainLevel:this.sustainLevel,pulsewidth:this.pulsewidth,channels:2,amp:1,useADSR:this.useADSR||!1,requireReleaseTrigger:this.requireReleaseTrigger||!1},i=new Gibberish.Synth2(t).connect(this);this.children.push(i)}}}),this.amp=1/this.maxVoices,this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices,this.useADSR="undefined"!=typeof arguments[0].useADSR?arguments[0].useADSR:!1,this.requireReleaseTrigger="undefined"!=typeof arguments[0].requireReleaseTrigger?arguments[0].requireReleaseTrigger:!1),Gibberish.polyInit(this),this.initVoices(),this.processProperties(arguments),Gibberish._synth.oscillatorInit.call(this)},Gibberish.FMSynth=function(e){this.name="fmSynth",this.properties={frequency:0,cmRatio:2,index:5,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,releaseTrigger:0,glide:.15,amp:.25,channels:2,pan:0},this.note=function(s,n){if(0!==n){if("object"!=typeof this.frequency){if(t&&s===l&&e.requireReleaseTrigger)return this.releaseTrigger=1,void(l=null);this.frequency=l=s,this.releaseTrigger=0}else this.frequency[0]=l=s,this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof n&&(this.amp=n),i.run()}else this.releaseTrigger=1},e=e||{};var t="undefined"==typeof e.useADSR?!1:e.useADSR,i=t?new Gibberish.ADSR:new Gibberish.AD,s=i.getState,n=i.callback,r=(new Gibberish.Sine).callback,a=(new Gibberish.Sine).callback,o=(new Gibberish.OnePole).callback,h=Gibberish.makePanner(),u=[0,0],c=this,l=0;i.requireReleaseTrigger=e.requireReleaseTrigger||!1,this.callback=function(e,i,l,b,p,f,d,g,m,y,v,G,k,x){var _,w,A;return v>=1&&(v=.9999),e=o(e,1-v,v),t?(_=n(b,p,f,d,g,m,y),y&&(c.releaseTrigger=0),s()<4?(A=a(e*i,e*l)*_,w=r(e+A,1)*_*G,1===k?w:h(w,x,u)):(w=u[0]=u[1]=0,1===k?w:u)):s()<2?(_=n(b,p),A=a(e*i,e*l)*_,w=r(e+A,1)*_*G,1===k?w:h(w,x,u)):(w=u[0]=u[1]=0,1===k?w:u)},this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.FMSynth.prototype=Gibberish._synth,Gibberish.PolyFM=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"polyfm",maxVoices:5,voiceCount:0,children:[],frequencies:[],_frequency:0,polyProperties:{glide:0,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,index:5,cmRatio:2},note:function(e,t){var i=this.frequencies.indexOf(e),s=i>-1?i:this.voiceCount++,n=this.children[s];n.note(e,t),-1===i?(this.frequencies[s]=e,this._frequency=e,this.voiceCount>=this.maxVoices&&(this.voiceCount=0)):delete this.frequencies[s]},initVoices:function(){for(var e=0;e<this.maxVoices;e++){var t={attack:this.attack,decay:this.decay,sustain:this.sustain,release:this.release,attackLevel:this.attackLevel,sustainLevel:this.sustainLevel,cmRatio:this.cmRatio,index:this.index,channels:2,useADSR:this.useADSR||!1,requireReleaseTrigger:this.requireReleaseTrigger||!1,amp:1},i=new Gibberish.FMSynth(t);i.connect(this),this.children.push(i)}}}),this.amp=1/this.maxVoices,this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices,this.useADSR="undefined"!=typeof arguments[0].useADSR?arguments[0].useADSR:!1,this.requireReleaseTrigger="undefined"!=typeof arguments[0].requireReleaseTrigger?arguments[0].requireReleaseTrigger:!1),Gibberish.polyInit(this),this.initVoices(),this.processProperties(arguments),Gibberish._synth.oscillatorInit.call(this)},Gibberish.Sampler=function(){function e(e){Gibberish.context.decodeAudioData(e,function(e){r=e.getChannelData(0),o.length=t=o.end=a=r.length,o.isPlaying=!0,o.buffers[o.file]=r,console.log("sample loaded | ",o.file," | length | ",a),Gibberish.audioFiles[o.file]=r,o.onload&&o.onload(),0!==o.playOnLoad&&o.note(o.playOnLoad),o.isLoaded=!0},function(e){console.log("Error decoding file",e)})}var t=1,i=Gibberish.interpolate,s=Gibberish.makePanner(),n=[0,0],r=null,a=1,o=this;if(Gibberish.extend(this,{name:"sampler",file:null,isLoaded:!1,playOnLoad:0,buffers:{},properties:{pitch:1,amp:1,isRecording:!1,isPlaying:!0,input:0,length:0,start:0,end:1,loops:0,pan:0},_onload:function(e){r=e.channels[0],a=e.length,o.end=a,o.length=t=a,o.isPlaying=!0,Gibberish.audioFiles[o.file]=r,o.buffers[o.file]=r,o.onload&&o.onload(),0!==o.playOnLoad&&o.note(o.playOnLoad),o.isLoaded=!0},switchBuffer:function(e){if("string"==typeof e)"undefined"!=typeof o.buffers[e]&&(r=o.buffers[e],a=o.end=o.length=r.length);else if("number"==typeof e){var t=Object.keys(o.buffers);if(0===t.length)return;r=o.buffers[t[e]],a=o.end=o.length=r.length}},floatTo16BitPCM:function(e,t,i){for(var s=0;s<i.length-1;s++,t+=2){var n=Math.max(-1,Math.min(1,i[s]));e.setInt16(t,0>n?32768*n:32767*n,!0)}},encodeWAV:function(){function e(e,t,i){for(var s=0;s<i.length;s++)e.setUint8(t+s,i.charCodeAt(s))}var t=this.getBuffer(),i=new ArrayBuffer(44+2*t.length),s=new DataView(i),n=Gibberish.context.sampleRate;return e(s,0,"RIFF"),s.setUint32(4,32+2*t.length,!0),e(s,8,"WAVE"),e(s,12,"fmt "),s.setUint32(16,16,!0),s.setUint16(20,1,!0),s.setUint16(22,1,!0),s.setUint32(24,n,!0),s.setUint32(28,4*n,!0),s.setUint16(32,2,!0),s.setUint16(34,16,!0),e(s,36,"data"),s.setUint32(40,2*t.length,!0),this.floatTo16BitPCM(s,44,t),s},download:function(){var e=this.encodeWAV(),t=new Blob([e]),i=window.webkitURL.createObjectURL(t),s=window.document.createElement("a");s.href=i,s.download="output.wav";var n=document.createEvent("Event");n.initEvent("click",!0,!0),s.dispatchEvent(n)},note:function(e,i){switch(typeof e){case"number":this.pitch=e;break;case"function":this.pitch=e();break;case"object":this.pitch=Array.isArray(e)?e[0]:e}if("number"==typeof i&&(this.amp=i),null!==this.function){this.isPlaying=!0;var s;switch(typeof this.pitch){case"number":s=this.pitch;break;case"function":s=this.pitch.getValue?this.pitch.getValue():this.pitch();break;case"object":s=Array.isArray(this.pitch)?this.pitch[0]:this.pitch.getValue?this.pitch.getValue():this.pitch.input.getValue(),"function"==typeof s&&(s=s())}t=s>0?this.start:this.end,Gibberish.dirty(this)}},getBuffer:function(){return r},setBuffer:function(e){r=e},getPhase:function(){return t},setPhase:function(e){t=e},getNumberOfBuffers:function(){return Object.keys(o.buffers).length-1},callback:function(e,a,o,h,u,c,l,b,p,f){var d=0;return t+=e,b>t&&t>0?(e>0?d=null!==r&&h?i(r,t):0:t>l?d=null!==r&&h?i(r,t):0:t=p?b:t,s(d*a,f,n)):(t=p&&e>0?l:t,t=p&&0>e?b:t,n[0]=n[1]=d,n)}}).init().oscillatorInit().processProperties(arguments),"undefined"!=typeof arguments[0]&&("string"==typeof arguments[0]?(this.file=arguments[0],this.pitch=0):"object"==typeof arguments[0]&&arguments[0].file&&(this.file=arguments[0].file)),"undefined"!=typeof Gibberish.audioFiles[this.file])r=Gibberish.audioFiles[this.file],this.end=this.bufferLength=r.length,this.buffers[this.file]=r,t=this.bufferLength,Gibberish.dirty(this),this.onload&&this.onload();else if(null!==this.file){var e,h=new XMLHttpRequest;h.open("GET",this.file,!0),h.responseType="arraybuffer",h.onload=function(){e(this.response)},h.send(),console.log("now loading sample",o.file),h.onerror=function(e){console.error("Sampler file loading error",e)}}else"undefined"!=typeof this.buffer&&(this.isLoaded=!0,r=this.buffer,this.end=this.bufferLength=r.length||88200,t=this.bufferLength,arguments[0]&&arguments[0].loops&&(this.loops=1),Gibberish.dirty(this),this.onload&&this.onload())},Gibberish.Sampler.prototype=Gibberish._oscillator,Gibberish.Sampler.prototype.record=function(e,t){this.isRecording=!0;var i=this;return this.recorder=new Gibberish.Record(e,t,function(){i.setBuffer(this.getBuffer()),i.end=bufferLength=i.getBuffer().length,i.setPhase(i.end),i.isRecording=!1}).record(),this},Gibberish.MonoSynth=function(){Gibberish.extend(this,{name:"monosynth",properties:{attack:1e4,decay:1e4,cutoff:.2,resonance:2.5,amp1:1,amp2:1,amp3:1,filterMult:.3,isLowPass:!0,pulsewidth:.5,amp:.6,detune2:.01,detune3:-.01,octave2:1,octave3:-1,glide:0,pan:0,frequency:0,channels:2},waveform:"Saw3",note:function(e,s){"undefined"!=typeof s&&0!==s&&(this.amp=s),0!==s&&("object"!=typeof this.frequency?this.frequency=e:(this.frequency[0]=e,Gibberish.dirty(this)),i()>0&&t.run())},_note:function(e,i){if("object"!=typeof this.frequency){if(useADSR&&e===lastFrequency&&0===i)return this.releaseTrigger=1,void(lastFrequency=null);0!==i&&(this.frequency=lastFrequency=e),this.releaseTrigger=0}else 0!==i&&(this.frequency[0]=lastFrequency=e),this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof i&&0!==i&&(this.amp=i),0!==i&&t.run()}});var e=this.waveform;Object.defineProperty(this,"waveform",{get:function(){return e},set:function(t){e!==t&&(e=t,r=(new Gibberish[t]).callback,a=(new Gibberish[t]).callback,o=(new Gibberish[t]).callback)}});var t=new Gibberish.AD(this.attack,this.decay),i=t.getState,s=t.callback,n=(new Gibberish.Filter24).callback,r=new Gibberish[this.waveform](this.frequency,this.amp1).callback,a=new Gibberish[this.waveform](this.frequency2,this.amp2).callback,o=new Gibberish[this.waveform](this.frequency3,this.amp3).callback,h=(new Gibberish.OnePole).callback,u=Gibberish.makePanner(),c=[0,0];this.envelope=t,this.callback=function(e,t,l,b,p,f,d,g,m,y,v,G,k,x,_,w,A,S,P){if(i()<2){w>=1&&(w=.9999),S=h(S,1-w,w);var R=S;if(x>0)for(var q=0;x>q;q++)R*=2;else if(0>x)for(var q=0;q>x;q--)R/=2;var M=S;if(_>0)for(var q=0;_>q;q++)M*=2;else if(0>_)for(var q=0;q>_;q--)M/=2;R+=G>0?(2*S-S)*G:(S-S/2)*G,M+=k>0?(2*S-S)*k:(S-S/2)*k;var C=r(S,p,y)+a(R,f,y)+o(M,d,y),T=s(e,t),I=n(C,l+g*T,b,m,1)*T;return I*=v,c[0]=c[1]=I,1===P?c:u(I,A,c)}return c[0]=c[1]=0,c},this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.MonoSynth.prototype=Gibberish._synth,Gibberish.Binops={"export":function(e){Gibberish.export("Binops",e||window)},operator:function(){var e=new Gibberish.ugen,t=arguments[0],i=Array.prototype.slice.call(arguments,1);e.name="op",e.properties={};for(var s=0;s<i.length;s++)e.properties[s]=i[s];return e.init.apply(e,i),e.codegen=function(){var e,i="( ";if("undefined"!=typeof Gibberish.memo[this.symbol])return Gibberish.memo[this.symbol];e=Object.keys(this.properties);for(var s=!1,n=0;n<e.length;n++)if(s)s=!1;else{var r="object"==typeof this[n];i+=r?this[n].codegen():this[n],"*"!==t&&"/"!==t||1!==this[n+1]?n<e.length-1&&(i+=" "+t+" "):s=!0}return i+=" )",this.codeblock=i,i},e.valueOf=function(){return e.codegen()},e},Add:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("+"),Gibberish.Binops.operator.apply(null,e)},Sub:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("-"),Gibberish.Binops.operator.apply(null,e)},Mul:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("*"),Gibberish.Binops.operator.apply(null,e)},Div:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("/"),Gibberish.Binops.operator.apply(null,e)},Mod:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("%"),Gibberish.Binops.operator.apply(null,e)},Abs:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"abs",properties:{},callback:Math.abs.bind(t)};return t.__proto__=new Gibberish.ugen,t.properties[0]=e[0],t.init(),t},Sqrt:function(){var e=(Array.prototype.slice.call(arguments,0),{name:"sqrt",properties:{},callback:Math.sqrt.bind(e)});return e.__proto__=new Gibberish.ugen,e.properties[i]=arguments[0],e.init(),e},Pow:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"pow",properties:{},callback:Math.pow.bind(t)};t.__proto__=new Gibberish.ugen;for(var i=0;i<e.length;i++)t.properties[i]=e[i];return t.init(),console.log(t.callback),t},Clamp:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"clamp",properties:{input:0,min:0,max:1},callback:function(e,t,i){return t>e?e=t:e>i&&(e=i),e}};return t.__proto__=new Gibberish.ugen,t.init(),t.processProperties(e),t},Merge:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"merge",properties:{},callback:function(e){return e[0]+e[1]}};t.__proto__=new Gibberish.ugen;for(var i=0;i<e.length;i++)t.properties[i]=e[i];return t.init(),t},Map:function(e,t,i,s,n,r,a){var o=Math.pow,h=0,u=0,c={name:"map",properties:{input:e,outputMin:t,outputMax:i,inputMin:s,inputMax:n,curve:r||h,wrap:a||!1},callback:function(e,t,i,s,n,r,a){var h,c=i-t,l=n-s,b=(e-s)/l;return b>1?b=a?b%1:1:0>b&&(b=a?1+b%1:0),h=0===r?t+b*c:t+o(b,1.5)*c,u=h,h},getValue:function(){return u},invert:function(){var e=c.outputMin;c.outputMin=c.outputMax,c.outputMax=e}};return c.__proto__=new Gibberish.ugen,c.init(),c}},Gibberish.Time={bpm:120,"export":function(e){Gibberish.export("Time",e||window)},ms:function(e){return e*Gibberish.context.sampleRate/1e3},seconds:function(e){return e*Gibberish.context.sampleRate},beats:function(e){return function(){var t=Gibberish.context.sampleRate/(Gibberish.Time.bpm/60);return t*e}}},Gibberish.Sequencer2=function(){var e=this,t=0;Gibberish.extend(this,{target:null,key:null,values:null,valuesIndex:0,durations:null,durationsIndex:0,nextTime:0,playOnce:!1,repeatCount:0,repeatTarget:null,isConnected:!0,keysAndValues:null,counts:{},properties:{rate:1,isRunning:!1,nextTime:0},offset:0,name:"seq",callback:function(i,s,n){if(s){if(t>=n){if(null!==e.values){if(e.target){var r=e.values[e.valuesIndex++];"function"==typeof r&&(r=r()),"function"==typeof e.target[e.key]?e.target[e.key](r):e.target[e.key]=r}else"function"==typeof e.values[e.valuesIndex]&&e.values[e.valuesIndex++]();e.valuesIndex>=e.values.length&&(e.valuesIndex=0)}else if(null!==e.keysAndValues)for(var a in e.keysAndValues){var o=e.counts[a]++,r=e.keysAndValues[a][o];"function"==typeof r&&(r=r()),"function"==typeof e.target[a]?e.target[a](r):e.target[a]=r,e.counts[a]>=e.keysAndValues[a].length&&(e.counts[a]=0),e.chose&&e.chose(a,o)}else"function"==typeof e.target[e.key]&&e.target[e.key]();if(t-=n,Array.isArray(e.durations)){var h=e.durations[e.durationsIndex++];e.nextTime="function"==typeof h?h():h,e.chose&&e.chose("durations",e.durationsIndex-1),e.durationsIndex>=e.durations.length&&(e.durationsIndex=0)}else{var h=e.durations;e.nextTime="function"==typeof h?h():h}return e.repeatTarget&&(e.repeatCount++,e.repeatCount===e.repeatTarget&&(e.isRunning=!1,e.repeatCount=0)),0}t+=i}return 0},start:function(e){return e||(t=0),this.isRunning=!0,this},stop:function(){return this.isRunning=!1,this},repeat:function(e){return this.repeatTarget=e,this},shuffle:function(){for(i in this.keysAndValues)this.shuffleArray(this.keysAndValues[i])},shuffleArray:function(e){for(var t,i,s=e.length;s;t=parseInt(Math.random()*s),i=e[--s],e[s]=e[t],e[t]=i);}}),this.init(arguments),this.processProperties(arguments);for(var i in this.keysAndValues)this.counts[i]=0;this.oscillatorInit(),t+=this.offset,this.connect()},Gibberish.Sequencer2.prototype=Gibberish._oscillator,Gibberish.Sequencer=function(){Gibberish.extend(this,{target:null,key:null,values:null,valuesIndex:0,durations:null,durationsIndex:0,nextTime:0,phase:0,isRunning:!1,playOnce:!1,repeatCount:0,repeatTarget:null,isConnected:!0,keysAndValues:null,counts:{},offset:0,name:"seq",tick:function(){if(this.isRunning){if(this.phase>=this.nextTime){if(null!==this.values){if(this.target){var e=this.values[this.valuesIndex++];if("function"==typeof e)try{e=e()}catch(t){console.error("ERROR: Can't execute function triggered by Sequencer:\n"+e.toString()),this.values.splice(this.valuesIndex-1,1),this.valuesIndex--}"function"==typeof this.target[this.key]?this.target[this.key](e):this.target[this.key]=e
}else if("function"==typeof this.values[this.valuesIndex])try{this.values[this.valuesIndex++]()}catch(t){console.error("ERROR: Can't execute function triggered by Sequencer:\n"+this.values[this.valuesIndex-1].toString()),this.values.splice(this.valuesIndex-1,1),this.valuesIndex--}this.valuesIndex>=this.values.length&&(this.valuesIndex=0)}else if(null!==this.keysAndValues)for(var i in this.keysAndValues){var s="function"==typeof this.keysAndValues[i].pick?this.keysAndValues[i].pick():this.counts[i]++,e=this.keysAndValues[i][s];if("function"==typeof e)try{e=e()}catch(t){console.error("ERROR: Can't execute function triggered by Sequencer:\n"+e.toString()),this.keysAndValues[i].splice(s,1),"function"!=typeof this.keysAndValues[i].pick&&this.counts[i]--}"function"==typeof this.target[i]?this.target[i](e):this.target[i]=e,this.counts[i]>=this.keysAndValues[i].length&&(this.counts[i]=0)}else"function"==typeof this.target[this.key]&&this.target[this.key]();if(this.phase-=this.nextTime,Array.isArray(this.durations)){var n="function"==typeof this.durations.pick?this.durations[this.durations.pick()]:this.durations[this.durationsIndex++];this.nextTime="function"==typeof n?n():n,this.durationsIndex>=this.durations.length&&(this.durationsIndex=0)}else{var n=this.durations;this.nextTime="function"==typeof n?n():n}return void(this.repeatTarget&&(this.repeatCount++,this.repeatCount===this.repeatTarget&&(this.isRunning=!1,this.repeatCount=0)))}this.phase++}},start:function(e){return e||(this.phase=this.offset),this.isRunning=!0,this},stop:function(){return this.isRunning=!1,this},repeat:function(e){return this.repeatTarget=e,this},shuffle:function(){for(e in this.keysAndValues)this.shuffleArray(this.keysAndValues[e])},shuffleArray:function(e){for(var t,i,s=e.length;s;t=parseInt(Math.random()*s),i=e[--s],e[s]=e[t],e[t]=i);},disconnect:function(){var e=Gibberish.sequencers.indexOf(this);Gibberish.sequencers.splice(e,1),this.isConnected=!1},connect:function(){return-1===Gibberish.sequencers.indexOf(this)&&Gibberish.sequencers.push(this),this.isConnected=!0,this}});for(var e in arguments[0])this[e]=arguments[0][e];for(var e in this.keysAndValues)this.counts[e]=0;this.connect(),this.phase+=this.offset},Gibberish.Sequencer.prototype=Gibberish._oscillator,Gibberish.PolySeq=function(){var e=this,t=0,i=function(e,t){return t>e?-1:e>t?1:0};Gibberish.extend(this,{seqs:[],timeline:{},playOnce:!1,repeatCount:0,repeatTarget:null,isConnected:!1,properties:{rate:1,isRunning:!1,nextTime:0},offset:0,autofire:[],name:"polyseq",getPhase:function(){return t},timeModifier:null,add:function(i){i.valuesIndex=i.durationsIndex=0,null===i.durations?(i.autofire=!0,e.autofire.push(i)):(e.seqs.push(i),"undefined"!=typeof e.timeline[t]?i.priority?e.timeline[t].unshift(i):e.timeline[t].push(i):e.timeline[t]=[i],e.nextTime=t),!e.scale||"frequency"!==i.key&&"note"!==i.key||e.applyScale&&e.applyScale(),i.shouldStop=!1},callback:function(s,n,r){var a;if(n){if(t>=r){var o=e.timeline[r],h=t-r;if("undefined"==typeof o)return;for(var u=0;u<o.length;u++){var c=o[u];if(!c.shouldStop){var l=c.values.pick?c.values.pick():c.valuesIndex++%c.values.length,b=c.values[l];if("function"==typeof b&&(b=b()),c.target&&("function"==typeof c.target[c.key]?c.target[c.key](b):c.target[c.key]=b),e.chose&&e.chose(c.key,l),Array.isArray(c.durations)){var l=c.durations.pick?c.durations.pick():c.durationsIndex++,p=c.durations[l];a="function"==typeof p?p():p,c.durationsIndex>=c.durations.length&&(c.durationsIndex=0),e.chose&&e.chose("durations",l)}else{var p=c.durations;a="function"==typeof p?p():p}var f;f=null!==e.timeModifier?e.timeModifier(a)+t:a+t,f-=h,a-=h,"undefined"==typeof e.timeline[f]?e.timeline[f]=[c]:c.priority?e.timeline[f].unshift(c):e.timeline[f].push(c)}}for(var u=0,d=e.autofire.length;d>u;u++){var c=e.autofire[u];if(!c.shouldStop){var l=c.values.pick?c.values.pick():c.valuesIndex++%c.values.length,b=c.values[l];"function"==typeof b&&(b=b()),c.target&&("function"==typeof c.target[c.key]?c.target[c.key](b):c.target[c.key]=b),e.chose&&e.chose(c.key,l)}}delete e.timeline[r];var g=Object.keys(e.timeline),m=g.length;if(m>1){for(var y=0;m>y;y++)g[y]=parseFloat(g[y]);g=g.sort(i),e.nextTime=g[0]}else e.nextTime=parseFloat(g[0])}t+=s}return 0},start:function(e,i){if(e&&this.offset){t=0,this.nextTime=this.offset;var s=""+this.offset;this.timeline={},this.timeline[s]=[];for(var n=0;n<this.seqs.length;n++){var r=this.seqs[n];r.valuesIndex=r.durationsIndex=r.shouldStop=0,this.timeline[s].push(r)}}else{t=0,this.nextTime=0,this.timeline={0:[]};for(var n=0;n<this.seqs.length;n++){var r=this.seqs[n];r.valuesIndex=r.durationsIndex=r.shouldStop=0,this.timeline[0].push(r)}}return this.isConnected||(this.connect(Gibberish.Master,i),this.isConnected=!0),this.isRunning=!0,this},stop:function(){return this.isRunning=!1,this.isConnected&&(this.disconnect(),this.isConnected=!1),this},repeat:function(e){return this.repeatTarget=e,this},shuffle:function(e){if("undefined"!=typeof e)for(var t=0;t<this.seqs.length;t++)this.seqs[t].key===e&&this.shuffleArray(this.seqs[t].values);else for(var t=0;t<this.seqs.length;t++)this.shuffleArray(this.seqs[t].values)},shuffleArray:function(e){for(var t,i,s=e.length;s;t=parseInt(Math.random()*s),i=e[--s],e[s]=e[t],e[t]=i);}}),this.init(arguments),this.processProperties(arguments),this.oscillatorInit()},Gibberish.PolySeq.prototype=Gibberish._oscillator;var _hasInput=!1;return"object"==typeof navigator&&(navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia),Gibberish.Input=function(){var e=[];_hasInput||createInput(),this.type=this.name="input",this.fx=new Array2,this.fx.parent=this,this.properties={input:"input",amp:.5,channels:1},this.callback=function(t,i,s){return 1===s?e=t*i:(e[0]=t[0]*i,e[1]=t[1]*i),e},this.init(arguments),this.processProperties(arguments)},Gibberish.Input.prototype=new Gibberish.ugen,Gibberish.Kick=function(){var e=!1,t=(new Gibberish.SVF).callback,i=(new Gibberish.SVF).callback,s=.2,n=.8;Gibberish.extend(this,{name:"kick",properties:{pitch:50,__decay:20,__tone:1e3,amp:2,sr:Gibberish.context.sampleRate},callback:function(s,n,r,a,o){var h=e?60:0;return h=t(h,s,n,2,o),h=i(h,r,.5,0,o),h*=a,e=!1,h},note:function(t,i,s,n){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.decay=i),"number"==typeof s&&(this.tone=s),"number"==typeof n&&(this.amp=n),e=!0}}).init().oscillatorInit(),Object.defineProperties(this,{decay:{get:function(){return s},set:function(e){s=e>1?1:e,this.__decay=100*s}},tone:{get:function(){return n},set:function(e){n=e>1?1:e,this.__tone=220+1400*e}}}),this.processProperties(arguments)},Gibberish.Kick.prototype=Gibberish._oscillator,Gibberish.Conga=function(){var e=!1,t=(new Gibberish.SVF).callback;Gibberish.extend(this,{name:"conga",properties:{pitch:190,amp:2,sr:Gibberish.context.sampleRate},callback:function(i,s,n){var r=e?60:0;return r=t(r,i,50,2,n),r*=s,e=!1,r},note:function(t,i){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.amp=i),e=!0}}).init().oscillatorInit(),this.processProperties(arguments)},Gibberish.Conga.prototype=Gibberish._oscillator,Gibberish.Clave=function(){var e=!1,t=new Gibberish.SVF,i=t.callback;Gibberish.extend(this,{name:"clave",properties:{pitch:2500,amp:1,sr:Gibberish.context.sampleRate},callback:function(t,s,n){var r=e?2:0;return r=i(r,t,5,2,n),r*=s,e=!1,r},note:function(t,i){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.amp=i),e=!0}}).init().oscillatorInit(),this.bpf=t,this.processProperties(arguments)},Gibberish.Clave.prototype=Gibberish._oscillator,Gibberish.Tom=function(){var e=!1,t=(new Gibberish.SVF).callback,i=(new Gibberish.SVF).callback,s=new Gibberish.ExponentialDecay,n=s.callback,r=Math.random;Gibberish.extend(this,{name:"tom",properties:{pitch:80,amp:.5,sr:Gibberish.context.sampleRate},callback:function(s,a,o){var h,u=e?60:0;return u=t(u,s,30,2,o),h=16*r()-8,h=h>0?h:0,h*=n(.05,11025),h=i(h,120,.5,0,o),u+=h,u*=a,e=!1,u},note:function(t,i){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.amp=i),s.trigger(),e=!0}}).init().oscillatorInit(),s.trigger(1),this.processProperties(arguments)},Gibberish.Tom.prototype=Gibberish._oscillator,Gibberish.Cowbell=function(){var e=new Gibberish.Square,t=new Gibberish.Square,i=e.callback,s=t.callback,n=new Gibberish.SVF({mode:2}),r=n.callback,a=new Gibberish.ExponentialDecay(.0025,10500),o=a.callback;Gibberish.extend(this,{name:"cowbell",properties:{amp:1,pitch:560,bpfFreq:1e3,bpfRez:3,decay:22050,decayCoeff:1e-4,sr:Gibberish.context.sampleRate},callback:function(e,t,n,a,h,u,c){var l;return l=i(t,1,1,0),l+=s(845,1,1,0),l=r(l,n,a,2,c),l*=o(u,h),l*=e},note:function(e){a.trigger(),e&&(this.decay=e)}}).init().oscillatorInit().processProperties(arguments),this.bpf=n,this.eg=a,a.trigger(1)},Gibberish.Cowbell.prototype=Gibberish._oscillator,Gibberish.Snare=function(){var e=(new Gibberish.SVF).callback,t=(new Gibberish.SVF).callback,i=(new Gibberish.SVF).callback,s=new Gibberish.ExponentialDecay(.0025,11025),n=s.callback,r=Math.random,a=0;Gibberish.extend(this,{name:"snare",properties:{cutoff:1e3,decay:11025,tune:0,snappy:.5,amp:1,sr:Gibberish.context.sampleRate},callback:function(s,o,h,u,c,l){var b,p,f=0,d=0;return f=n(.0025,o),f>.005&&(d=(2*r()-1)*f,d=i(d,s+1e3*h,.5,1,l),d*=u,d=d>0?d:0,a=f,b=e(a,180*(h+1),15,2,l),p=t(a,330*(h+1),15,2,l),d+=b,d+=.8*p,d*=c),d},note:function(e,t,i,n){"number"==typeof e&&(this.tune=e),"number"==typeof n&&(this.cutoff=n),"number"==typeof i&&(this.snappy=i),"number"==typeof t&&(this.amp=t),s.trigger()}}).init().oscillatorInit().processProperties(arguments),s.trigger(1)},Gibberish.Snare.prototype=Gibberish._oscillator,Gibberish.Hat=function(){{var e=new Gibberish.Square,t=new Gibberish.Square,i=new Gibberish.Square,s=new Gibberish.Square,n=new Gibberish.Square,r=new Gibberish.Square,a=e.callback,o=t.callback,h=i.callback,u=s.callback,c=n.callback,l=r.callback,b=new Gibberish.SVF({mode:2}),p=b.callback,f=new Gibberish.Filter24,d=f.callback,g=new Gibberish.ExponentialDecay(.0025,10500),m=g.callback,y=new Gibberish.ExponentialDecay(.1,7500);y.callback}Gibberish.extend(this,{name:"hat",properties:{amp:1,pitch:325,bpfFreq:7e3,bpfRez:2,hpfFreq:.975,hpfRez:0,decay:3500,decay2:3e3,sr:Gibberish.context.sampleRate},callback:function(e,t,i,s,n,r,b,f,g){var y;return y=a(t,1,.5,0),y+=o(1.4471*t,.75,1,0),y+=h(1.617*t,1,1,0),y+=u(1.9265*t,1,1,0),y+=c(2.5028*t,1,1,0),y+=l(2.6637*t,.75,1,0),y=p(y,i,s,2,g),y*=m(.001,b),y=d(y,n,r,0,1),y*=e},note:function(e,t){g.trigger(),y.trigger(),e&&(this.decay=e),t&&(this.decay2=t)}}).init().oscillatorInit().processProperties(arguments),this.bpf=b,this.hpf=f,g.trigger(1),y.trigger(1)},Gibberish.Hat.prototype=Gibberish._oscillator,Gibberish});
},{}],6:[function(_dereq_,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = _dereq_('base64-js')
var ieee754 = _dereq_('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":7,"ieee754":8}],7:[function(_dereq_,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],8:[function(_dereq_,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],9:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],10:[function(_dereq_,module,exports){
var http = module.exports;
var EventEmitter = _dereq_('events').EventEmitter;
var Request = _dereq_('./lib/request');
var url = _dereq_('url')

http.request = function (params, cb) {
    if (typeof params === 'string') {
        params = url.parse(params)
    }
    if (!params) params = {};
    if (!params.host && !params.port) {
        params.port = parseInt(window.location.port, 10);
    }
    if (!params.host && params.hostname) {
        params.host = params.hostname;
    }
    
    if (!params.scheme) params.scheme = window.location.protocol.split(':')[0];
    if (!params.host) {
        params.host = window.location.hostname || window.location.host;
    }
    if (/:/.test(params.host)) {
        if (!params.port) {
            params.port = params.host.split(':')[1];
        }
        params.host = params.host.split(':')[0];
    }
    if (!params.port) params.port = params.scheme == 'https' ? 443 : 80;
    
    var req = new Request(new xhrHttp, params);
    if (cb) req.on('response', cb);
    return req;
};

http.get = function (params, cb) {
    params.method = 'GET';
    var req = http.request(params, cb);
    req.end();
    return req;
};

http.Agent = function () {};
http.Agent.defaultMaxSockets = 4;

var xhrHttp = (function () {
    if (typeof window === 'undefined') {
        throw new Error('no window object present');
    }
    else if (window.XMLHttpRequest) {
        return window.XMLHttpRequest;
    }
    else if (window.ActiveXObject) {
        var axs = [
            'Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.3.0',
            'Microsoft.XMLHTTP'
        ];
        for (var i = 0; i < axs.length; i++) {
            try {
                var ax = new(window.ActiveXObject)(axs[i]);
                return function () {
                    if (ax) {
                        var ax_ = ax;
                        ax = null;
                        return ax_;
                    }
                    else {
                        return new(window.ActiveXObject)(axs[i]);
                    }
                };
            }
            catch (e) {}
        }
        throw new Error('ajax not supported in this browser')
    }
    else {
        throw new Error('ajax not supported in this browser');
    }
})();

http.STATUS_CODES = {
    100 : 'Continue',
    101 : 'Switching Protocols',
    102 : 'Processing',                 // RFC 2518, obsoleted by RFC 4918
    200 : 'OK',
    201 : 'Created',
    202 : 'Accepted',
    203 : 'Non-Authoritative Information',
    204 : 'No Content',
    205 : 'Reset Content',
    206 : 'Partial Content',
    207 : 'Multi-Status',               // RFC 4918
    300 : 'Multiple Choices',
    301 : 'Moved Permanently',
    302 : 'Moved Temporarily',
    303 : 'See Other',
    304 : 'Not Modified',
    305 : 'Use Proxy',
    307 : 'Temporary Redirect',
    400 : 'Bad Request',
    401 : 'Unauthorized',
    402 : 'Payment Required',
    403 : 'Forbidden',
    404 : 'Not Found',
    405 : 'Method Not Allowed',
    406 : 'Not Acceptable',
    407 : 'Proxy Authentication Required',
    408 : 'Request Time-out',
    409 : 'Conflict',
    410 : 'Gone',
    411 : 'Length Required',
    412 : 'Precondition Failed',
    413 : 'Request Entity Too Large',
    414 : 'Request-URI Too Large',
    415 : 'Unsupported Media Type',
    416 : 'Requested Range Not Satisfiable',
    417 : 'Expectation Failed',
    418 : 'I\'m a teapot',              // RFC 2324
    422 : 'Unprocessable Entity',       // RFC 4918
    423 : 'Locked',                     // RFC 4918
    424 : 'Failed Dependency',          // RFC 4918
    425 : 'Unordered Collection',       // RFC 4918
    426 : 'Upgrade Required',           // RFC 2817
    428 : 'Precondition Required',      // RFC 6585
    429 : 'Too Many Requests',          // RFC 6585
    431 : 'Request Header Fields Too Large',// RFC 6585
    500 : 'Internal Server Error',
    501 : 'Not Implemented',
    502 : 'Bad Gateway',
    503 : 'Service Unavailable',
    504 : 'Gateway Time-out',
    505 : 'HTTP Version Not Supported',
    506 : 'Variant Also Negotiates',    // RFC 2295
    507 : 'Insufficient Storage',       // RFC 4918
    509 : 'Bandwidth Limit Exceeded',
    510 : 'Not Extended',               // RFC 2774
    511 : 'Network Authentication Required' // RFC 6585
};
},{"./lib/request":11,"events":9,"url":28}],11:[function(_dereq_,module,exports){
var Stream = _dereq_('stream');
var Response = _dereq_('./response');
var Base64 = _dereq_('Base64');
var inherits = _dereq_('inherits');

var Request = module.exports = function (xhr, params) {
    var self = this;
    self.writable = true;
    self.xhr = xhr;
    self.body = [];
    
    self.uri = (params.scheme || 'http') + '://'
        + params.host
        + (params.port ? ':' + params.port : '')
        + (params.path || '/')
    ;
    
    if (typeof params.withCredentials === 'undefined') {
        params.withCredentials = true;
    }

    try { xhr.withCredentials = params.withCredentials }
    catch (e) {}
    
    xhr.open(
        params.method || 'GET',
        self.uri,
        true
    );

    self._headers = {};
    
    if (params.headers) {
        var keys = objectKeys(params.headers);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!self.isSafeRequestHeader(key)) continue;
            var value = params.headers[key];
            self.setHeader(key, value);
        }
    }
    
    if (params.auth) {
        //basic auth
        this.setHeader('Authorization', 'Basic ' + Base64.btoa(params.auth));
    }

    var res = new Response;
    res.on('close', function () {
        self.emit('close');
    });
    
    res.on('ready', function () {
        self.emit('response', res);
    });
    
    xhr.onreadystatechange = function () {
        // Fix for IE9 bug
        // SCRIPT575: Could not complete the operation due to error c00c023f
        // It happens when a request is aborted, calling the success callback anyway with readyState === 4
        if (xhr.__aborted) return;
        res.handle(xhr);
    };
};

inherits(Request, Stream);

Request.prototype.setHeader = function (key, value) {
    this._headers[key.toLowerCase()] = value
};

Request.prototype.getHeader = function (key) {
    return this._headers[key.toLowerCase()]
};

Request.prototype.removeHeader = function (key) {
    delete this._headers[key.toLowerCase()]
};

Request.prototype.write = function (s) {
    this.body.push(s);
};

Request.prototype.destroy = function (s) {
    this.xhr.__aborted = true;
    this.xhr.abort();
    this.emit('close');
};

Request.prototype.end = function (s) {
    if (s !== undefined) this.body.push(s);

    var keys = objectKeys(this._headers);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = this._headers[key];
        if (isArray(value)) {
            for (var j = 0; j < value.length; j++) {
                this.xhr.setRequestHeader(key, value[j]);
            }
        }
        else this.xhr.setRequestHeader(key, value)
    }

    if (this.body.length === 0) {
        this.xhr.send('');
    }
    else if (typeof this.body[0] === 'string') {
        this.xhr.send(this.body.join(''));
    }
    else if (isArray(this.body[0])) {
        var body = [];
        for (var i = 0; i < this.body.length; i++) {
            body.push.apply(body, this.body[i]);
        }
        this.xhr.send(body);
    }
    else if (/Array/.test(Object.prototype.toString.call(this.body[0]))) {
        var len = 0;
        for (var i = 0; i < this.body.length; i++) {
            len += this.body[i].length;
        }
        var body = new(this.body[0].constructor)(len);
        var k = 0;
        
        for (var i = 0; i < this.body.length; i++) {
            var b = this.body[i];
            for (var j = 0; j < b.length; j++) {
                body[k++] = b[j];
            }
        }
        this.xhr.send(body);
    }
    else {
        var body = '';
        for (var i = 0; i < this.body.length; i++) {
            body += this.body[i].toString();
        }
        this.xhr.send(body);
    }
};

// Taken from http://dxr.mozilla.org/mozilla/mozilla-central/content/base/src/nsXMLHttpRequest.cpp.html
Request.unsafeHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "content-transfer-encoding",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "via"
];

Request.prototype.isSafeRequestHeader = function (headerName) {
    if (!headerName) return false;
    return indexOf(Request.unsafeHeaders, headerName.toLowerCase()) === -1;
};

var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var indexOf = function (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (xs[i] === x) return i;
    }
    return -1;
};

},{"./response":12,"Base64":13,"inherits":14,"stream":21}],12:[function(_dereq_,module,exports){
var Stream = _dereq_('stream');
var util = _dereq_('util');

var Response = module.exports = function (res) {
    this.offset = 0;
    this.readable = true;
};

util.inherits(Response, Stream);

var capable = {
    streaming : true,
    status2 : true
};

function parseHeaders (res) {
    var lines = res.getAllResponseHeaders().split(/\r?\n/);
    var headers = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') continue;
        
        var m = line.match(/^([^:]+):\s*(.*)/);
        if (m) {
            var key = m[1].toLowerCase(), value = m[2];
            
            if (headers[key] !== undefined) {
            
                if (isArray(headers[key])) {
                    headers[key].push(value);
                }
                else {
                    headers[key] = [ headers[key], value ];
                }
            }
            else {
                headers[key] = value;
            }
        }
        else {
            headers[line] = true;
        }
    }
    return headers;
}

Response.prototype.getResponse = function (xhr) {
    var respType = String(xhr.responseType).toLowerCase();
    if (respType === 'blob') return xhr.responseBlob || xhr.response;
    if (respType === 'arraybuffer') return xhr.response;
    return xhr.responseText;
}

Response.prototype.getHeader = function (key) {
    return this.headers[key.toLowerCase()];
};

Response.prototype.handle = function (res) {
    if (res.readyState === 2 && capable.status2) {
        try {
            this.statusCode = res.status;
            this.headers = parseHeaders(res);
        }
        catch (err) {
            capable.status2 = false;
        }
        
        if (capable.status2) {
            this.emit('ready');
        }
    }
    else if (capable.streaming && res.readyState === 3) {
        try {
            if (!this.statusCode) {
                this.statusCode = res.status;
                this.headers = parseHeaders(res);
                this.emit('ready');
            }
        }
        catch (err) {}
        
        try {
            this._emitData(res);
        }
        catch (err) {
            capable.streaming = false;
        }
    }
    else if (res.readyState === 4) {
        if (!this.statusCode) {
            this.statusCode = res.status;
            this.emit('ready');
        }
        this._emitData(res);
        
        if (res.error) {
            this.emit('error', this.getResponse(res));
        }
        else this.emit('end');
        
        this.emit('close');
    }
};

Response.prototype._emitData = function (res) {
    var respBody = this.getResponse(res);
    if (respBody.toString().match(/ArrayBuffer/)) {
        this.emit('data', new Uint8Array(respBody, this.offset));
        this.offset = respBody.byteLength;
        return;
    }
    if (respBody.length > this.offset) {
        this.emit('data', respBody.slice(this.offset));
        this.offset = respBody.length;
    }
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

},{"stream":21,"util":30}],13:[function(_dereq_,module,exports){
;(function () {

  var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next input index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      input.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = input.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    input = input.replace(/=+$/, '');
    if (input.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = input.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

},{}],14:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],15:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],16:[function(_dereq_,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],17:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],18:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],19:[function(_dereq_,module,exports){
'use strict';

exports.decode = exports.parse = _dereq_('./decode');
exports.encode = exports.stringify = _dereq_('./encode');

},{"./decode":17,"./encode":18}],20:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

module.exports = Duplex;
var inherits = _dereq_('inherits');
var setImmediate = _dereq_('process/browser.js').nextTick;
var Readable = _dereq_('./readable.js');
var Writable = _dereq_('./writable.js');

inherits(Duplex, Readable);

Duplex.prototype.write = Writable.prototype.write;
Duplex.prototype.end = Writable.prototype.end;
Duplex.prototype._write = Writable.prototype._write;

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  var self = this;
  setImmediate(function () {
    self.end();
  });
}

},{"./readable.js":24,"./writable.js":26,"inherits":14,"process/browser.js":22}],21:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = _dereq_('events').EventEmitter;
var inherits = _dereq_('inherits');

inherits(Stream, EE);
Stream.Readable = _dereq_('./readable.js');
Stream.Writable = _dereq_('./writable.js');
Stream.Duplex = _dereq_('./duplex.js');
Stream.Transform = _dereq_('./transform.js');
Stream.PassThrough = _dereq_('./passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"./duplex.js":20,"./passthrough.js":23,"./readable.js":24,"./transform.js":25,"./writable.js":26,"events":9,"inherits":14}],22:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],23:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

module.exports = PassThrough;

var Transform = _dereq_('./transform.js');
var inherits = _dereq_('inherits');
inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./transform.js":25,"inherits":14}],24:[function(_dereq_,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Readable;
Readable.ReadableState = ReadableState;

var EE = _dereq_('events').EventEmitter;
var Stream = _dereq_('./index.js');
var Buffer = _dereq_('buffer').Buffer;
var setImmediate = _dereq_('process/browser.js').nextTick;
var StringDecoder;

var inherits = _dereq_('inherits');
inherits(Readable, Stream);

function ReadableState(options, stream) {
  options = options || {};

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = false;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // In streams that never have any data, and do push(null) right away,
  // the consumer can miss the 'end' event if they do some I/O before
  // consuming the stream.  So, we don't emit('end') until some reading
  // happens.
  this.calledRead = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;


  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = _dereq_('string_decoder').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (typeof chunk === 'string' && !state.objectMode) {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null || chunk === undefined) {
    state.reading = false;
    if (!state.ended)
      onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      // update the buffer info.
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront) {
        state.buffer.unshift(chunk);
      } else {
        state.reading = false;
        state.buffer.push(chunk);
      }

      if (state.needReadable)
        emitReadable(stream);

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}



// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = _dereq_('string_decoder').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
};

// Don't raise the hwm > 128MB
var MAX_HWM = 0x800000;
function roundUpToNextPowerOf2(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (isNaN(n) || n === null) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = roundUpToNextPowerOf2(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else
      return state.length;
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  var state = this._readableState;
  state.calledRead = true;
  var nOrig = n;

  if (typeof n !== 'number' || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0)
      endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;

  // if we currently have less than the highWaterMark, then also read some
  if (state.length - n <= state.highWaterMark)
    doRead = true;

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading)
    doRead = false;

  if (doRead) {
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read called its callback synchronously, then `reading`
  // will be false, and we need to re-evaluate how much data we
  // can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  var ret;
  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we happened to read() exactly the remaining amount in the
  // buffer, and the EOF has been seen at this point, then make sure
  // that we emit 'end' on the very next tick.
  if (state.ended && !state.endEmitted && state.length === 0)
    endReadable(this);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode &&
      !er) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.decoder && !state.ended) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // if we've ended and we have some data left, then emit
  // 'readable' now to make sure it gets picked up.
  if (state.length > 0)
    emitReadable(stream);
  else
    endReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (state.emittedReadable)
    return;

  state.emittedReadable = true;
  if (state.sync)
    setImmediate(function() {
      emitReadable_(stream);
    });
  else
    emitReadable_(stream);
}

function emitReadable_(stream) {
  stream.emit('readable');
}


// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    setImmediate(function() {
      maybeReadMore_(stream, state);
    });
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    setImmediate(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    if (readable !== src) return;
    cleanup();
  }

  function onend() {
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (!dest._writableState || dest._writableState.needDrain)
      ondrain();
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  // check for listeners before emit removes one-time listeners.
  var errListeners = EE.listenerCount(dest, 'error');
  function onerror(er) {
    unpipe();
    if (errListeners === 0 && EE.listenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  dest.once('error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    // the handler that waits for readable events after all
    // the data gets sucked out in flow.
    // This would be easier to follow with a .once() handler
    // in flow(), but that is too slow.
    this.on('readable', pipeOnReadable);

    state.flowing = true;
    setImmediate(function() {
      flow(src);
    });
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var dest = this;
    var state = src._readableState;
    state.awaitDrain--;
    if (state.awaitDrain === 0)
      flow(src);
  };
}

function flow(src) {
  var state = src._readableState;
  var chunk;
  state.awaitDrain = 0;

  function write(dest, i, list) {
    var written = dest.write(chunk);
    if (false === written) {
      state.awaitDrain++;
    }
  }

  while (state.pipesCount && null !== (chunk = src.read())) {

    if (state.pipesCount === 1)
      write(state.pipes, 0, null);
    else
      forEach(state.pipes, write);

    src.emit('data', chunk);

    // if anyone needs a drain, then we have to wait for that.
    if (state.awaitDrain > 0)
      return;
  }

  // if every destination was unpiped, either before entering this
  // function, or in the while loop, then stop flowing.
  //
  // NB: This is a pretty rare edge case.
  if (state.pipesCount === 0) {
    state.flowing = false;

    // if there were data event listeners added, then switch to old mode.
    if (EE.listenerCount(src, 'data') > 0)
      emitDataEvents(src);
    return;
  }

  // at this point, no one needed a drain, so we just ran out of data
  // on the next readable event, start it over again.
  state.ranOut = true;
}

function pipeOnReadable() {
  if (this._readableState.ranOut) {
    this._readableState.ranOut = false;
    flow(this);
  }
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data' && !this._readableState.flowing)
    emitDataEvents(this);

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        this.read(0);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  emitDataEvents(this);
  this.read(0);
  this.emit('resume');
};

Readable.prototype.pause = function() {
  emitDataEvents(this, true);
  this.emit('pause');
};

function emitDataEvents(stream, startPaused) {
  var state = stream._readableState;

  if (state.flowing) {
    // https://github.com/isaacs/readable-stream/issues/16
    throw new Error('Cannot switch to old mode now.');
  }

  var paused = startPaused || false;
  var readable = false;

  // convert to an old-style stream.
  stream.readable = true;
  stream.pipe = Stream.prototype.pipe;
  stream.on = stream.addListener = Stream.prototype.on;

  stream.on('readable', function() {
    readable = true;

    var c;
    while (!paused && (null !== (c = stream.read())))
      stream.emit('data', c);

    if (c === null) {
      readable = false;
      stream._readableState.needReadable = true;
    }
  });

  stream.pause = function() {
    paused = true;
    this.emit('pause');
  };

  stream.resume = function() {
    paused = false;
    if (readable)
      setImmediate(function() {
        stream.emit('readable');
      });
    else
      this.read(0);
    this.emit('resume');
  };

  // now make it start, just in case it hadn't already.
  stream.emit('readable');
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    if (state.decoder)
      chunk = state.decoder.write(chunk);
    if (!chunk || !state.objectMode && !chunk.length)
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (typeof stream[i] === 'function' &&
        typeof this[i] === 'undefined') {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }}(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, function (x) {
      return self.emit.apply(self, ev, x);
    });
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};



// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted && state.calledRead) {
    state.ended = true;
    setImmediate(function() {
      // Check that we didn't get one last unshift.
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit('end');
      }
    });
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,_dereq_("oMfpAn"))
},{"./index.js":21,"buffer":6,"events":9,"inherits":14,"oMfpAn":15,"process/browser.js":22,"string_decoder":27}],25:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

module.exports = Transform;

var Duplex = _dereq_('./duplex.js');
var inherits = _dereq_('inherits');
inherits(Transform, Duplex);


function TransformState(options, stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined)
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  var ts = this._transformState = new TransformState(options, this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  this.once('finish', function() {
    if ('function' === typeof this._flush)
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (ts.writechunk && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var rs = stream._readableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

},{"./duplex.js":20,"inherits":14}],26:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, cb), and it'll handle all
// the drain event emission and buffering.

module.exports = Writable;
Writable.WritableState = WritableState;

var isUint8Array = typeof Uint8Array !== 'undefined'
  ? function (x) { return x instanceof Uint8Array }
  : function (x) {
    return x && x.constructor && x.constructor.name === 'Uint8Array'
  }
;
var isArrayBuffer = typeof ArrayBuffer !== 'undefined'
  ? function (x) { return x instanceof ArrayBuffer }
  : function (x) {
    return x && x.constructor && x.constructor.name === 'ArrayBuffer'
  }
;

var inherits = _dereq_('inherits');
var Stream = _dereq_('./index.js');
var setImmediate = _dereq_('process/browser.js').nextTick;
var Buffer = _dereq_('buffer').Buffer;

inherits(Writable, Stream);

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
}

function WritableState(options, stream) {
  options = options || {};

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.buffer = [];
}

function Writable(options) {
  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Stream.Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, state, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  setImmediate(function() {
    cb(er);
  });
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    setImmediate(function() {
      cb(er);
    });
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (!Buffer.isBuffer(chunk) && isUint8Array(chunk))
    chunk = new Buffer(chunk);
  if (isArrayBuffer(chunk) && typeof Uint8Array !== 'undefined')
    chunk = new Buffer(new Uint8Array(chunk));
  
  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (typeof cb !== 'function')
    cb = function() {};

  if (state.ended)
    writeAfterEnd(this, state, cb);
  else if (validChunk(this, state, chunk, cb))
    ret = writeOrBuffer(this, state, chunk, encoding, cb);

  return ret;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      typeof chunk === 'string') {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  state.needDrain = !ret;

  if (state.writing)
    state.buffer.push(new WriteReq(chunk, encoding, cb));
  else
    doWrite(stream, state, len, chunk, encoding, cb);

  return ret;
}

function doWrite(stream, state, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  if (sync)
    setImmediate(function() {
      cb(er);
    });
  else
    cb(er);

  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(stream, state);

    if (!finished && !state.bufferProcessing && state.buffer.length)
      clearBuffer(stream, state);

    if (sync) {
      setImmediate(function() {
        afterWrite(stream, state, finished, cb);
      });
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  cb();
  if (finished)
    finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}


// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;

  for (var c = 0; c < state.buffer.length; c++) {
    var entry = state.buffer[c];
    var chunk = entry.chunk;
    var encoding = entry.encoding;
    var cb = entry.callback;
    var len = state.objectMode ? 1 : chunk.length;

    doWrite(stream, state, len, chunk, encoding, cb);

    // if we didn't call the onwrite immediately, then
    // it means that we need to wait until it does.
    // also, that means that the chunk and cb are currently
    // being processed, so move the buffer counter past them.
    if (state.writing) {
      c++;
      break;
    }
  }

  state.bufferProcessing = false;
  if (c < state.buffer.length)
    state.buffer = state.buffer.slice(c);
  else
    state.buffer.length = 0;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (typeof chunk !== 'undefined' && chunk !== null)
    this.write(chunk, encoding);

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(stream, state) {
  return (state.ending &&
          state.length === 0 &&
          !state.finished &&
          !state.writing);
}

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    state.finished = true;
    stream.emit('finish');
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      setImmediate(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

},{"./index.js":21,"buffer":6,"inherits":14,"process/browser.js":22}],27:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = _dereq_('buffer').Buffer;

function assertEncoding(encoding) {
  if (encoding && !Buffer.isEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  this.charBuffer = new Buffer(6);
  this.charReceived = 0;
  this.charLength = 0;
};


StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  var offset = 0;

  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var i = (buffer.length >= this.charLength - this.charReceived) ?
                this.charLength - this.charReceived :
                buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, offset, i);
    this.charReceived += (i - offset);
    offset = i;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (i == buffer.length) return charStr;

    // otherwise cut off the characters end from the beginning of this buffer
    buffer = buffer.slice(i, buffer.length);
    break;
  }

  var lenIncomplete = this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - lenIncomplete, end);
    this.charReceived = lenIncomplete;
    end -= lenIncomplete;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    this.charBuffer.write(charStr.charAt(charStr.length - 1), this.encoding);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }

  return i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  var incomplete = this.charReceived = buffer.length % 2;
  this.charLength = incomplete ? 2 : 0;
  return incomplete;
}

function base64DetectIncompleteChar(buffer) {
  var incomplete = this.charReceived = buffer.length % 3;
  this.charLength = incomplete ? 3 : 0;
  return incomplete;
}

},{"buffer":6}],28:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = _dereq_('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = _dereq_('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":16,"querystring":19}],29:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],30:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":29,"inherits":14,"oMfpAn":15}],31:[function(_dereq_,module,exports){
/*
 * Freesound Javascript SDK
 */
!function() { 

var freesound = module.exports = {
    BASE_URI : "http://www.freesound.org/api",
    apiKey : '',
    debug: false,
    _URI_SOUND : '/sounds/<sound_id>/',
    _URI_SOUND_ANALYSIS : '/sounds/<sound_id>/analysis/',
    _URI_SOUND_ANALYSIS_FILTER :'/sounds/<sound_id>/analysis/<filter>',
    _URI_SIMILAR_SOUNDS : '/sounds/<sound_id>/similar/',
    _URI_SEARCH : '/sounds/search/',
    _URI_CONTENT_SEARCH : '/sounds/content_search/',
    _URI_GEOTAG : '/sounds/geotag',
    _URI_USER : '/people/<user_name>/',
    _URI_USER_SOUNDS : '/people/<user_name>/sounds/',
    _URI_USER_PACKS : '/people/<user_name>/packs/',
    _URI_USER_BOOKMARKS : '/people/<username>/bookmark_categories',
    _URI_BOOKMARK_CATEGORY_SOUNDS : '/people/<username>/bookmark_categories/<category_id>/sounds',
    _URI_PACK : '/packs/<pack_id>/',
    _URI_PACK_SOUNDS : '/packs/<pack_id>/sounds/',

    _make_uri : function(uri,args){
        for (var a in args) {uri = uri.replace(/<[\w_]+>/, args[a]);}
        return this.BASE_URI+uri;
    },
    _make_request : function(uri,success,error,params,wrapper){
        var fs = this;

        if(uri.indexOf('?') == -1){ uri = uri+"?"; }
        uri = uri+"&api_key="+this.apiKey;
        for(var p in params){uri = uri+"&"+p+"="+params[p];}
        var xhr;
        try {xhr = new XMLHttpRequest();}
        catch (e) {xhr = new ActiveXObject('Microsoft.XMLHTTP');}
        xhr.onreadystatechange = function(){
            if (xhr.readyState == 4 && xhr.status == 200){
                var data = eval("(" + xhr.responseText + ")");
                success(wrapper?wrapper(data):data);
            }
            else if (xhr.readyState == 4 && xhr.status != 200){
                error();
            }
        };
        if(freesound.debug) console.log(uri);
        xhr.open('GET', uri);
        xhr.send(null);
    },
    _make_sound_object: function(snd){ // receives json object already "parsed" (via eval)
        snd.get_analysis = function(showAll, filter, success, error){
            var params = {all: showAll?1:0};
            var base_uri = filter? freesound._URI_SOUND_ANALYSIS_FILTER:freesound._URI_SOUND_ANALYSIS;
            freesound._make_request(freesound._make_uri(base_uri,[snd.id,filter?filter:""]),success,error);
        };
        snd.get_similar_sounds = function(success, error){
            freesound._make_request(
                freesound._make_uri(freesound._URI_SIMILAR_SOUNDS,[snd.id]),success,error,{},this._make_sound_collection_object);
        };
        return snd;
    },
    _make_sound_collection_object: function(col){
        var get_next_or_prev = function(which,success,error){
            freesound._make_request(which,success,error,{},this._make_sound_collection_object);
        };
        col.next_page = function(success,error){get_next_or_prev(this.next,success,error);};
        col.previous_page = function(success,error){get_next_or_prev(this.previous,success,error);};
        return col;
    },
    _make_user_object: function(user){ // receives json object already "parsed" (via eval)
        user.get_sounds = function(success, error){
            freesound._make_request(freesound._make_uri(freesound._URI_USER_SOUNDS,[user.username]),success,error,{},this._make_sound_collection_object);
        };
        user.get_packs = function(success, error){
            freesound._make_request(freesound._make_uri(freesound._URI_USER_PACKS,[user.username]),success,error,{},this._make_pack_collection_object);
        };
        user.get_bookmark_categories = function(success, error){
            freesound._make_request(freesound._make_uri(freesound._URI_USER_BOOKMARKS,[user.username]),success,error);
        };
        user.get_bookmark_category_sounds = function(ref, success, error){
            freesound._make_request(ref,success,error);
        };
        return user;
    },
    _make_pack_object: function(pack){ // receives json object already "parsed" (via eval)
        pack.get_sounds = function(success, error){
            freesound._make_request(freesound._make_uri(freesound._URI_PACK_SOUNDS,[pack.id]),success,error,{},this._make_sound_collection_object);
        };
        return pack;
    },
    _make_pack_collection_object: function(col){
        var get_next_or_prev = function(which,success,error){
            freesound._make_request(which,success,error,{},this._make_pack_collection_object);
        };
        col.next_page = function(success,error){get_next_or_prev(this.next,success,error);};
        col.previous_page = function(success,error){get_next_or_prev(this.previous,success,error);};
        return col;
    },
    /************* "Public" interface *****************/
    get_from_ref : function(ref, success,error){
        this._make_request(ref,success,error,{});
    },
    get_sound : function(soundId, success,error){
        this._make_request(this._make_uri(this._URI_SOUND,[soundId]),success,error,{},this._make_sound_object);
    },
    get_user : function(username, success,error){
        this._make_request(this._make_uri(this._URI_USER,[username]),success,error,{},this._make_user_object);
    },
    get_pack : function(packId, success,error){
        this._make_request(this._make_uri(this._URI_PACK,[packId]),success,error,{},this._make_pack_object);
    },
    quick_search : function(query,success,error){
        this.search(query,0,null,null,success,error);
    },
    search: function(query, page, filter, sort, num_results, fields, sounds_per_page, success, error){
        var params = {q:(query ? query : " ")};
        if(page)params.p=page;
        if(filter)params.f = filter;
        if(sort)params.s = sort;
        if(num_results)params.num_results = num_results;
        if(sounds_per_page)params.sounds_per_page = sounds_per_page;
        if(fields)params.fields = fields;
        this._make_request(this._make_uri(this._URI_SEARCH), success,error,params, this._make_sound_collection_object);
    },
    content_based_search: function(target, filter, max_results, fields, page, sounds_per_page, success, error){
        var params = {};
        if(page)params.p=page;
        if(filter)params.f = filter;
        if(target)params.t = target;
        if(max_results)params.max_results = max_results;
        if(sounds_per_page)params.sounds_per_page = sounds_per_page;
        if(fields)params.fields = fields;
        this._make_request(this._make_uri(this._URI_CONTENT_SEARCH), success,error,params, this._make_sound_collection_object);
    },
    geotag: function(min_lat, max_lat, min_lon, max_lon, page, fields, sounds_per_page, success, error){
        var params = {};
        if(min_lat)params.min_lat=min_lat;
        if(max_lat)params.max_lat=max_lat;
        if(min_lon)params.min_lon=min_lon;
        if(max_lon)params.max_lon=max_lon;
        if(page)params.p=page;
        if(sounds_per_page)params.sounds_per_page = sounds_per_page;
        if(fields)params.fields = fields;
        this._make_request(this._make_uri(this._URI_GEOTAG), success,error,params, this._make_sound_collection_object);
    }
};

}()
},{}],32:[function(_dereq_,module,exports){
(function () {

    var freesound = function () {        
        var authHeader = '';
        var clientId = '';
        var clientSecret = '';
        var host = 'freesound.org';

        var uris = {
            base : 'https://'+host+'/apiv2',
            textSearch : '/search/text/',
            contentSearch: '/search/content/',
            combinedSearch : '/sounds/search/combined/',
            sound : '/sounds/<sound_id>/',
            soundAnalysis : '/sounds/<sound_id>/analysis/',
            similarSounds : '/sounds/<sound_id>/similar/',
            comments : '/sounds/<sound_id>/comments/',
            download : '/sounds/<sound_id>/download/',
            upload : '/sounds/upload/',
            describe : '/sounds/<sound_id>/describe/',
            pending : '/sounds/pending_uploads/',
            bookmark : '/sounds/<sound_id>/bookmark/',
            rate : '/sounds/<sound_id>/rate/',
            comment : '/sounds/<sound_id>/comment/',
            authorize : '/oauth2/authorize/',
            logout : '/api-auth/logout/',
            logoutAuthorize : '/oauth2/logout_and_authorize/',
            me : '/me/',
            user : '/users/<username>/',
            userSounds : '/users/<username>/sounds/',
            userPacks : '/users/<username>/packs/',
            userBookmarkCategories : '/users/<username>/bookmark_categories/',
            userBookmarkCategorySounds : '/users/<username>/bookmark_categories/<category_id>/sounds/',
            pack : '/packs/<pack_id>/',
            packSounds : '/packs/<pack_id>/sounds/',
            packDownload : '/packs/<pack_id>/download/'            
        };
        
        var makeUri = function (uri, args){
            for (var a in args) {uri = uri.replace(/<[\w_]+>/, args[a]);}
            return uris.base+uri;
        };

        var makeRequest = function (uri, success, error, params, wrapper, method, data, content_type){
            if(method===undefined) method='GET';
            if(!error)error = function(e){console.log(e)};
            params = params || {};
            params['format'] = 'json';
            //params['api_key'] = '4287f0bacdcc492a8fae27fc3b228aaf';
            var fs = this;
            var parse_response = function (response){
                var data = eval("(" + response + ")");
                success(wrapper?wrapper(data):data);
            };                      
            var paramStr = "";
            for(var p in params){paramStr = paramStr+"&"+p+"="+params[p];}
            if (paramStr){
                uri = uri +"?"+ paramStr;
            }
            
            if (typeof module !== 'undefined'){ // node.js
                var http = _dereq_("http");
                var options = {
                    host: host,
                    path: uri.substring(uri.indexOf("/",8),uri.length), // first '/' after 'http://'
                    port: '80',
                    method: method,
                    headers: {'Authorization': authHeader},
                    withCredentials:false,
                };
                console.log( options )
                var req = http.request(options,function(res){
                    //res.setEncoding('utf8');            
                    res.on('data', function (data){ 
                        if([200,201,202].indexOf(res.statusCode)>=0)
                            success(wrapper?wrapper(data):data);
                        else   
                            error(data);
                    });                    
                });                
                req.on('error', error).end();
            }
            else{ // browser
                var xhr;
                try {xhr = new XMLHttpRequest();}
                catch (e) {xhr = new ActiveXObject('Microsoft.XMLHTTP');}

                xhr.onreadystatechange = function(){
                    if (xhr.readyState === 4 && [200,201,202].indexOf(xhr.status)>=0){
                        var data = eval("(" + xhr.responseText + ")");
                        if(success) success(wrapper?wrapper(data):data);
                    }
                    else if (xhr.readyState === 4 && xhr.status !== 200){
                        if(error) error(xhr.statusText);
                    }
                };
                xhr.open(method, uri);
                xhr.setRequestHeader('Authorization',authHeader);
                if(content_type!==undefined)
                    xhr.setRequestHeader('Content-Type',content_type);
                xhr.send(data);
            }
    };
    var checkOauth = function(){
        if(authHeader.indexOf("Bearer")==-1)
            throw("Oauth authentication required");
    };
        
    var makeFD = function(obj,fd){
        if(!fd)
            fd = new FormData(); 
        for (var prop in obj){
            fd.append(prop,obj[prop])
        }
        return fd;
    };
    
    var search = function(options, uri, success, error,wrapper){  
        if(options.analysis_file){ 
                makeRequest(makeUri(uri), success,error,null, wrapper, 'POST',makeFD(options));
        }
        else{
                makeRequest(makeUri(uri), success,error,options, wrapper);
        }    
    };
        
    var Collection = function (jsonObject){
        var nextOrPrev = function (which,success,error){
            makeRequest(which,success,error,{}, Collection);
        };        
        jsonObject.nextPage = function (success,error){
            nextOrPrev(jsonObject.next,success,error);
        };
        jsonObject.previousPage = function (success,error){
            nextOrPrev(jsonObject.previous,success,error);
        };
        jsonObject.getItem = function (idx){
            return jsonObject.results[idx];
        }
        
        return jsonObject;
    };  
        
    var SoundCollection = function(jsonObject){
        var collection = Collection(jsonObject);
        collection.getSound = function (idx){
            return new SoundObject(collection.results[idx]);
        };
        return collection;
    };
    
    var PackCollection = function(jsonObject){
        var collection = Collection(jsonObject);
        collection.getPack = function (idx){
            return new PackObject(collection.results[idx]);
        };   
        return collection;
    };
        
    var SoundObject = function (jsonObject){ 
        jsonObject.getAnalysis = function(filter, success, error, showAll){
            var params = {all: showAll?1:0};
            makeRequest(makeUri(uris.soundAnalysis,[jsonObject.id,filter?filter:""]),success,error);
        };

        jsonObject.getSimilar = function (success, error, params){
            makeRequest(makeUri(uris.similarSounds,[jsonObject.id]),success,error, params,SoundCollection);
        };
 
       jsonObject.getComments = function (success, error){
            makeRequest(makeUri(uris.comments,[jsonObject.id]),success,error,{},Collection);
       };

       jsonObject.download = function (targetWindow){// can be window, new, or iframe
            checkOauth();
            var uri = makeUri(uris.download,[jsonObject.id]);
            targetWindow.location = uri;
       };
       
	jsonObject.comment = function (commentStr, success, error){
            checkOauth();
            var data = new FormData();
            data.append('comment', comment);
            var uri = makeUri(uris.comment,[jsonObject.id]);
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };

        jsonObject.rate = function (rating, success, error){
            checkOauth();
            var data = new FormData();
            data.append('rating', rating);
            var uri = makeUri(uris.rate,[jsonObject.id]);
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };

        jsonObject.bookmark = function (name, category,success, error){
            checkOauth();
            var data = new FormData();
            data.append('name', name);
            if(category)
                data.append("category",category);
            var uri = makeUri(uris.bookmark,[jsonObject.id]);            
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };
        
        jsonObject.edit = function (description,success, error){
            checkOauth();
            var data = makeFD(description);
            var uri = makeUri(uris.edit,[jsonObject.id]);
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };        

        return jsonObject;
    };
    var UserObject = function(jsonObject){
        jsonObject.sounds = function (success, error, params){
            var uri = makeUri(uris.userSounds,[jsonObject.username]);
            makeRequest(uri, success, error,params,SoundCollection);            
        };

        jsonObject.packs = function (success, error){
            var uri = makeUri(uris.userPacks,[jsonObject.username]);
            makeRequest(uri, success, error,{},PackCollection);                    
        };

        jsonObject.bookmarkCategories = function (success, error){
            var uri = makeUri(uris.userBookmarkCategories,[jsonObject.username]);
            makeRequest(uri, success, error);                    
        };

        jsonObject.bookmarkCategorySounds = function (success, error,params){
            var uri = makeUri(uris.userBookmarkCategorySounds,[jsonObject.username]);
            makeRequest(uri, success, error,params);                    
        };

        return jsonObject;
    };
        
    var PackObject = function(jsonObject){
        jsonObject.sounds = function (success, error){
            var uri = makeUri(uris.packSounds,[jsonObject.id]);
            makeRequest(uri, success, error,{},SoundCollection);            
        };
        
        jsonObject.download = function (targetWindow){// can be current or new window, or iframe
            checkOauth();
            var uri = makeUri(uris.packDownload,[jsonObject.id]);
            targetWindow.location = uri;
        };                
        return jsonObject;
    };
                
    return {
            // authentication
            setToken: function (token, type) {
                authHeader = (type==='oauth' ? 'Bearer ':'Token ')+token;
            },
            setClientSecrets: function(id,secret){
                clientId = id;
                clientSecret = secret;
            },

            postAccessCode: function(code, success, error){
                var post_url = uris.base+"/oauth2/access_token/"
                var data = new FormData();
                data.append('client_id',clientId);
                data.append('client_secret',clientSecret);
                data.append('code',code);
                data.append('grant_type','authorization_code');
                                
                if (!success){
                    success = function(result){
                        setToken(result.access_token,'oauth');                        
                    }
                }
                makeRequest(post_url, success, error, {}, null, 'POST', data);
            },
            textSearch: function(query, options, success, error){                
                options = options || {};
                options.query = query ? query : " ";
                search(options,uris.textSearch,success,error,SoundCollection);
            },                    
            contentSearch: function(options, success, error){
                if(!(options.target || options.analysis_file))
                   throw("Missing target or analysis_file");
                search(options,uris.contentSearch,success,error,SoundCollection);
            },
            combinedSearch:function(options, success, error){
               if(!(options.target || options.analysis_file || options.query))
                   throw("Missing query, target or analysis_file");
                search(options,uris.contentSearch,success,error);
            },
            getSound: function(soundId,success, error){
                makeRequest(makeUri(uris.sound, [soundId]), success,error,{}, SoundObject);
            },

            upload: function(audiofile,filename, description, success,error){
                checkOauth();
                var fd = new FormData();
                fd.append('audiofile', audiofile,filename);                    
                if(description){                    
                    fd = makeFD(description,fd);
                }
                makeRequest(makeUri(uris.upload), success, error, {}, null, 'POST', fd);
            },
            describe: function(upload_filename , description, license, tags, success,error){
                checkOauth();                
                var fd = makeFD(description);
                makeRequest(makeUri(uris.upload), success, error, {}, null, 'POST', fd);
            },

            getPendingSounds: function(success,error){
                checkOauth();
                makeRequest(makeUri(uris.pending), success,error,{});
            },

            // user resources
            me: function(success,error){
                checkOauth();
                makeRequest(makeUri(uris.me), success,error);
            },

            getLoginURL: function(){
                    if(clientId===undefined) throw "client_id was not set"
                    var login_url = makeUri(uris.authorize);
                    login_url += "?client_id="+clientId+"&response_type=code";
                    return login_url;
            },
            getLogoutURL: function(){
                var logout_url = makeUri(uris.logoutAuthorize);
                logout_url += "?client_id="+clientId+"&response_type=code";
                
                return logout_url;
            },

            getUser: function(username, success,error){
                makeRequest(makeUri(uris.user, [username]), success,error,{}, UserObject);
            },
        
            getPack: function(packId,success,error){                
                makeRequest(makeUri(uris.pack, [packId]), success,error,{}, PackObject);            
            }        
        }    
    };

    // compatible with CommonJS (node), AMD (requireJS) failing back to browser global 
    // working with node requires web-audio-api module
    if (typeof module !== 'undefined') {module.exports = freesound(); }
    else if (typeof define === 'function' && typeof define.amd === 'object') { define("freesound", [], freesound); }
    else {this.freesound = freesound(); }
}());
},{"http":10}],33:[function(_dereq_,module,exports){
(function(){function t(t,e){return t=r[t],e=r[e],t.distance>e.distance?e.distance+12-t.distance:e.distance-t.distance}function e(t,e,i){for(;i>0;i--)t+=e;return t}function i(t,e){if("string"!=typeof t)return null;this.name=t,this.duration=e||4,this.accidental={value:0,sign:""};var i=t.match(/^([abcdefgh])(x|#|bb|b?)(-?\d*)/i);if(i&&t===i[0]&&0!==i[3].length)this.name=i[1].toLowerCase(),this.octave=parseFloat(i[3]),0!==i[2].length&&(this.accidental.sign=i[2].toLowerCase(),this.accidental.value=y[i[2]]);else{t=t.replace(/\u2032/g,"'").replace(/\u0375/g,",");var n=t.match(/^(,*)([abcdefgh])(x|#|bb|b?)([,\']*)$/i);if(!n||5!==n.length||t!==n[0])throw Error("Invalid note format");if(""===n[1]&&""===n[4])this.octave=n[2]===n[2].toLowerCase()?3:2;else if(""!==n[1]&&""===n[4]){if(n[2]===n[2].toLowerCase())throw Error("Invalid note format. Format must respect the Helmholtz notation.");this.octave=2-n[1].length}else{if(""!==n[1]||""===n[4])throw Error("Invalid note format");if(n[4].match(/^'+$/)){if(n[2]===n[2].toUpperCase())throw Error("Invalid note format. Format must respect the Helmholtz notation");this.octave=3+n[4].length}else{if(!n[4].match(/^,+$/))throw Error("Invalid characters after note name.");if(n[2]===n[2].toLowerCase())throw Error("Invalid note format. Format must respect the Helmholtz notation");this.octave=2-n[4].length}}this.name=n[2].toLowerCase(),0!==n[3].length&&(this.accidental.sign=n[3].toLowerCase(),this.accidental.value=y[n[3]])}}function n(t,e){if(!(t instanceof i))return null;e=e||"",this.name=t.name.toUpperCase()+t.accidental.sign+e,this.root=t,this.notes=[t],this.quality="major",this.type="major";var n,r,o,s,h,m=[],u=!1,c="quality",d=!1,p=!1,v=null;for(s=0,h=e.length;h>s;s++){for(n=e[s];" "===n||"("===n||")"===n;)n=e[++s];if(!n)break;if(r=n.charCodeAt(0),o=h>=s+3?e.substr(s,3):"","quality"===c)"M"===n||("maj"===o||916===r?(this.type="major",m.push("M7"),u=!0,(e[s+3]&&"7"===e[s+3]||916===r&&"7"===e[s+1])&&s++):"m"===n||"-"===n||"min"===o?this.quality=this.type="minor":111===r||176===r||"dim"===o?(this.quality="minor",this.type="diminished"):"+"===n||"aug"===o?(this.quality="major",this.type="augmented"):216===r||248===r?(this.quality="minor",this.type="diminished",m.push("m7"),u=!0):"sus"===o?(this.quality="sus",this.type=e[s+3]&&"2"===e[s+3]?"sus2":"sus4"):"5"===n?(this.quality="power",this.type="power"):s-=1),o in l&&(s+=2),c="";else if("#"===n)d=!0;else if("b"===n)p=!0;else if("5"===n)d?(v="A5","major"===this.quality&&(this.type="augmented")):p&&(v="d5","minor"===this.quality&&(this.type="diminished")),p=d=!1;else if("6"===n)m.push("M6"),p=d=!1;else if("7"===n)"diminished"===this.type?m.push("d7"):m.push("m7"),u=!0,p=d=!1;else if("9"===n)u||m.push("m7"),p?m.push("m9"):d?m.push("A9"):m.push("M9"),p=d=!1;else{if("1"!==n)throw Error("Unexpected character: '"+n+"' in chord name");n=e[++s],"1"===n?p?m.push("d11"):d?m.push("A11"):m.push("P11"):"3"===n&&(p?m.push("m13"):d?m.push("A13"):m.push("M13")),p=d=!1}}for(var y=0,g=f[this.type].length;g>y;y++)"5"===f[this.type][y][1]&&v?this.notes.push(a.interval(this.root,v)):this.notes.push(a.interval(this.root,f[this.type][y]));for(y=0,g=m.length;g>y;y++)this.notes.push(a.interval(this.root,m[y]))}var a={},r={c:{name:"c",distance:0,index:0},d:{name:"d",distance:2,index:1},e:{name:"e",distance:4,index:2},f:{name:"f",distance:5,index:3},g:{name:"g",distance:7,index:4},a:{name:"a",distance:9,index:5},b:{name:"b",distance:11,index:6},h:{name:"h",distance:11,index:6}},o=["c","d","e","f","g","a","b"],s={.25:"longa",.5:"breve",1:"whole",2:"half",4:"quarter",8:"eighth",16:"sixteenth",32:"thirty-second",64:"sixty-fourth",128:"hundred-twenty-eighth"},h=[{name:"unison",quality:"perfect",size:0},{name:"second",quality:"minor",size:1},{name:"third",quality:"minor",size:3},{name:"fourth",quality:"perfect",size:5},{name:"fifth",quality:"perfect",size:7},{name:"sixth",quality:"minor",size:8},{name:"seventh",quality:"minor",size:10},{name:"octave",quality:"perfect",size:12},{name:"ninth",quality:"minor",size:13},{name:"tenth",quality:"minor",size:15},{name:"eleventh",quality:"perfect",size:17},{name:"twelfth",quality:"perfect",size:19},{name:"thirteenth",quality:"minor",size:20},{name:"fourteenth",quality:"minor",size:22},{name:"fifteenth",quality:"perfect",size:24}],m={unison:0,second:1,third:2,fourth:3,fifth:4,sixth:5,seventh:6,octave:7,ninth:8,tenth:9,eleventh:10,twelfth:11,thirteenth:12,fourteenth:13,fifteenth:14},l={P:"perfect",M:"major",m:"minor",A:"augmented",d:"diminished",perf:"perfect",maj:"major",min:"minor",aug:"augmented",dim:"diminished"},u={perfect:"P",major:"M",minor:"m",augmented:"A",diminished:"d"},c={P:"P",M:"m",m:"M",A:"d",d:"A"},d={perfect:["diminished","perfect","augmented"],minor:["diminished","minor","major","augmented"]},f={major:["M3","P5"],minor:["m3","P5"],augmented:["M3","A5"],diminished:["m3","d5"],sus2:["M2","P5"],sus4:["P4","P5"],power:["P5"]},p={major:"M",minor:"m",augmented:"aug",diminished:"dim",power:"5"},v={"-2":"bb","-1":"b",0:"",1:"#",2:"x"},y={bb:-2,b:-1,"#":1,x:2};i.prototype={key:function(t){return t?7*(this.octave-1)+3+Math.ceil(r[this.name].distance/2):12*(this.octave-1)+4+r[this.name].distance+this.accidental.value},fq:function(t){return t=t||440,t*Math.pow(2,(this.key()-49)/12)},scale:function(t,e){return a.scale.list(this,t,e)},interval:function(t,e){return a.interval(this,t,e)},chord:function(t){return t=t||"major",t in p&&(t=p[t]),new n(this,t)},helmholtz:function(){var t,i=3>this.octave?this.name.toUpperCase():this.name.toLowerCase();return 2>=this.octave?(t=e("",",",2-this.octave),t+i+this.accidental.sign):(t=e("","'",this.octave-3),i+this.accidental.sign+t)},scientific:function(){return this.name.toUpperCase()+this.accidental.sign+("number"==typeof this.octave?this.octave:"")},enharmonics:function(){var t=[],e=this.key(),i=this.interval("m2","up"),n=this.interval("m2","down"),a=i.key()-i.accidental.value,r=n.key()-n.accidental.value,o=e-a;return 3>o&&o>-3&&(i.accidental={value:o,sign:v[o]},t.push(i)),o=e-r,3>o&&o>-3&&(n.accidental={value:o,sign:v[o]},t.push(n)),t},valueName:function(){return s[this.duration]},toString:function(t){return t="boolean"==typeof t?t:"number"==typeof this.octave?!1:!0,this.name.toLowerCase()+this.accidental.sign+(t?"":this.octave)}},n.prototype.dominant=function(t){return t=t||"",new n(this.root.interval("P5"),t)},n.prototype.subdominant=function(t){return t=t||"",new n(this.root.interval("P4"),t)},n.prototype.parallel=function(t){if(t=t||"","triad"!==this.chordType()||"diminished"===this.quality||"augmented"===this.quality)throw Error("Only major/minor triads have parallel chords");return"major"===this.quality?new n(this.root.interval("m3","down"),"m"):new n(this.root.interval("m3","up"))},n.prototype.chordType=function(){var t,e,i;if(2===this.notes.length)return"dyad";if(3===this.notes.length){e={unison:!1,third:!1,fifth:!1};for(var n=0,r=this.notes.length;r>n;n++)t=this.root.interval(this.notes[n]),i=h[parseFloat(a.interval.invert(t.simple)[1])-1],t.name in e?e[t.name]=!0:i.name in e&&(e[i.name]=!0);return e.unison&&e.third&&e.fifth?"triad":"trichord"}if(4===this.notes.length){e={unison:!1,third:!1,fifth:!1,seventh:!1};for(var n=0,r=this.notes.length;r>n;n++)t=this.root.interval(this.notes[n]),i=h[parseFloat(a.interval.invert(t.simple)[1])-1],t.name in e?e[t.name]=!0:i.name in e&&(e[i.name]=!0);if(e.unison&&e.third&&e.fifth&&e.seventh)return"tetrad"}return"unknown"},n.prototype.toString=function(){return this.name},a.note=function(t,e){return new i(t,e)},a.note.fromKey=function(t){var e=440*Math.pow(2,(t-49)/12);return a.frequency.note(e).note},a.chord=function(t){var e;if(e=t.match(/^([abcdefgh])(x|#|bb|b?)/i),e&&e[0])return new n(new i(e[0].toLowerCase()),t.substr(e[0].length));throw Error("Invalid Chord. Couldn't find note name")},a.frequency={note:function(t,e){e=e||440;var n,a,s,h,m,l,u;return n=Math.round(49+12*((Math.log(t)-Math.log(e))/Math.log(2))),u=e*Math.pow(2,(n-49)/12),l=1200*(Math.log(t/u)/Math.log(2)),a=Math.floor((n-4)/12),s=n-12*a-4,h=r[o[Math.round(s/2)]],m=h.name,s>h.distance?m+="#":h.distance>s&&(m+="b"),{note:new i(m+(a+1)),cents:l}}},a.interval=function(t,e,n){if("string"==typeof e){"down"===n&&(e=a.interval.invert(e));var r=l[e[0]],o=parseFloat(e.substr(1));if(!r||isNaN(o)||1>o)throw Error("Invalid string-interval format");return a.interval.from(t,{quality:r,interval:h[o-1].name},n)}if(e instanceof i&&t instanceof i)return a.interval.between(t,e);throw Error("Invalid parameters")},a.interval.from=function(e,n,a){n.direction=a||n.direction||"up";var s,l,u,c,f,p;if(f=m[n.interval],p=h[f],f>7&&(f-=7),f=r[e.name].index+f,f>o.length-1&&(f-=o.length),s=o[f],-1===d[p.quality].indexOf(n.quality)||-1===d[p.quality].indexOf(p.quality))throw Error("Invalid interval quality");return l=d[p.quality].indexOf(n.quality)-d[p.quality].indexOf(p.quality),u=p.size+l-t(e.name,s),e.octave&&(c=Math.floor((e.key()-e.accidental.value+t(e.name,s)-4)/12)+1+Math.floor(m[n.interval]/7)),u+=e.accidental.value,u>=11&&(u-=12),u>-3&&3>u&&(s+=v[u]),"down"===a&&c--,new i(s+(c||""))},a.interval.between=function(t,e){var i,n,a,o,s,m,l=t.key(),c=e.key();if(i=c-l,i>24||-25>i)throw Error("Too big interval. Highest interval is a augmented fifteenth (25 semitones)");return 0>i&&(o=t,t=e,e=o),a=r[e.name].index-r[t.name].index+7*(e.octave-t.octave),n=h[a],m=d[n.quality][Math.abs(i)-n.size+1],s=u[m]+(""+Number(a+1)),{name:n.name,quality:m,direction:i>0?"up":"down",simple:s}},a.interval.invert=function(t){if(2!==t.length&&3!==t.length)return!1;var e=c[t[0]],i=2===t.length?parseFloat(t[1]):parseFloat(t.substr(1));return i>8&&(i-=7),8!==i&&1!==i&&(i=9-i),e+(""+i)},a.scale={list:function(t,e,n){var r,o,s=[],h=[];if(!(t instanceof i))return!1;if("string"==typeof e&&(e=a.scale.scales[e],!e))return!1;for(s.push(t),n&&h.push(t.name+(t.accidental.sign||"")),r=0,o=e.length;o>r;r++)s.push(a.interval(t,e[r])),n&&h.push(s[r+1].name+(s[r+1].accidental.sign||""));return n?h:s},scales:{major:["M2","M3","P4","P5","M6","M7"],ionian:["M2","M3","P4","P5","M6","M7"],dorian:["M2","m3","P4","P5","M6","m7"],phrygian:["m2","m3","P4","P5","m6","m7"],lydian:["M2","M3","A4","P5","M6","M7"],mixolydian:["M2","M3","P4","P5","M6","m7"],minor:["M2","m3","P4","P5","m6","m7"],aeolian:["M2","m3","P4","P5","m6","m7"],locrian:["m2","m3","P4","d5","m6","m7"],majorpentatonic:["M2","M3","P5","M6"],minorpentatonic:["m3","P4","P5","m7"],chromatic:["m2","M2","m3","M3","P4","A4","P5","m6","M6","m7","M7"],harmonicchromatic:["m2","M2","m3","M3","P4","A4","P5","m6","M6","m7","M7"]}},module.exports=a})();
},{}],34:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  
"use strict"

var times = [],
    $ = Gibber.dollar,
    Gibberish = _dereq_( 'gibberish-dsp' ),
    Audio

Audio = {
  // can't name export as Gibberish has the same name
  export: function( target ) {
    $.extend( target, Audio.Busses )       
    $.extend( target, Audio.Oscillators )
    $.extend( target, Audio.Synths )
    $.extend( target, Audio.Percussion )
    $.extend( target, Audio.Envelopes )
    $.extend( target, Audio.FX )
    $.extend( target, Audio.Seqs )    
    $.extend( target, Audio.Samplers )
    $.extend( target, Audio.PostProcessing )
    $.extend( target, Audio.Vocoder )
    
    target.Theory = Audio.Theory
    $.extend( target, Audio.Analysis ) 
    
    // target.future = Gibber.Utilities.future
    // target.solo = Gibber.Utilities.solo    
    target.Score = Audio.Score
		target.Clock = Audio.Clock
    target.Seq = Audio.Seqs.Seq
    target.Arp = Audio.Arp // move Arp to sequencers?
    target.ScaleSeq = Audio.Seqs.ScaleSeq
    target.SoundFont = Audio.SoundFont
    target.Speak = Audio.Speak
    target.Additive = Audio.Additive
    target.Ugen = Audio.Ugen
    
    target.Rndi = Audio.Core.Rndi
    target.Rndf = Audio.Core.Rndf     
    target.rndi = Audio.Core.rndi
    target.rndf = Audio.Core.rndf
    
    target.Input = Audio.Input
    
    target.Freesound = Audio.Freesound
    target.Freesound2 = Audio.Freesound2
    target.Freesoundjs2 = Audio.Freesoundjs2
    
    target.Scale = Audio.Theory.Scale
    
    target.Ensemble = Audio.Ensemble

		target.module = Gibber.import
    // target.ms = Audio.Time.ms
    // target.seconds = target.sec = Audio.Time.seconds
    // target.minutes = target.min = Audio.Time.minutes
    Audio.Core.Time.export( target )
    Audio.Clock.export( target )
    //target.sec = target.seconds
    Audio.Core.Binops.export( target )
    
    target.Master = Audio.Master    
  },
  init: function() {
    // post-processing depends on having context instantiated
    var __onstart = null
    if( Audio.onstart ) __onstart = Audio.onstart
    
    if( !Audio.context ) { Audio.context = { sampleRate:44100 } }
    
    Audio.Core.onstart = function() {
      Audio.Clock.start( true )
              
      if( __onstart !== null ) { __onstart() }
    }
    
    Audio.Score = Audio.Score( Gibber )
    Audio.Additive = Audio.Additive( Gibber )
    Gibber.Clock = Audio.Clock
          
    Gibber.Theory = Audio.Theory
    
    Gibber.Theory.scale = Gibber.scale = Gibber.Audio.Theory.Scale( 'c4','Minor' )
    
    Audio.Core._init()
    
    $.extend( Gibber.Binops, Audio.Binops )
    
    Audio.Master = Audio.Busses.Bus().connect( Audio.Core.out )

    Audio.Master.type = 'Bus'
    Audio.Master.name = 'Master'

    $.extend( true, Audio.Master, Audio.ugenTemplate ) 
    Audio.Master.fx.ugen = Audio.Master
    
    Audio.ugenTemplate.connect = 
      Audio.Core._oscillator.connect =
      Audio.Core._synth.connect =
      Audio.Core._effect.connect =
      Audio.Core._bus.connect =
      Audio.connect;
      
    Audio.Core.defineUgenProperty = Audio.defineUgenProperty
    
    $.extend( Gibber.Presets, Audio.Synths.Presets )
    $.extend( Gibber.Presets, Audio.Percussion.Presets )
    $.extend( Gibber.Presets, Audio.FX.Presets )
    
    //$.extend( Audio, Audio.Core )
  },
  
  Time : {
    ms: function( num ) {
      return {
        mode: 'absolute',
        value: (Gibber.Audio.Core.context.sampleRate / 1000) * num,
        valueOf: function() { return this.value }
      }
    },
    seconds: function( num ) {
      return {
        mode: 'absolute',
        value: Gibber.Audio.Core.context.sampleRate * num,
        valueOf: function() { return this.value }
      }
    },
    minutes: function( num ) {
      return {
        mode: 'absolute',
        value: Gibber.Audio.Core.context.sampleRate * 60 * num,
        valueOf: function() { return this.value }
      }
    }
  },
  // override for Gibber.Audio.Core method
  defineUgenProperty : function(key, initValue, obj) {
    var isTimeProp = Audio.Clock.timeProperties.indexOf( key ) > -1,
        prop = obj.properties[ key ] = {
          value:  isTimeProp ? Audio.Clock.time( initValue ) : initValue,
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
        
        // if( isTimeProp ) {
        //   if( typeof val === 'object' && val.mode ==='absolute' ) { // ms, seconds
        //     prop.value = val.value
        //   }else{
        //     prop.value = Audio.Core.Binops.Mul( Audio.Clock.time( val ), Audio.Core.Binops.Div( 1, Audio.Clock.rate ) ) 
        //   }
        // }else{
        //   prop.value = val
        // }
        // 
        prop.value = isTimeProp ? Audio.Clock.time( val ) : val
        
        Audio.Core.dirty( obj )
        
        return prop.value
      },
    });

    obj[key] = prop.value
  },
  
  // override for Gibber.Audio method
  polyInit : function(ugen) {
    ugen.mod = ugen.polyMod;
    ugen.removeMod = ugen.removePolyMod;
    
    for( var key in ugen.polyProperties ) {
      (function( _key ) {
        var value = ugen.polyProperties[ _key ],
            isTimeProp = Audio.Clock.timeProperties.indexOf( _key ) > -1

        Object.defineProperty(ugen, _key, {
          get : function() { return value; },
          set : function( val ) { 
            for( var i = 0; i < ugen.children.length; i++ ) {
              ugen.children[ i ][ _key ] = isTimeProp ? Audio.Clock.time( val ) : val;
            }
          },
        });
        
      })( key );
    }
  },
  // override for Gibber.Audio method to use master bus
  connect : function( bus, position ) {
    if( typeof bus === 'undefined' ) bus = Audio.Master
    
    if( this.destinations.indexOf( bus ) === -1 ){
      bus.addConnection( this, 1, position )
      if( position !== 0 ) {
        this.destinations.push( bus )
      }
    }
    
    return this
  },
  clear: function() {
    // Audio.analysisUgens.length = 0
    // Audio.sequencers.length = 0
    var args = Array.prototype.slice.call( arguments, 0 )
    
    for( var i = 0; i < Audio.Master.inputs.length; i++ ) {
      if( args.indexOf( Audio.Master.inputs[ i ].value) === -1 ) {
        Audio.Master.inputs[ i ].value.disconnect()
      }
    }
  
    Audio.Master.inputs.length = arguments.length
    
    if( Audio.Clock.shouldResetOnClear !== false ) {
      Audio.Clock.reset()
    }
  
    Audio.Master.fx.remove()
  
    Audio.Master.amp = 1
    
    Audio.Core.clear()
    
    Audio.Clock.seq.connect()
    
    Audio.Core.out.addConnection( Audio.Master, 1 );
    Audio.Master.destinations.push( Audio.Core.out );
  
    console.log( 'Audio stopped.')
  },
  ugenTemplate: {
    sequencers : [],
    mappings: [],
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
        if( this.ugen !== Audio.Master ) {
          end.connect()
        }else{
          end.connect( Audio.Core.out )
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
						}else if( typeof arg === 'object' ) {
							for( var j = 0; j < this.length; j++ ) {
								if( this[ j ] === arg ) {
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
                  if( this.ugen !== Audio.Master ) {
                    this.ugen.connect( Audio.Master )
                  }else{
                    this.ugen.connect( Audio.Core.out )
                  }
                }
              }else{
                if( this.length > 0 ) { // if there is an fx behind in chain
                  this[ arg - 1 ].connect( Audio.Master )
                }else{
                  if( this.ugen !== Audio.Master ) {
                    this.ugen.connect( Audio.Master ) // no more fx
                  }else{
                    this.ugen.connect( Audio.Core.out )
                  }
                }
              }
            }
          }
        }else{ // remove all fx
          if( this.length > 0) {
            this[ this.length - 1 ].disconnect()
            if( this.ugen !== Audio.Master ) {
              this.ugen.connect( Audio.Master )
            }else{
              this.ugen.connect( Audio.Core.out )
            }
            this.ugen.codegen()
            this.length = 0
          }else{
            console.log( this.ugen.name + ' does not have any fx to remove. ')
          }
        }
      },
    }),
      
    replaceWith: function( replacement ) {
      if( replacement.connect ) {
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
      
      for( var i = 0; i < this.mappings.length; i++ ) {
        this.mappings[ i ].remove() 
      }
      
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

      var time = Audio.Clock.time( _time ),
          decay = new Audio.Core.ExponentialDecay({ decayCoefficient:.05, length:time }),
          //ramp = Mul( Sub(1,decay), endLevel )
          line = new Audio.Core.Line( 0, endLevel, time )
          
      this.amp = line
      
      future( function() { this.amp = endLevel }.bind( this ), time)
      
      return this
    },
    
    fadeOut : function( _time ) {
      var time = Audio.Clock.time( _time ),
          curve = Gibber.Audio.Envelopes.Curve( 0, 1, time, .05, .95, false )
          
      this.amp = curve
      
      future( function() { this.amp = 0 }.bind( this ), time )
      
      return this
    },
    fadeOut2 : function( _time ) {
      var time = Audio.Clock.time( _time ),
          curve = Gibber.Audio.Envelopes.Curve( 0, 1, time, .05, .95, false )
          
      this.amp = curve
      
      future( function() { 
        this.amp = 0
        this.kill()
      }.bind( this ), time )
      
      return this
    },
  }
}

Audio.Core = _dereq_( 'gibberish-dsp' )
Audio.Core._init = Audio.Core.init.bind( Audio.Core )
delete Audio.Core.init

Audio.Clock =          _dereq_( './audio/clock' )( Gibber )
Audio.Freesoundjs =    _dereq_( '../external/freesound' )
Audio.Freesound =      _dereq_( './audio/gibber_freesound' )( Audio.Freesoundjs )
Audio.Freesoundjs2 =   _dereq_( '../external/freesound2' )
Audio.Freesound2 =     _dereq_( './audio/gibber_freesound2' )( Audio.Freesoundjs2 )
Audio.Seqs =           _dereq_( './audio/seq')( Gibber )
Audio.Theory =         _dereq_( './audio/theory' )( Gibber )
Audio.FX =             _dereq_( './audio/fx' )( Gibber )
Audio.Oscillators =    _dereq_( './audio/oscillators' )( Gibber )
Audio.Synths =         _dereq_( './audio/synths' )( Gibber )
Audio.Busses =         _dereq_( './audio/bus' )( Gibber )
Audio.Analysis =       _dereq_( './audio/analysis' )( Gibber )
Audio.Envelopes =      _dereq_( './audio/envelopes' )( Gibber )
Audio.Percussion =     _dereq_( './audio/drums' )( Gibber )
Audio.Input =          _dereq_( './audio/audio_input' )( Gibber )
Audio.Samplers =       _dereq_( './audio/sampler' )( Gibber )
// Audio.Speak =          require( './audio/speak' )( Gibber )
Audio.Vocoder =        _dereq_( './audio/vocoder' )( Gibber )
Audio.PostProcessing = _dereq_( './audio/postprocessing' )( Gibber )
Audio.Arp =            _dereq_( './audio/arp' )( Gibber )
Audio.SoundFont =      _dereq_( './audio/soundfont' )( Gibber )
Audio.Score =          _dereq_( './audio/score' )
Audio.Ensemble =       _dereq_( './audio/ensemble' )( Gibber )
Audio.Ugen =           _dereq_( './audio/ugen')( Gibber )
Audio.Additive =       _dereq_( './audio/additive')

return Audio

}
},{"../external/freesound":31,"../external/freesound2":32,"./audio/additive":35,"./audio/analysis":36,"./audio/arp":37,"./audio/audio_input":38,"./audio/bus":39,"./audio/clock":40,"./audio/drums":41,"./audio/ensemble":42,"./audio/envelopes":43,"./audio/fx":44,"./audio/gibber_freesound":45,"./audio/gibber_freesound2":46,"./audio/oscillators":47,"./audio/postprocessing":48,"./audio/sampler":49,"./audio/score":50,"./audio/seq":51,"./audio/soundfont":52,"./audio/synths":53,"./audio/theory":54,"./audio/ugen":55,"./audio/vocoder":56,"gibberish-dsp":5}],35:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {

/*
XXX = Ugen({
  name:'Vox',
  inputs:{ 
    frequency:{ min:50, max:3000, default:440 },
    amp: { min:0, max:1, default:.1 }
  },
  callback: function( frequency, amp ) {
    this.out = this.sin( this.PI2 * (this.phase++ * frequency / 44100) ) * amp
    
    // if stereo, make this.out an array an fill appropriately
    // do not create a new array for every sample
    return this.out
  },
  init: function() {
    this.sin = Math.sin
    this.PI2 = Math.PI * 2
    this.phase = 0
    this.out =  0
  }
})
*/
    var Additive = Gibber.Audio.Ugen({
      name:'additive',
      inputs: {
        frequency:{ min:50, max:3000, default:440 },
        amp: { min:0, max:1, default:.5 }
        //pan: { min:0, max:1, default:-1 }
      },
      callback: function( frequency, amp, pan ) {
        var sines = this.sines, sine, harmonics = this.harmonics
        
        this.out = 0
        
        for( var i = 0, l = sines.length; i < l; i++  ) {
          sine = sines[ i ]
          this.out += sine( frequency * sine.harmonic, sine.amp )
          // if ( phase++ % 88200 === 0 ) console.log( frequency, sine.amp, this.out )
        }
      
        return this.out * amp
      },
      init: function() {
        this.sines = []
        //this.frequency = 440
        //if( typeof this.harmonics === 'undefined' ) this.harmonics = [1,1]
        
        for( var i = 0, j = 0; i < this.harmonics.length / 2; i++, j+=2 ) {
          var harmonicIndex = i * 2
          this.sines[ i ] = Gibber.Audio.Oscillators.Sine(440,1)._.callback
          this.sines[ i ].harmonic = this.harmonics[ j ]
          this.sines[ i ].amp = this.harmonics[ j + 1 ]
        }
        
        this.out = 0
        console.log( this.sines )
      }
    })
  
  //  return Additive
    //}
  
  return Additive
}

/*Sine = Ugen({
  name:'Vox',
  inputs:{ 
    frequency:{ min:50, max:3000, default:440 },
    amp: { min:0, max:1, default:.1 }
  },
  callback: function( frequency, amp ) {
    this.out = this.sin( this.PI2 * (this.phase++ * frequency / 44100) ) * amp
    return this.out
  },
  init: function() {
    this.sin = Math.sin
    this.PI2 = Math.PI * 2
    this.phase = 0
    this.out =  0
  }
})

Sine.connect()
Sine.frequency.seq( [440,880], 1/2 )
*/
},{}],36:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var fft,
      mappingProperties = { 
        value:{ min: 0, max: 255, output: LOGARITHMIC, wrap:false, timescale: 'graphics' } 
      },
      Gibberish = _dereq_( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
  
  var Analysis = {
    FFT : function( fftSize, updateRate ) {
      if( typeof fft === 'undefined' ) {      
        fft = Gibberish.context.createAnalyser()
        Gibberish.node.connect( fft )
        fft.fftSize = fftSize || 32
        fft.updateRate = updateRate || 40
        
        fft.values = new Uint8Array( fft.frequencyBinCount )
        fft.children = []
                
        for( var i = 0; i < fft.frequencyBinCount; i++ ) {          
          !function() { 
            var num = i,
                child = {},
                _value = 0
  
            Object.defineProperties( child, {
              value: {
                configurable:true,
                get: function() { return _value },
                set: function(v) { _value = v }
              }
            })
            
            Gibber.createProxyProperties( child, $.extend( {}, mappingProperties) , false )
            fft[ num ] = child
            fft.children.push( child )
            
            child.type = 'mapping'
            child.index = num
            child.min = 0; child.max = 255; // needed to map directly to children
            
            child.valueOf = function() { return this.value.value }
          }()
        }
        
        setInterval( function(){
          fft.getByteFrequencyData( fft.values );
          for( var i = 0; i < fft.values.length; i++ ) {
            fft[ i ].value = fft.values[ i ]
          }
        }, fft.updateRate );
      }else{
        if( fftSize ) fft.fftSize = fftSize
        if( updateRate ) fft.updateRate = updateRate
      }
      
      return fft
    },
    Follow : function( ugen, bufferSize ) {
      var follow = new Gibberish.Follow( ugen, bufferSize ),
          _mappingProperties = { value: { min: 0, max: 1, output: LOGARITHMIC, timescale: 'audio' } }

      Gibber.createProxyProperties( follow, _mappingProperties )

      return follow
    }
  }

  return Analysis
  //module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Analysis }
  
}
},{"gibberish-dsp":5}],37:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  
var theory = _dereq_('../../external/teoria.min'),
    $ = Gibber.dollar,
    curves = Gibber.outputCurves,
    Seq    = _dereq_('./seq')( Gibber ).Seq,
    Arp
    
Arp = function(notation, beats, pattern, mult, scale) {	
	var that = Seq()
  
  $.extend( that, {
  	name : "Arp",
  	notes : [],
  	pattern : pattern || "up",
  	notation : notation || "C4m7",
  	mult : mult || 1,
  	init : false,
  	speed : isNaN(beats) ? _4 : beats,
  	scale : scale || null,
    
    chord : function(_chord, shouldReset) {
  		var arr = [];
  		this.notation = _chord;
		
  		if(typeof this.scale === 'undefined' || this.scale === null && typeof _chord === 'string') {
  			for(var i = 0; i < this.mult; i++) {
  				var tmp = [];
			
  				var _root = this.notation.slice(0,1);
  				var _octave, _quality;
  				if(isNaN(this.notation.charAt(1))) { 	// if true, then there is a sharp or flat...
  					_root += this.notation.charAt(1);	// ... so add it to the root name
  					_octave  = parseInt( this.notation.slice(2,3) );
  					_quality = this.notation.slice(3);
  				}else{
  					_octave  = parseInt( this.notation.slice(1,2) );
  					_quality = this.notation.slice(2);
  				}
  				_octave += i;

  				var _chord = theory.note(_root + _octave).chord(_quality);
  				for(var j = 0; j < _chord.notes.length; j++) {
  					var n = _chord.notes[j].fq();
  					tmp[j] = n;
  				}
  				arr = arr.concat(tmp);
  			}	

  		}else{
  			for(var i = 0; i < this.mult; i++) {
  				var tmp = [];
				
  				for(var j = 0; j < this.notation.length; j++) {
  					tmp[j] = this.notation[j] + (7 * i);
  				}
  				arr = arr.concat(tmp);
  			}	
  		}			
      this.notes = Gibber.construct( Gibber.Pattern, this.patterns[ this.pattern ]( arr ) )
      
      if( this.seqs[0] ) {
        this.seqs[0].values = [ this.notes ]
      }
  	},
	
	  set : function(_chord, _speed, _pattern, octaveMult, shouldReset) {
  		this.speed = _speed || this.speed;
  		this.pattern = _pattern || this.pattern;
  		this.mult = octaveMult || this.mult;
		
  		this.chord(_chord, shouldReset); // also sets sequence
  	},
    
    shuffle: function() {
      this.notes.shuffle()
    },
		
    reset: function() {
      this.notes.reset()
    },
    
	  patterns : {
    	up : function(array) {
    		return array;
    	},
    	down : function(array) {
    		return array.reverse();
    	},
    	updown : function(array) {
    		var _tmp = array.slice(0);
    		_tmp.reverse();
    		return array.concat(_tmp);
    	},
    	updown2 : function(array) { // do not repeat highest and lowest notes
    		var _tmp = array.slice(0);
    		_tmp.pop();
    		_tmp.reverse();
    		_tmp.pop();
    		return array.concat(_tmp);
    	}
    }
	});
	
  that.seq = that
  
  // I have no idea why I need this
  // that.__shuffle = that.shuffle 
  // that.shuffle = function() {
  //   that.__shuffle()
  // }
  
  Gibber.createProxyMethods( that, [ 'shuffle','reset','chord' ] )
  
	that.chord( that.notation );	// this sets the initial sequence
  
  var target = null
  Object.defineProperty( that, 'target', {
    get: function() { return target },
    set: function(v) {
      target = v
      var _seq = {
        key: 'note',
        'target': target,
        values: that.notes,
        durations:Gibber.Clock.time( beats )
      }
      that.add( _seq )
      that.start()
    }
  })
  
  var speed = beats
  Object.defineProperty( that, 'speed', {
    get : function() { return speed },
    set : function( v ) {
      speed = v
      for( var i = 0; i < that.seqs.length; i++ ) {
        that.seqs[0].durations = Gibber.Clock.time( speed )
      }
    }
  })

	return that;
}

return Arp

}
},{"../../external/teoria.min":33,"./seq":51}],38:[function(_dereq_,module,exports){
module.exports = function( Gibber ) { 
  "use strict"
  
  var Input = {},
      Gibberish = _dereq_( 'gibberish-dsp' ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties = {
        amp: {
          min: 0, max: 1,
          hardMax:2,
          output: LOGARITHMIC,
          timescale: 'audio',
          dimensions:1
        },
        out: {
          min: 0, max: 1,
          output: LINEAR,
          timescale: 'audio',
          dimensions:1
        },
        //pan: { min: -1, max: 1, output: LINEAR, timescale: 'audio',},   
      },
      name = 'Input'

  Input = function() {
    var oscillator = new Gibberish.Input().connect( Gibber.Master ),
        args = Array.prototype.slice.call( arguments, 0 )
       
    oscillator.type = 'Gen'
    $.extend( true, oscillator, Gibber.Audio.ugenTemplate )
    
    oscillator.fx.ugen = oscillator
    
    Object.defineProperty(oscillator, '_', {
      get: function() { 
        oscillator.kill();
        return oscillator 
      },
      set: function() {}
    })    
    
    Gibber.createProxyProperties( oscillator, mappingProperties )
        
    Gibber.processArguments2( oscillator, args, name )

    oscillator.toString = function() { return '> ' + name }
    
    return oscillator
  }
  
  return Input
}
},{"gibberish-dsp":5}],39:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var $ = Gibber.dollar,//require('zepto-browserify').Zepto,
      Gibberish = _dereq_( 'gibberish-dsp' ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
      
  var types = [
    [ 'Bus2', 'Bus' ],
  ],
  mappingProperties = {
    amp: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
    },
    pan: {
      min: -.75, max: .75,
      output: LINEAR,
      timescale: 'audio',
    },
    out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
  },
  init = false,
  Busses = {
    'mappingProperties': mappingProperties,
    Presets:{}
  }
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Busses[ name ] = function() {
        var obj = Gibber.processArguments( arguments, name )
        
        if( Array.isArray( obj ) ) {
          obj.unshift(0)
          obj = Gibber.construct( Gibberish[ type ], obj )
        }else{
          obj =  new Gibberish[ type ]( obj )
        }
        
        if(init) {
          obj.connect( Master )
        }else{
          init = true;
        }
        
        obj.type = 'Gen'
        
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })
      
        $.extend( true, obj, Gibber.Audio.ugenTemplate )
        
        obj.fx.ugen = obj
        
        Gibber.createProxyProperties( obj, mappingProperties )    
  
        return obj
      }
    })()
  }
  
  Busses[ 'Group' ] = function() {
    var obj = Gibber.processArguments( arguments, 'Bus2' ),
        inputs = []
    
    // if( Array.isArray( obj ) ) {
    //   if( obj.length > 0 ) {
    //     inputs = obj.slice( 0 )
    //     for( var i = 0; i < inputs.length; i++ ) {
    //       inputs[ i ].disconnect()
    //     }
    //   }
    // }else{
    //   if( obj ) {
    //     inputs = obj.inputs || [] 
    //   }else{
    //     inputs = []
    //   }
    // }
     
    obj =  new Gibberish[ 'Bus2' ]()

    if(init) {
      obj.connect( Master )
    }else{
      init = true;
    }
    
    obj.type = 'FX'
  
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    
    obj.fx.ugen = obj
    
    Gibber.createProxyProperties( obj, mappingProperties )    
    
    $.extend( obj, {
      add : function() {
        for( var i = 0; i < arguments.length; i++ ) {
          arguments[ i ].disconnect()
          arguments[ i ].connect( obj )
        }
      },
      remove : function() {
        for( var i = 0; i < arguments.length; i++ ) {
          arguments[ i ].disconnect( obj )
        }
      },
      free : function() {
        for( var i = 0; i < arguments.length; i++ ) {
          arguments[ i ].disconnect( obj )
          arguments[ i ].connect()
        }
      }
    })
    
    for( var i = 0; i < arguments.length; i++ ) {
      obj.add( arguments[ i ] )
    }
    
    return obj
  }
  
  return Busses
}
},{"gibberish-dsp":5}],40:[function(_dereq_,module,exports){
!function() {
  
var times = [],
    $ = null,
    curves = null,
    LINEAR = null,
    LOGARITHMIC = null,
    Gibberish = _dereq_( 'gibberish-dsp' ),
    Gibber

var Clock = {
  seq : null, 
  bpm : null,
  maxMeasures: 44,
  baseBPM : 120,
  metronome : null,
  currentBeat : 0,
  beatsPerMeasure : 4,
  codeToExecute : [],
  signature: { lower: 4, upper: 4 },
  sequencers:[],
  shouldResetOnClear:true,
  timeProperties : [ 'attack', 'decay', 'sustain', 'release', 'offset', 'time' ],
  phase : 0,
  export: function( target ) {
    target.beats = Clock.beats
    target.Beats = Clock.Beats
    target.measures = Clock.measures
    target.Measures = Clock.Measures
  },
  
  processBeat : function() {
    Clock.currentBeat = Clock.currentBeat >= Clock.signature.upper ? 1 : Clock.currentBeat + 1
    
    if( Clock.currentBeat === 1 && Clock.codeToExecute.length > 0) {
      
      for( var i = 0; i < Clock.codeToExecute.length; i++ ) {
        try {
					if( typeof Clock.codeToExecute[ i ].function === 'function' ) {
						Clock.codeToExecute[ i ].function()
					}else{
            if( Gibber.Environment ) {
              Gibber.Environment.modes[ Clock.codeToExecute[ i ].cm.doc.mode.name ].run( Clock.codeToExecute[i].cm.column, Clock.codeToExecute[ i ].code, Clock.codeToExecute[ i ].pos, Clock.codeToExecute[ i ].cm, false ) 
            }else{
  	          //Gibber.run( Clock.codeToExecute[ i ].code, Clock.codeToExecute[ i ].pos, Clock.codeToExecute[ i ].cm )
              eval( Clock.codeToExecute[ i ].code )
            }
					}
        }catch( e ) {
          console.error( "FAILED TO EXECUTE CODE:", Clock.codeToExecute[ i ].code , e)
        }
      }
      
      Clock.codeToExecute.length = 0
    }
    
    if( Clock.metronome !== null ) {
      Clock.metronome.draw( Clock.currentBeat, Clock.signature.upper )
    }
    
    Clock.phase += Clock.beats( 1 )
  },
  
  getTimeSinceStart : function() {
    return Clock.phase + Clock.seq.phase
  },
  
  reset : function() {
    this.phase = 0
    this.currentBeat = 0
    this.rate = 1
    this.start( false )
  },
  
  tap : function() {
    var time = Gibber.Clock.getTimeSinceStart()
    if( times[2] && time - times[2] > 88200 ) {
      times.length = 0
    }
    times.unshift( time )
  
    while( times.length > 3 ) times.pop()
  
    if( times.length === 3) {
    	var average = ((times[0] + times[1]) - times[2] * 2) / 3.,
          bps = 44100 / average,
          bpm = bps * 60
    
      Gibber.Clock.bpm = bpm
    }
  },
  
  start : function( shouldInit ) {    
    var _phase = 0
    
    if( shouldInit ) {
      $.extend( this, {
        properties: { rate: 1 },
        name:'master_clock',
        callback : function( rate ) {
          _phase++ 
          return rate
        }
      })
     
      this.__proto__ = new Gibberish.ugen()
      this.__proto__.init.call( this )

      var bpm = this.baseBPM
      Object.defineProperty(Clock, 'bpm', {
        get: function() { return bpm },
        set: function(v) { 
          bpm = v;
          Clock.rate = bpm / Clock.baseBPM
        }
      })
      
      Object.defineProperty(this, 'timeSignature', {
        get: function() { return Clock.signature.upper + '/' + Clock.signature.lower },
        set: function(v) { 
          var values = v.split('/')
          if( values.length === 2 && ( values[0] !== Clock.signature.upper || values[1] !== Clock.signature.lower ) ) {
            Clock.signature.upper = parseInt( values[0] )
            Clock.signature.lower = parseInt( values[1] )
            Clock.currentBeat = Clock.currentBeat != 1 ? 0 : 1
          }
        }
      })
      
      Gibber.createProxyProperties( this, {
        rate : { min: .1, max: 2, output: LINEAR, timescale: 'audio' },
        bpm : { min: 20, max: 200, output: LINEAR, timescale: 'audio' },        
      })
      
      this.setPhase = function( v ) { _phase = v }
      this.getPhase = function() { return _phase }

      Clock.seq = new Gibberish.PolySeq({
        seqs : [{
          target:Clock,
          values: [ Clock.processBeat.bind( Clock ) ],
          durations:[ 1/4 ],
        }],
        rate: Clock,
      })
      Gibber.Audio.Seqs.Seq.children.push( Clock.seq ) // needed for Gabber
      Clock.seq.connect().start()
      Clock.seq.timeModifier = Clock.time.bind( Clock )
      
    }else{
      Clock.seq.setPhase(0)
      Clock.seq.connect().start()
    }
  },
  
  addMetronome: function( metronome ) {
    this.metronome = metronome
    this.metronome.init()
  },
  
  time : function(v) {
    var timeInSamples, beat;
    
    if( v < Clock.maxMeasures ) {
      timeInSamples = Clock.beats( v * Clock.signature.lower )
    }else{
      timeInSamples = v
    }
    return timeInSamples
  },
  
  Time : function(v) {
    var timeFunction, beat;
    
    if( v < this.maxMeasures ) {
      timeFunction = Clock.Beats( v * Clock.signature.lower )
    }else{
      timeFunction = Clock.Beats( v )
    }
    
    return timeFunction
  },
  
  beats : function(val) {
    var sampleRate = typeof Gibberish.context !== 'undefined' ? Gibberish.context.sampleRate : 44100,
        beatsPerSecond = Clock.bpm / 60,
        samplesPerBeat = sampleRate / beatsPerSecond
        
    return samplesPerBeat * val
  },
  
  Beats : function(val) {
    return Clock.beats.bind( null, val )
  },
  
  measures: function( val ) {
    return Clock.beats( val * Clock.signature.upper )
  },
  
  Measures: function( val ) {
    return Clock.Beats( val * Clock.signature.upper )
  }
}

module.exports = function( __Gibber ) {
  
  "use strict"
  Gibber = __Gibber
  $ = Gibber.dollar,
  curves = Gibber.outputCurves,
  LINEAR = curves.LINEAR,
  LOGARITHMIC = curves.LOGARITHMIC

  return Clock

}

}()
},{"gibberish-dsp":5}],41:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var Percussion = { Presets:{} }, 
      Gibberish = _dereq_( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = Gibber.Clock,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC, 
      types = [
        'Kick',
        'Snare',
        'Hat',
        'Conga',
        'Cowbell',
        'Clave',
        'Tom',
        'Clap'
      ],
      _mappingProperties = {
        Drums: {
          pitch: { min: .25, max: 4, output: LINEAR,     timescale: 'audio' },
          amp:   { min: 0,   max: 1, output: LOGARITHMIC,timescale: 'audio',},
          pan:   { min: 0,   max: 1, output: LINEAR,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        XOX: {
          //pitch: { min: .25, max: 4, output: LINEAR, timescale: 'audio' },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          pan:   { min: 0,   max: 1, output: LINEAR,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },      
        },
        Kick    : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        Snare   : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC, timescale: 'audio' },
          snappy: { min: .25, max: 1.5, output: LOGARITHMIC, timescale: 'audio' },
          tune: { min: 0, max: 2, output: LOGARITHMIC, timescale: 'audio' },
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },    
        },
        Hat     : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        Conga   : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        Cowbell : { 
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
        },
        Clave   : { 
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',}, },
        Tom     : { 
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',}, 
        },
        Clap     : { 
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',}, 
        },
      };

  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Percussion[ name ] = function() {
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
        
        $.extend( true, obj, Gibber.Audio.ugenTemplate )
        
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
        Gibber.createProxyMethods( obj, [ 'note', 'send' ] )
        
        obj.toString = function() { return '> ' + name }
        
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })

        return obj
      }
    })()
  
  }
  
  Percussion[ 'Drums' ] = function(_sequence, _timeValue, _amp, _freq){    
    var args = Array.prototype.slice.call(arguments),
        obj = {}, 
        props = Gibber.processArguments( args, 'Drums' )
        
    $.extend( true, obj, props)
    console.log("PROPS PROPS", props)
  
    if( Array.isArray( obj ) ) {
      obj = Gibber.construct( Gibberish.Bus2, obj ).connect( Gibber.Master )
    }else{
      obj =  new Gibberish.Bus2( obj ).connect( Gibber.Master )
    }
    
		obj.name = 'Drums'
    obj.type = 'Gen'
    obj.children = []
    
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    
    obj.fx.ugen = obj
  
    Object.defineProperty(obj, '_', { get: function() { obj.kill(); return obj }, set: function() {} })
		
  	obj.kit = Percussion.Drums.kits['default'];
    
  	if(typeof arguments[0] === "object") {
  		if(arguments[0].kit) {
  			obj.kit = Percussion.Drums.kits[arguments[0].kit];
  			arguments[0].kit = obj.kit;
  		}
  	}
    
  	for(var key in obj.kit) {
  		var drum = obj.kit[key],
          ugen = drum.file ? { ugen: new Gibberish.Sampler({ file:drum.file, pitch:1, amp:drum.amp }), pitch:drum.pitch, amp:drum.amp } : drum
      
      if( ugen ) {
        if( isNaN( ugen.pitch ) ) ugen.pitch = 1
        if( isNaN( ugen.pan ) )   ugen.pan   = 0
        if( isNaN( ugen.amp ) )   ugen.amp = 1
        if( typeof ugen.symbol === 'undefined' ) ugen.symbol = key
        
    		obj[key] = ugen
        // console.log("KEY", key, ugen, drum, obj[key], obj[key].ugen )
    		obj[key].ugen.pan = drum.pan
        if( !drum.file ) drum.ugen.disconnect() // disconnect non-sampler ugens
    		obj[key].ugen.connect( obj )
    		obj[key].fx = obj[key].ugen.fx
    		obj.children.push( obj[key].ugen )
      }
  	}
	
    obj.mod = obj.polyMod
    obj.removeMod = obj.removePolyMod
	
  	obj.connect();
    
    Gibber.createProxyProperties( obj, _mappingProperties[ 'Drums' ] )
    
    obj.note = function(nt) {
      // var p = typeof obj.pitch === 'function' ? obj.pitch() : obj.pitch
      var p = obj.pitch.value
      if( $.isArray( nt ) ) {
        for( var i = 0; i < nt.length; i++ ) {
          var note = nt[ i ]

          if( typeof note === 'string' ) {
        		for( var key in obj.kit ) {
        			if( note === obj.kit[ key ].symbol ) {
                if( obj[ key ].ugen ) {
          				obj[ key ].ugen.note( p, obj[key].amp );
                }
                //var p = p //this.pitch() 
                // if( this[ key ].sampler.pitch !== p )
                  // this[ key ].sampler.pitch = p
        				break;
        			}
        		}
          }else{
            var drum = obj[ Object.keys( obj.kit )[ note ] ]
            drum.ugen.note( p.value, drum.ugen.amp )
            // if( drum.sampler.pitch !== p )
            //   drum.sampler.pitch = p
          }
        }
      }else{
        if( typeof nt === 'string' ) {
      		for( var key in obj.kit ) {
      			if( nt === obj.kit[ key ].symbol ) {
              //console.log("PITCH", p )
              if( obj[key].file ) {
        				obj[ key ].ugen.note( p, obj[key].amp );
                obj[ key ].ugen.pitch = p
              }else{
        				obj[ key ].ugen.note( obj[ key ].pitch, obj[key].amp );
                obj[ key ].ugen.pitch = p
              }
              //var p = this.pitch.value //this.pitch() 
              // if( this[ key ].sampler.pitch !== p )
              //   this[ key ].sampler.pitch = p
      				break;
      			}
      		}
        }else{
          var keys = Object.keys( obj.kit ),
              num = Math.abs( nt ),
              key = keys[ num % keys.length ], 
              drum = obj[ key ]
          
          drum.ugen.note( p, drum.ugen.amp )
          
          // if( drum.sampler.pitch !== p )
          //   drum.sampler.pitch = p
        }
      }
  	}
    
    Gibber.createProxyMethods( obj, [ 'note' ] )
    
  	obj.pitch = 1;
    
    if( $.type( props[0] )  === 'object' ) { props[0] = props[0].note }
        
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
            
            if( seq.indexOf('.rnd(') > -1) {
              // || seq.indexOf('.random(') > -1 ) {
              seq = seq.split( '.rnd' )[0]
              seq = seq.split('').rnd()
            }
            
            if( typeof props[1] !== 'undefined') { 
              duration = props[1]
              if( !Array.isArray( duration ) ) duration = [ duration ]
              
              var durationsPattern = Gibber.construct( Gibber.Pattern, duration )
        
              if( duration.randomFlag ) {
                durationsPattern.filters.push( function() { return [ durationsPattern.values[ rndi(0, durationsPattern.values.length - 1) ], 1 ] } )
                for( var i = 0; i < duration.randomArgs.length; i+=2 ) {
                  durationsPattern.repeat( duration.randomArgs[ i ], duration.randomArgs[ i + 1 ] )
                }
              }
              
              duration = durationsPattern
            }
            
            obj.note.seq( seq, [duration], i )
            //obj.note.seq( Gibber.construct( Gibber.Pattern, seq ), Gibber.construct( Gibber.Pattern, [duration] ), i )
          }

          break;
        case 'object':
      		if( typeof props[0].note === 'string' ) props[0].note = props[0].note.split("")
      		props[0].target    = obj
          props[0].durations = props[0].durations ? Gibber.Clock.Time( props[0].durations ) : Gibber.Clock.Time( 1 / props[0].note.length )
          props[0].offset    = props[0].offset ? Gibber.Clock.time( props[0].offset ) : 0
      	  //obj.seq = Seq( props[0] );
          
          break;

        case 'function': case 'array':
          var length = props[0].length || props[0].values.length,
              durations = typeof arguments[1] !== 'undefined' ? arguments[1] : Gibber.Clock.Time( 1 / length )
          
          if( typeof durations !== 'function' ) durations = Gibber.Clock.Time( durations )
              
          obj.seq.add({
            key:'note',
            values:[ props[0] ],
            durations: durations,
            target:obj
          })
          
          obj.pattern = obj.seq.seqs[ obj.seq.seqs.length - 1 ].values[ 0 ]
          
          break;
        default:
          break;
      }
    }

  	if( typeof props === "undefined" ) props = {};
	
  	if( props.pitch ) obj.pitch = props.pitch;
	
  	if( typeof props.snare !== "undefined" ) 	{ $.extend( obj.snare.ugen, props.snare ); $.extend( obj.snare, props.snare); }
  	if( typeof props.kick !== "undefined" ) 	{ $.extend( obj.kick.ugen, props.kick ); $.extend( obj.kick, props.kick); }
  	if( typeof props.hat !== "undefined" ) 	{ $.extend( obj.hat.ugen, props.hat ); $.extend( obj.hat, props.hat); }
  	if( typeof props.openHat !== "undefined" ) { $.extend( obj.openHat.ugen, props.openHat ); $.extend( obj.openHat, props.openHat); }
 	
  	obj.amp   = isNaN(_amp) ? 1 : _amp;
	
  	if( obj.seq && obj.seq.tick ) { Gibberish.future( obj.seq.tick, 1 ) }
    
    obj.start = function() { obj.seq.start( true ) }
    obj.stop = function() { obj.seq.stop() }
    obj.shuffle = function() { obj.note.values.shuffle() }
    obj.reset = function() { obj.seq.reset() }

    Gibber.createProxyMethods( obj, [ 'play','stop','shuffle','reset','start','send' ] )
            
    obj.seq.start( true )

    Object.defineProperties( obj, {
      offset: {
        get: function() { return obj.seq.offset },
        set: function(v) { obj.seq.offset = Gibber.Clock.time(v)}
      }
    })
        
    //obj.toString = function() { return 'Drums : ' + obj.seq.seqs[0].values.join('') }
    
    return obj
  }
  
  Percussion[ 'EDrums' ] = function(_sequence, _timeValue, _amp, _freq){    
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
    
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    
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
    obj.kick = Gibber.Audio.Percussion.Kick().disconnect()//new Gibberish.Kick()//.connect( obj )
    obj.snare = Gibber.Audio.Percussion.Snare().disconnect()//new Gibberish.Snare()//.connect( obj )
    obj.hat = Gibber.Audio.Percussion.Hat().disconnect()//new Gibberish.Hat()//.connect( obj )
    
    obj.kick.connect( obj )
    obj.snare.connect( obj )
    obj.hat.connect( obj )
    
    obj.children.push( obj.kick, obj.snare, obj.hat )
	
    obj.mod = obj.polyMod
    obj.removeMod = obj.removePolyMod

    obj.set = function( v ) { obj.seq.note = v.split('') }
    
    Gibber.createProxyProperties( obj, _mappingProperties[ 'XOX' ] )
    
    obj.start = function() { obj.seq.start( true ) }
    obj.stop = function() { obj.seq.stop() }
    obj.shuffle = function() { obj.seq.shuffle() }
    obj.reset = function() { obj.seq.reset() }
    
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

          kf = Gibber.Utilities.future( function() {
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

          sf = Gibber.Utilities.future( function() {
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

          hf = Gibber.Utilities.future( function() {
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

          hf = Gibber.Utilities.future( function() {
              //obj.hat.disconnect()
              hcd = 1
              hf = null
          }, 30500 ) 
    
          break;
      }
  	}
    
    Gibber.createProxyMethods( obj, [ 'play','stop','shuffle','reset','start','send','note' ] )
    
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
            
            if( seq.indexOf('.rnd(') > -1) {
              // || seq.indexOf('.random(') > -1 ) {
              seq = seq.split( '.rnd' )[0]
              seq = seq.split('').rnd()
            }
            
            if( typeof props[1] !== 'undefined') { 
              duration = props[1]
              if( !Array.isArray( duration ) ) duration = [ duration ]
              
              var durationsPattern = Gibber.construct( Gibber.Pattern, duration )
        
              if( duration.randomFlag ) {
                durationsPattern.filters.push( function() { return [ durationsPattern.values[ rndi(0, durationsPattern.values.length - 1) ], 1 ] } )
                for( var i = 0; i < duration.randomArgs.length; i+=2 ) {
                  durationsPattern.repeat( duration.randomArgs[ i ], duration.randomArgs[ i + 1 ] )
                }
              }
              
              duration = durationsPattern
            }
              
            obj.note.seq( Gibber.construct( Gibber.Pattern, seq ), Gibber.construct( Gibber.Pattern, [duration] ), i )
          }

          break;
          
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
	
  	if( typeof props.snare !== "undefined" ) 	{ $.extend( obj.snare.ugen, props.snare ); $.extend( obj.snare, props.snare); }
  	if( typeof props.kick !== "undefined" ) 	{ $.extend( obj.kick.ugen, props.kick ); $.extend( obj.kick, props.kick); }
  	if( typeof props.hat !== "undefined" ) 	{ $.extend( obj.hat.ugen, props.hat ); $.extend( obj.hat, props.hat); }
  	if( typeof props.openHat !== "undefined" ) { $.extend( obj.openHat.ugen, props.openHat ); $.extend( obj.openHat, props.openHat); }
 	
  	obj.amp   = isNaN(_amp) ? 1 : _amp;
	
  	if( obj.seq.tick ) { Gibberish.future( obj.seq.tick,1 ) }

    //Gibber.createProxyMethods( obj, [ 'play','stop','shuffle','reset' ] )

    // obj.kill = function() {
    //   var end = this.fx.length !== 0 ? this.fx[ this.fx.length - 1 ] : this
    //   end.disconnect()
    //        
    //   obj.seq.kill()
    // }
     
    obj.seq.start( true )
    
    obj.toString = function() { return 'EDrums : ' + obj.seq.seqs[0].values.join('') }
    
    return obj
  }
  
  // for backwards compatibility
  Percussion.XOX = Percussion.EDrums 
  
  Percussion.Drums.kits = {
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
  Percussion.Drums.kits.default = Percussion.Drums.kits.electronic;
  
  Percussion.Drums.makeKit = function( name, kit ) {
    Percussion.Drums.kits[ name ] = kit
  }
  
  Percussion.Presets.Kick = {
    short: { decay:.1, amp:.75 }
  }
  Percussion.Presets.Snare = {
    crack: { snappy:1, offset:1/4 }
  }
  
  return Percussion
  
}
},{"gibberish-dsp":5}],42:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var Gibberish = _dereq_( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = Gibber.Clock,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties = {
        amp: {
          min: 0, max: 1,
          output: LINEAR,
          timescale: 'audio',
        },
        pan: {
          min: -.75, max: .75,
          output: LINEAR,
          timescale: 'audio',
        },
        out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
      }    
      
  var Ensemble = function( props ) {
    var obj = new Gibberish.Bus2( obj ).connect( Gibber.Master )
    
		obj.name = 'Ensemble'
    obj.type = 'Gen'
    obj.children = []
    
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    
    obj.fx.ugen = obj
  
    Object.defineProperty(obj, '_', { get: function() { obj.kill(); return obj }, set: function() {} })
    
    Gibber.createProxyProperties( obj, mappingProperties )
    
  	for(var key in props) {
  		var ugenDesc = props[key],
          ugen = ugenDesc.file ? { ugen: new Gibberish.Sampler({ file:ugenDesc.file, pitch:1, amp:ugenDesc.amp }), pitch:ugenDesc.pitch, amp:ugenDesc.amp } : ugenDesc
      
      if( ugen ) {
        if( isNaN( ugen.pitch ) ) ugen.pitch = 1
        if( isNaN( ugen.pan ) )   ugen.pan   = 0
        if( isNaN( ugen.amp ) )   ugen.amp = 1
        if( typeof ugen.symbol === 'undefined' ) ugen.symbol = key
        
    		obj[key] = ugen
        // console.log("KEY", key, ugen, drum, obj[key], obj[key].ugen )
    		obj[key].ugen.pan = ugen.pan
        if( !ugenDesc.file ) ugen.ugen.disconnect() // disconnect non-sampler ugens
    		obj[key].ugen.connect( obj )
    		obj[key].fx = obj[key].ugen.fx
    		obj.children.push( obj[key].ugen )
      }
  	}
    
    obj.note = function(nt) {
      // var p = typeof obj.pitch === 'function' ? obj.pitch() : obj.pitch
      var p = obj.pitch
      if( typeof nt === 'string' ) {
    		for( var key in props ) {
          var ugen = props[ key ]
    			if( nt === ugen.symbol ) {
            if( ugen.file ) {
      				ugen.ugen.note( p, obj[key].amp );
            }else{
      				ugen.ugen.note( ugen.pitch * p, ugen.amp );
            }

    				break;
    			}
    		}
      }else{
        var keys = Object.keys( obj.kit ),
            num = Math.abs( nt ),
            key = keys[ num % keys.length ], 
            ugen = obj[ key ]
        
        ugen.ugen.note( p, ugen.ugen.amp )
      }
    }
    
    var seqNumber
    obj.play = function( pattern ) {
      var notes = pattern, _seqs = [], _durations = [], __durations = [], seqs = notes.split('|'), timeline = {}

      for(var i = 0; i < obj.seq.seqs.length; i++ ) {
        obj.seq.seqs[i].shouldStop = true
      }
      obj.seq.seqs.length = 0
      
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
        
        if( typeof arguments[1] !== 'undefined') { 
          duration = arguments[1]
          if( !Array.isArray( duration ) ) duration = [ duration ]
          
          var durationsPattern = Gibber.construct( Gibber.Pattern, duration )
            
          if( duration.randomFlag ) {
            durationsPattern.filters.push( function() { return [ durationsPattern.values[ rndi(0, durationsPattern.values.length - 1) ], 1 ] } )
            for( var i = 0; i < duration.randomArgs.length; i+=2 ) {
              durationsPattern.repeat( duration.randomArgs[ i ], duration.randomArgs[ i + 1 ] )
            }
          }
          
          duration = durationsPattern
        }
        
        obj.seq.add({
          key:'note',
          values: Gibber.construct( Gibber.Pattern, seq ),
          durations: Gibber.construct( Gibber.Pattern, [duration] ),
          target:obj
        })
        
        seqNumber = obj.seq.seqs.length - 1
        Object.defineProperties( obj.note, {
          values: {
            configurable:true,
            get: function() { return obj.seq.seqs[ seqNumber ].values },
            set: function( val ) {
              var pattern = Gibber.construct( Gibber.Pattern, val )

              if( !Array.isArray( pattern ) ) {
                pattern = [ pattern ]
              }
              // if( key === 'note' && obj.seq.scale ) {  
              //   v = makeNoteFunction( v, obj.seq )
              // }
              //console.log("NEW VALUES", v )
              obj.seq.seqs[ seqNumber ].values = pattern
            }
          },
          durations: {
            configurable:true,
            get: function() { return obj.seq.seqs[ seqNumber ].durations },
            set: function( val ) {
              if( !Array.isArray( val ) ) {
                val = [ val ]
              }
              obj.seq.seqs[ seqNumber ].durations = val   //.splice( 0, 10000, v )
            }
          },
        })
      }
    }
    
  	obj.pitch = 1;
    
    obj.seq.start()
    obj.connect()
    
    return obj
  }

  return Ensemble
}
},{"gibberish-dsp":5}],43:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var Envelopes = {},
      Gibberish = _dereq_( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = Gibber.Clock,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      types = [
        'Curve',
        'Line',
        'Ease',
        'Lines',
        'AD',
        'ADSR' 
      ],
      _mappingProperties = {
        Line: {
          start: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          end: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          time: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          }
        },
        Lines: {           
          time: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          }
        },
        Ease: {
          /*start: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          end: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          time: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },*/
        },
        Curve: {
          start: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          end: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          time: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          a: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          b: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
        },
        AD: {
          attack: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          decay: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
        },
        ADSR: {
          attack: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          decay: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          sustain: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          release: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          }
        },
      };
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Envelopes[ name ] = function() {
        var args = Array.prototype.slice.call(arguments, 0),
            obj
        
        if( typeof args[0] !== 'object' ) {
          // console.log( args[0], args[1], args[2], Gibber.Clock.time( args[2] ) )
          obj = new Gibberish[ type ]( args[0], args[1], Gibber.Clock.time( args[2] ), args[3], args[4], args[5], args[6] )
        }else if( name === 'Lines' ){
          obj = new Gibberish.Lines( args[0], args[1], args[2] )
        }else if( name === 'Ease' ){
          obj = new Gibberish.Ease( args[0], args[1], args[2], args[3], args[4] )
        }else if( name === 'Curve' ){ // not needed?
          obj = new Gibberish.Curve( args[0], args[1], args[2], args[3], args[4], args[5], args[6] )
        }else{
          obj = Gibber.construct( Gibberish[ type ], args[0] )
        }
        //obj.type = 'Env'
        obj.name = name
      
        $.extend( true, obj, Gibber.Audio.ugenTemplate )
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] ) 
        
        if( name !== 'Lines' ) Gibber.processArguments2( obj, args, obj.name )
        
        if( name === '.' || name === 'ADSR' ) {
          Gibber.createProxyMethods( obj, ['run'] )
        }
        
        console.log( name + ' is created.' )
        return obj
      }
    })()
  }
  
  return Envelopes

}

},{"gibberish-dsp":5}],44:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var FX = { Presets: {} },
      Gibberish = _dereq_( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
      
  // TODO: should this be completely moved into Gibberish? Is it useful inside there instead of just using Mul?
  Gibberish.Gain = function() {
  	Gibberish.extend(this, {
    	name: 'gain',
      type: 'effect',
    
      properties : {
        input  : 0,
        amount : 1, 
      },

      callback : function(input, amount) {
        if( typeof input === 'object' ) {
          input[0] *= amount
          input[1] *= amount
        }else{
          input *= amount
        }
    
        return input;
      }
    })
    .init()
    .processProperties(arguments);
  };
  Gibberish.Gain.prototype = Gibberish._effect;
  
  var types = [
    'Reverb',
    ['StereoReverb', 'StereoVerb'],
    'Delay',
    'Flanger',
    'Vibrato',
    'Distortion',
    'Biquad',
    'Gain',
    'Filter24',    
    [ 'RingModulation', 'RingMod' ],
    [ 'BufferShuffler', 'Schizo' ],
    [ 'Decimator', 'Crush' ],
    'Tremolo',
  ],
  _mappingProperties = {
    Reverb: {
      roomSize: {
        min: .5, max: .995,
        output: LINEAR,
        timescale: 'audio',
      },
      damping: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    StereoReverb: {
      roomSize: {
        min: .5, max: .995,
        output: LINEAR,
        timescale: 'audio',
      },
      damping: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Delay : {
      feedback: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      time : {
        min: 50, max: 88200, // TODO: Fix... problem with loading order, should be : Gibberish.context.sampleRate * 2,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    RingMod : {
      frequency : {
        min: 20, max: 3000,
        output: LINEAR,
        timescale: 'audio',
      },
      amp: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      mix: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Flanger : {
      rate : {
        min: .01, max: 20,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      feedback: {
        min: 0, max: .99,
        output: LINEAR,
        timescale: 'audio',
      },
      amount: {
        min: 25, max: 300,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Gain : {
      amount: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
    },
    Vibrato : {
      rate : {
        min: .2, max: 8,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      amount: {
        min: 25, max: 300,
        output: LINEAR,
        timescale: 'audio',
      },
      feedback: {
        min: .45, max: .55,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Filter24 : {
      cutoff : {
        min: 0, max: .7,
        output: LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    LPF : {
      cutoff : {
        min: 0.05, max: .7,
        output: LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    HPF : {
      cutoff : {
        min: 0, max: .7,
        output: LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Crush : {
      bitDepth : {
        min: 1, max: 16,
        output: LINEAR,
        timescale: 'audio',
      },
      sampleRate: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Schizo: {
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Tremolo: {
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      frequency : {
        min: .05, max: 20,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    }
  };
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      FX[ name ] = function() {
        var args = Array.prototype.slice.call(arguments, 0),
            obj
            
        obj = new Gibberish[ type ]()
        obj.type = 'FX'
        obj.name = name
      
        $.extend( true, obj, Gibber.Audio.ugenTemplate )
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] ) 
        
        Gibber.createProxyMethods( obj, [ 'send' ] )
        
        Gibber.processArguments2( obj, args, obj.name )
        
        if( name === 'Delay' ) obj.rate = Gibber.Clock
        
        args.input = 0
        
        obj.toString = function() { return '> ' + name }
        
        if( obj.presetInit ) obj.presetInit() 
        return obj
      }
    })()
  }
  
  FX.Chorus = function( rate, feedback, amount ) {
  	var _rate = rate || 1, 
    	  _amount = amount || ms( 1 ),
        _feedback = feedback || 0,
    	  that = Flanger( _rate, _feedback, _amount, ms( 1 ) * 30 )
      
  	that.name = 'Chorus'
    that.type = 'FX'
    
  	return that
  }
  
  FX.LPF = function( cutoff, resonance ) {
    var _cutoff = isNaN(cutoff) ? .2 : cutoff,
        _resonance = isNaN( resonance ) ? 3.5 : resonance, 
        that = Filter24( _cutoff, _resonance, true )
    
  	that.name = 'LPF'
    that.type = 'FX'
    
  	return that
  }
  
  FX.HPF = function( cutoff, resonance ) {
  	var _cutoff = isNaN( cutoff ) ? .25 : cutoff,
        _resonance = isNaN( resonance ) ? 3.5 : resonance, 
        that = Filter24( _cutoff, _resonance, true )
    
    that.isLowPass = false
  	that.name = 'HPF'
    that.type = 'FX'
    
  	return that
  }
  
  FX.Presets.Schizo = {
		sane: {
			chance: .1,
			reverseChance: 0,
			pitchChance: .5,
			mix:.5,
		},
		borderline: {
			chance: .1,		
			pitchChance: .25,
			reverseChance: .5,
			mix: 1,
		},
		paranoid: {
			chance: .2,
			reverseChance: .5,
			pitchChance: .5,
			mix: 1,
		},
	};
  
  FX.Presets.Reverb = {
  	space : {
  		roomSize: .99,
  		damping: .23,
  		wet: .75,
  		dry: .25,
  	},
    small : {
      roomSize: .6,
      damping: .75,
      wet: .15,
      dry: .85,
    },
    medium: {
      roomSize: .8,
      damping: .5,
      wet: .35,
      dry: .65,
    },
    large: {
      roomSize: .85,
      damping: .3,
      wet: .55,
      dry: .45,
    }
  }
  
  FX.Presets.StereoVerb = {
  	space : {
  		roomSize: .99,
  		damping: .23,
  		wet: .75,
  		dry: .25,
  	},
    small : {
      roomSize: .6,
      damping: .75,
      wet: .15,
      dry: .85,
    },
    medium: {
      roomSize: .8,
      damping: .5,
      wet: .35,
      dry: .65,
    },
    large: {
      roomSize: .85,
      damping: .3,
      wet: .55,
      dry: .45,
    }
  }
  
  FX.Presets.Crush = {
    clean: {
      sampleRate:1,
      bitDepth:16
    },
    dirty:{
      sampleRate:.25,
      bitDepth:4
    },
    filthy:{
      sampleRate:.1,
      bitDepth:2.5
    }
  }

  return FX  
}
},{"gibberish-dsp":5}],45:[function(_dereq_,module,exports){
module.exports = function( freesound ) {
  freesound.apiKey = "4287s0onpqpp492n8snr27sp3o228nns".replace(/[a-zA-Z]/g, function(c) {
    return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
  });

  var Freesound = function() {
    var sampler = Sampler();

    var key = arguments[0] || 96541;
    var callback = null;
    var filename, request;

    sampler.done = function(func) {
      callback = func
    }

    var onload = function(request) {
      Gibber.log(filename + " loaded.")
      Gibber.Audio.Core.context.decodeAudioData(request.response, function(buffer) {
        Freesound.loaded[filename] = buffer.getChannelData(0)
        sampler.buffer = Freesound.loaded[filename];
        sampler.bufferLength = sampler.buffer.length;
        sampler.isLoaded = true;
        //sampler.end = sampler.bufferLength;
        sampler.setBuffer(sampler.buffer);
        sampler.setPhase(sampler.bufferLength);
        sampler.filename = filename;

        sampler.send(Master, 1)
        if (callback) {
          callback()
        }
      }, function(e) {
        console.log("Error with decoding audio data" + e.err)
      })
    }

    // freesound query api http://www.freesound.org/docs/api/resources.html
    if (typeof key === 'string') {
      var query = key;
      Gibber.log('searching freesound for ' + query)
      freesound.search(query, /*page*/ 0, 'duration:[0.0 TO 10.0]', 'rating_desc', null, null, null,
        function(sounds) {
          filename = sounds.sounds[0].original_filename

          if (typeof Freesound.loaded[filename] === 'undefined') {
            var request = new XMLHttpRequest();
            Gibber.log("now downloading " + filename + ", " + sounds.sounds[0].duration + " seconds in length")
            request.open('GET', sounds.sounds[0].serve + "?&api_key=" + freesound.apiKey, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
              onload(request)
            };
            request.send();
          } else {
            sampler.buffer = Freesound.loaded[filename];
            sampler.filename = filename;
            sampler.bufferLength = sampler.buffer.length;
            sampler.isLoaded = true;
            sampler.end = sampler.bufferLength;
            sampler.setBuffer(sampler.buffer);
            sampler.setPhase(sampler.bufferLength);

            sampler.send(Master, 1)
            if (callback) {
              callback()
            }
          }
        }, function() {
          displayError("Error while searching...")
        }
      );
    } else if (typeof key === 'object') {
      var query = key.query,
        filter = key.filter || "",
        sort = key.sort || 'rating_desc',
        page = key.page || 0;
      pick = key.pick || 0;

      Gibber.log('searching freesound for ' + query)

      filter += ' duration:[0.0 TO 10.0]'
      freesound.search(query, page, filter, sort, null, null, null,
        function(sounds) {
          if (sounds.num_results > 0) {
            var num = 0;

            if (typeof key.pick === 'number') {
              num = key.pick
            } else if (typeof key.pick === 'function') {
              num = key.pick();
            } else if (key.pick === 'random') {
              num = rndi(0, sounds.sounds.length);
            }

            filename = sounds.sounds[num].original_filename

            if (typeof Freesound.loaded[filename] === 'undefined') {
              request = new XMLHttpRequest();
              Gibber.log("now downloading " + filename + ", " + sounds.sounds[num].duration + " seconds in length")
              request.open('GET', sounds.sounds[num].serve + "?&api_key=" + freesound.apiKey, true);
              request.responseType = 'arraybuffer';
              request.onload = function() {
                onload(request)
              };
              request.send();
            } else {
              Gibber.log('using exising loaded sample ' + filename)
              sampler.buffer = Freesound.loaded[filename];
              sampler.bufferLength = sampler.buffer.length;
              sampler.isLoaded = true;
              sampler.end = sampler.bufferLength;
              sampler.setBuffer(sampler.buffer);
              sampler.setPhase(sampler.bufferLength);

              sampler.send(Master, 1)
              if (callback) {
                callback()
              }
            }
          } else {
            Gibber.log("No Freesound files matched your query.")
          }
        }, function() {
          console.log("Error while searching...")
        }
      );
    } else if (typeof key === 'number') {
      Gibber.log('downloading sound #' + key + ' from freesound.org')
      freesound.get_sound(key,
        function(sound) {
          request = new XMLHttpRequest();
          filename = sound.original_filename
          request.open('GET', sound.serve + "?api_key=" + freesound.apiKey, true);
          request.responseType = 'arraybuffer';
          request.onload = function() {
            onload(request)
          };
          request.send();
        }
      )
    }
    return sampler;
  }
  Freesound.loaded = {};

  return Freesound
}
},{}],46:[function(_dereq_,module,exports){
module.exports = function( freesound ) {
  freesound.setToken('6a00f80ba02b2755a044cc4ef004febfc4ccd476')

  var Freesound = function() {
    var sampler = Sampler();

    var key = arguments[0] || 96541;
    var callback = null;
    var filename, request;

    sampler.done = function(func) {
      callback = func
    }

    var onload = function(request) {
      Gibber.log(filename + " loaded.", request )
      Gibber.Audio.Core.context.decodeAudioData(request.response, function(buffer) {
        Freesound.loaded[filename] = buffer.getChannelData(0)
        sampler.buffer = Freesound.loaded[filename];
        sampler.bufferLength = sampler.buffer.length;
        sampler.isLoaded = true;
        //sampler.end = sampler.bufferLength;
        sampler.setBuffer(sampler.buffer);
        sampler.setPhase(sampler.bufferLength);
        sampler.filename = filename;

        sampler.send(Master, 1)
        if (callback) {
          callback()
        }
      }, function(e) {
        console.log("Error with decoding audio data" + e.err)
      })
    }

    // freesound query api http://www.freesound.org/docs/api/resources.html
    if (typeof key === 'string') {
      var query = key;
      Gibber.log('searching freesound for ' + query)
      // textSearch: function(query, options, success, error){ 
        // search: function(query, page, filter, sort, num_results, fields, sounds_per_page, success, error
      //freesound.search(query, /*page*/ 0, 'duration:[0.0 TO 10.0]', 'rating_desc', null, null, null,
      freesound.textSearch( query, { page:1 },// page:0, filter: 'duration:[0.0 TO 10.0]', sort:'rating_desc' }, 
        function(sounds) {
          console.log("SOUNDS", typeof sounds, sounds )
          sounds = JSON.parse( sounds )
          filename = sounds.results[0].name
          var id = sounds.results[0].id

          if (typeof Freesound.loaded[filename] === 'undefined') {
            var request = new XMLHttpRequest();
            //Gibber.log("now downloading " + filename + ", " + sounds.sounds[0].duration + " seconds in length")
            // https://www.freesound.org/apiv2/sounds/110011/download/
            request.open('GET', 'https://www.freesound.org/apiv2/sounds/'+ id + '/download', true) //"?&api_key=" + freesound.apiKey, true);
            request.responseType = 'arraybuffer';
            //request.withCredentials = true;
            request.onload = function( v ) {
              console.log("WOO HOO", v )
              onload(request)
            };
            request.send();
            freesound.getSound( id, function( val ){ console.log( val ) }, null )
          } else {
            sampler.buffer = Freesound.loaded[filename];
            sampler.filename = filename;
            sampler.bufferLength = sampler.buffer.length;
            sampler.isLoaded = true;
            sampler.end = sampler.bufferLength;
            sampler.setBuffer(sampler.buffer);
            sampler.setPhase(sampler.bufferLength);

            sampler.send(Master, 1)
            if (callback) {
              callback()
            }
          }
        }, function() {
          displayError("Error while searching...")
        }
      );
    } else if (typeof key === 'object') {
      var query = key.query,
        filter = key.filter || "",
        sort = key.sort || 'rating_desc',
        page = key.page || 0;
      pick = key.pick || 0;

      Gibber.log('searching freesound for ' + query)

      filter += ' duration:[0.0 TO 10.0]'
      freesound.search(query, page, filter, sort, null, null, null,
        function(sounds) {
          if (sounds.num_results > 0) {
            var num = 0;

            if (typeof key.pick === 'number') {
              num = key.pick
            } else if (typeof key.pick === 'function') {
              num = key.pick();
            } else if (key.pick === 'random') {
              num = rndi(0, sounds.sounds.length);
            }

            filename = sounds.sounds[num].original_filename

            if (typeof Freesound.loaded[filename] === 'undefined') {
              request = new XMLHttpRequest();
              Gibber.log("now downloading " + filename + ", " + sounds.sounds[num].duration + " seconds in length")
              request.open('GET', sounds.sounds[num].serve + "?&api_key=" + freesound.apiKey, true);
              request.responseType = 'arraybuffer';
              request.onload = function() {
                onload(request)
              };
              request.send();
            } else {
              Gibber.log('using exising loaded sample ' + filename)
              sampler.buffer = Freesound.loaded[filename];
              sampler.bufferLength = sampler.buffer.length;
              sampler.isLoaded = true;
              sampler.end = sampler.bufferLength;
              sampler.setBuffer(sampler.buffer);
              sampler.setPhase(sampler.bufferLength);

              sampler.send(Master, 1)
              if (callback) {
                callback()
              }
            }
          } else {
            Gibber.log("No Freesound files matched your query.")
          }
        }, function() {
          console.log("Error while searching...")
        }
      );
    } else if (typeof key === 'number') {
      Gibber.log('downloading sound #' + key + ' from freesound.org')
      freesound.get_sound(key,
        function(sound) {
          request = new XMLHttpRequest();
          filename = sound.original_filename
          request.open('GET', sound.serve + "?api_key=" + freesound.apiKey, true);
          request.responseType = 'arraybuffer';
          request.onload = function() {
            onload(request)
          };
          request.send();
        }
      )
    }
    return sampler;
  }
  Freesound.loaded = {};

  return Freesound
}
},{}],47:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var $ = Gibber.dollar,
      Oscillators = { Presets: {} },
      Gibberish = _dereq_( 'gibberish-dsp' ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
  
  var types = [
    'Sine',
    'Triangle',
    'Saw',
    'Square',
    'Noise',
    'PWM',
  ],
  mappingProperties = {
    frequency: {
      min: 50, max: 3200,
      hardMin:.01, hardMax:22050,
      output: LOGARITHMIC,
      timescale: 'audio',
      dimensions:1
    },
    amp: {
      min: 0, max: 1,
      hardMax:2,
      output: LOGARITHMIC,
      timescale: 'audio',
      dimensions:1
    },
    pulsewidth : {
      min: 0.01, max: .99,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    out: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    pan: { min: -1, max: 1, output: LOGARITHMIC, timescale: 'audio',},   
    note: { 
      min: 50, max: 3200, 
      hardMin:.01, hardMax:22050,
      output: LOGARITHMIC, 
      timescale: 'audio', 
      doNotProxy:true 
    },
  }
  
  for( var i = 0; i < types.length; i++ ) {
    !function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]

      Oscillators[ name ] = function() {
        var oscillator = new Gibberish[ type ]().connect( Gibber.Master ),
            args = Array.prototype.slice.call( arguments, 0 )
           
        oscillator.type = 'Gen'
        $.extend( true, oscillator, Gibber.Audio.ugenTemplate )
        
        oscillator.fx.ugen = oscillator
        
        Object.defineProperty(oscillator, '_', {
          get: function() { 
            oscillator.kill();
            return oscillator 
          },
          set: function() {}
        })
        
        if( typeof oscillator.note === 'undefined' ) {
          oscillator.note = function( pitch ) {
            var freq = this.frequency()
            if( typeof freq === 'number' || typeof freq === 'function' ) {
              this.frequency = typeof pitch === 'function' ? pitch() : pitch
            }else{
              freq[ 0 ] = pitch
            }
          }
        }
        
        oscillator.name = name
        
        Gibber.createProxyProperties( oscillator, mappingProperties )

        var proxyMethods = [ 'note','send' ]
        
        if( name === 'Sampler' ) { proxyMethods.push( 'pickBuffer' ) }
        
        Gibber.createProxyMethods( oscillator, proxyMethods )

        Gibber.processArguments2( oscillator, args, name )

        oscillator.toString = function() { return '> ' + name }
        
        return oscillator
      }
    }()
  }
  
  // $script.ready('gibber', function() {
  // 
  // })
  
  Oscillators.Wavetable = function( table ) {
    var oscillator = new Gibberish.Table().connect( Gibber.Master )
    if( table ) oscillator.setTable( table )
    
    oscillator.type = 'Gen'

    $.extend( true, oscillator, Gibber.Audio.ugenTemplate )

    oscillator.fx.ugen = oscillator
    
    Object.defineProperty(oscillator, '_', {
      get: function() { 
        oscillator.kill();
        return oscillator 
      },
      set: function() {}
    })
    
    if( typeof oscillator.note === 'undefined' ) {
      oscillator.note = function( pitch ) {
        var freq = this.frequency()
        if( typeof freq === 'number' || typeof freq === 'function' ) {
          this.frequency = typeof pitch === 'function' ? pitch() : pitch
        }else{
          freq[ 0 ] = pitch
        }
      }
    }
    
    Gibber.createProxyProperties( oscillator, {
      frequency: {
        min: 50, max: 3200,
        output: LOGARITHMIC,
        timescale: 'audio',
        dimensions:1
      },
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
        dimensions:1
      },
      out: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
        dimensions:1
      },
    })
    
    Gibber.createProxyMethods( oscillator, ['note'] )
    
    obj.toString = function() { return '> Wavetable' }
    return oscillator
  }
  
  Oscillators.Grains = function() {
    var props = typeof arguments[0] === 'object' ? arguments[0] : arguments[1],
        bufferLength = props.bufferLength || 88200,
        a,
        //a/ = Sampler().record( props.input, bufferLength ),
        oscillator
    
    if( props.input ) {
      a = Sampler().record( props.input, bufferLength )
    }else if( props.buffer ) {
      bufferLength = props.buffer.length
    }
    
    if(typeof arguments[0] === 'string') {
      var preset = Gibber.Presets.Grains[ arguments[0] ]
      if( typeof props !== 'undefined') $.extend( preset, props )
      oscillator = new Gibberish.Granulator( preset )
    }else{
      oscillator = new Gibberish.Granulator( props )
    }
  
    oscillator.loop = function(min, max, time, shouldLoop) {
      var curPos = this.position
  		min = isNaN(min) ? .25 : min;
  		max = isNaN(max) ? .75 : max;
  		time = isNaN(time) ? Gibber.Clock.time( 1 ) : Gibber.Clock.time( time );
	
  		shouldLoop = typeof shouldLoop === "undefined" ? true : shouldLoop;
    
      this.position = new Gibberish.Line( min, max, time, shouldLoop )
  
  		var mappingObject = this;
  		if(shouldLoop === false) {
  			future( function() { mappingObject.position = curPos }, Gibber.Clock.time( time ) );
  		}
      
      return oscillator
  	}
    
    if( a ){
      future( function() {
    	  oscillator.setBuffer( a.getBuffer() );
        oscillator.connect()
    	  oscillator.loop( 0, 1, bufferLength ); // min looping automatically
    
        a.disconnect()
      }, bufferLength + 1)
    }else{
      oscillator.connect()
      oscillator.loop( 0, 1, bufferLength );
    }
    
    oscillator.type = 'Gen'

    $.extend( true, oscillator, Gibber.Audio.ugenTemplate )

    oscillator.fx.ugen = oscillator

    Object.defineProperty(oscillator, '_', {
      get: function() { 
        oscillator.disconnect(); 
        return oscillator 
      },
      set: function() {}
    })
    
    oscillator.toString = function() { return 'Grains' }
    return oscillator
  }
  
  Oscillators.Presets.Grains = {
  	tight : {
  		numberOfGrains : 10,
  		grainSize : 44 * 25,
  		positionMin : -.05,
      positionMax : .05,
      speedMin : -.1,
      speedMax : .1,
  		shouldReverse : false,
  	},
  	cloudy : {
  		numberOfGrains : 20,
  		positionMin : -.25,
      positionMax : .25,
      speedMin : -.1,
      speedMax : 4,
  		grainSize : 44 * 100,
  		shouldReverse : true,
  	},
    flurry : {
      speed:2,
      speedMin:-2,
      speedMax:2,
      position:0,
      positionMin:0,
      positionMax:0,
      numberOfGrains:20,
      grainSize : 44 * 25,
    },  
  }
  
  return Oscillators
}
},{"gibberish-dsp":5}],48:[function(_dereq_,module,exports){
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
},{}],49:[function(_dereq_,module,exports){
module.exports = function( Gibber ) { 
  "use strict"
  
  var Samplers = { Presets:{} },
      Gibberish = _dereq_( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = _dereq_('./clock')( Gibber ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC

  var mappingProperties = {
    amp: {
      min: 0, max: 1,
      hardMax:2,
      output: LOGARITHMIC,
      timescale: 'audio',
      dimensions:1
    },
    start: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    end: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    pitch: {
      min: 1, max: 4,
      hardMin: .01, hardMax: 20,      
      output: LOGARITHMIC,
      timescale: 'audio',
    },
    out: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    pan: { min: -1, max: 1, output: LOGARITHMIC, timescale: 'audio',},   
    note: { 
      min: .1, max: 4, 
      output: LOGARITHMIC, 
      timescale: 'audio', 
      doNotProxy:true 
    },
  }
  
  Samplers.Sampler = function() {
    var args = Array.prototype.slice.call( arguments, 0 ),
        file = args[0] && args[0].file ? args[0].file : undefined,
        oscillator, buffer, name = 'Sampler'
        
      if( args[0] && args[0].buffer ) { buffer = args[0].buffer }
      if( buffer ) {
        oscillator = new Gibberish.Sampler({ 'buffer':buffer }).connect( Gibber.Master )
      }else{
        oscillator = new Gibberish.Sampler( file ).connect( Gibber.Master )
      }

      oscillator.type = 'Gen'
      $.extend( true, oscillator, Gibber.Audio.ugenTemplate )
      
      oscillator.fx.ugen = oscillator
      
      Object.defineProperty(oscillator, '_', {
        get: function() { 
          oscillator.kill();
          return oscillator 
        },
        set: function() {}
      })
      
      if( typeof oscillator.note === 'undefined' ) {
        oscillator.note = function( pitch ) {
          var freq = this.frequency()
          if( typeof freq === 'number' || typeof freq === 'function' ) {
            this.frequency = typeof pitch === 'object' ? pitch.value : pitch
          }else{
            freq[ 0 ] = pitch
          }
        }
      }

      var oldStart = oscillator.__lookupSetter__('start').bind( oscillator ),
          __start = 0
      
      Object.defineProperty(oscillator, 'start', {
        configurable: true,
        get: function() { 
          return __start 
        },
        set: function(v) {
          if( v <= 1 ) {
            __start = v * oscillator.length
          }else{
            __start = v
          }
          oldStart( __start )
          oscillator.setPhase( __start ) // TODO: HACK! Why doesn't this work automatically?
          
          return __start
        }
      })
      
      var oldEnd = oscillator.__lookupSetter__('end').bind( oscillator ),
          __end = 1
      Object.defineProperty(oscillator, 'end', {
        configurable:true,
        get: function() { 
          return __end 
        },
        set: function(v) {
          if( v <= 1 ) {
            __end = v * oscillator.length
          }else{
            __end = v
          }
          oldEnd( __end )
          oscillator.setPhase( __end ) // TODO: HACK! Why doesn't this work automatically?
          
          return __end
        }
      })
      
      Gibber.createProxyProperties( oscillator, mappingProperties )

      var proxyMethods = [ 'note', 'pickBuffer', 'switchBuffer' ]
      
      Gibber.createProxyMethods( oscillator, proxyMethods )

      Gibber.processArguments2( oscillator, args, name )
      
      oscillator.toString = function() { return name }
      
      return oscillator
  }
  
  Gibberish.Sampler.prototype.readFile = function( file ) {
    var that = this
    if( file.isFile ) {
      file.file( function( file ) {
        that.readFile( file )
      })
      return
    }
    var reader = new FileReader()
    
    reader.readAsArrayBuffer( file );

    reader.onload = function (event) {
      Gibberish.context.decodeAudioData( reader.result, function(_buffer) {
        var buffer = _buffer.getChannelData(0)
        that.setBuffer( buffer )
  			that.length = that.end = buffer.length
        that.buffers[ file.name ] = buffer
    
        that.isPlaying = true;
			
  			console.log("LOADED", file.name, buffer.length);
  			Gibberish.audioFiles[ file.name ] = buffer;
	
        if(that.onload) that.onload();
  
        if(that.playOnLoad !== 0) that.note( that.playOnLoad );
  
  			that.isLoaded = true;
      })
    }
  }
  
  Gibberish.Sampler.prototype.ondrop = function( files ) {
    for( var i = 0; i < files.length; i++ ) {
      ( function(_that) { 
        var file = files[ i ],
            reader = new FileReader(),
            that = _that, item;
        
        item = file.webkitGetAsEntry ? file.webkitGetAsEntry() : file
        
        if( item.isDirectory ) {
          var dirReader = item.createReader()
      		dirReader.readEntries( function( entries ){
      			var idx = entries.length;
      			while(idx--){
      				_that.readFile( entries[idx] );
      			}	
      		})
        }else{
          _that.readFile( item )
        }
      })( this )
    }
  }
  
  Gibberish.Sampler.prototype.pickBuffer = function() {
    this.switchBuffer( rndi( 0, this.getNumberOfBuffers() ) )
  }
  
  Gibberish.Sampler.prototype.record = function(input, recordLength) {
    this.isRecording = true;
    console.log( 'starting recording' )
    var self = this;

    this.recorder = new Gibberish.Record(input, Gibber.Clock.time( recordLength ), function() {
      console.log( 'recording finished' )
      self.setBuffer( this.getBuffer() );
      self.length = self.end = self.getBuffer().length;
      self.setPhase( self.length )
      self.isRecording = false;
    })
    .record();

    return this;
  };
  
  Gibberish.Sampler.prototype.done = function( func ) {
    this.onload =  func
    return this
  }
  
  Gibberish.Sampler.prototype.load = function( url ) {
    var xhr = new XMLHttpRequest(), initSound
        
    xhr.open( 'GET', url, true )
    xhr.responseType = 'arraybuffer'
    xhr.onload = function( e ) { initSound( this.response, url ) }
    xhr.send()
    
    console.log("now loading sample", url )
    xhr.onerror = function( e ) { console.error( "Sampler file loading error", e )}
    
    var self = this, buffer, bufferLength = 0, phase = 0
        
    function initSound( arrayBuffer, filename ) {
      Gibber.Audio.Core.context.decodeAudioData( arrayBuffer, function( _buffer ) {
        var buffer = _buffer.getChannelData(0)
  			self.length = self.end = buffer.length
        self.setPhase( self.end )
        self.setBuffer( buffer )
        self.isPlaying = true;
  			self.buffers[ filename ] = buffer;
        this.file = filename

  			console.log("sample loaded | ", filename, " | length | ", buffer.length );
  			Gibberish.audioFiles[ filename ] = buffer;
			
        if(self.onload) self.onload();
      
        if(self.playOnLoad !== 0) self.note( self.playOnLoad );
      
  			self.isLoaded = true;
      }, function(e) {
        console.log('Error decoding file', e);
      }); 
    };
    
    return this
  }
  
  Gibberish.Sampler.prototype.loadDir = function( dir ) {
    var xhr = new XMLHttpRequest(), initSound
        
    xhr.open( 'GET', dir, true )
    xhr.responseType = 'html'
    xhr.onload = function( e ) { loadDir( this.response, dir ) }
    xhr.send()
    
    console.log("now loading directory", dir )
    xhr.onerror = function( e ) { console.error( "Error loading directory", e )}
    
    var self = this
        
    function loadDir( response, dir ) {       
        var page = $( response ),
            links = $( page ).find( 'a' )
        
        for( var i = 0; i < links.length; i++ ) {
          var link = links[ i ],
              split = link.href.split( '/' ),
              url   = split[ split.length - 1 ]
              
          if( url !== '' && url !== '.DS_Store' && url !== 'node-ecstatic' ) {
            self.load( dir + '/' + url )
          }
        }
    };
    
    return this
  }
  

  Samplers.Looper = function(input, length, numberOfLoops) {
  	var that = Bus();
    $.extend( that, {
      children : [],
      input : input,
      length : Clock.time(length),
      numberOfLoops : numberOfLoops,
      pitch : 1,
      currentLoop : 0,
      loop : function() {
        that.children[ that.currentLoop ].record( that.input, that.length );
    
        var seq = {
          target: that.children[ that.currentLoop ],
          durations: that.length,
          key:'note',
          values: [ 1 ] 
        }

        that.seq.add( seq )
        that.seq.start()
        
        future(that.nextLoop, length);

        return that;
      },
      nextLoop : function() {
    		that.children[++that.currentLoop].record(that.input, that.length);
    		if(that.currentLoop < that.numberOfLoops - 1) {
    			future(that.nextLoop, length);
    		}
        var seq = {
          target: that.children[ that.currentLoop ],
          durations: that.length,
          key:'note',
          values: [ 1 ] 
        }

        that.seq.add( seq )
    	},
    })
    
    var __pitch = 1
    Object.defineProperty( that, 'pitch', {
      configurable:true,
      get: function() {
        return __pitch
      },
      set: function(v) {
        __pitch = v
        for( var i = 0; i < that.children.length; i++ ) {
          that.children[ i ].pitch = __pitch
        }
      }
    })
    
  	for(var i = 0; i < numberOfLoops; i++) {
  		that.children.push( Sampler({ pitch:that.pitch })._ );	
  		that.children[i].send(that, 1);
  	}
    
    Gibber.createProxyProperties( that, { pitch:mappingProperties.pitch } )
        
    that.stop = function() { that.seq.stop(); }
    that.play = function() { that.seq.start(); }
	
  	return that;
  }
  
  return Samplers
}
},{"./clock":40,"gibberish-dsp":5}],50:[function(_dereq_,module,exports){
/*
Score is a Seq(ish) object, with pause, start / stop, rewind, fast-forward.
It's internal phase is 

Score has start() method to start it running. next() advances to next element,
regardless of whether or not the score is running, and stats the transport running.
rewind() moves the score index to the first position.
*/

/*
Passed Timing           Result
=============           ======
Numeric literal         place function in timeline and store reference
a Function              callback. register to receive and advance. must use pub/sub.
Score.wait             pause until next() method is called
*/

module.exports = function( Gibber ) {

"use strict"

var Gibberish = _dereq_( 'gibberish-dsp' ),
    $ = Gibber.dollar

var ScoreProto = {
  start: function() { 
    if( !this.codeblock ) {
      this.connect()
    }
    this.isPaused = false
  
    return this
  },
  stop:  function() { 
    this.isPaused = true  
    return this
  },
  
  loop: function( loopPause ) {
    this.loopPause = loopPause || 0
    this.shouldLoop = !this.shouldLoop
    
    return this
  },
  
  pause: function() {
    this.isPaused = true
    
    return this
  },
  
  next: function() {
    if( !this.codeblock ) {
      this.connect()
    }
    this.isPaused = false
    
    return this
  },
}

var proto = new Gibberish.ugen()

$.extend( proto, ScoreProto )

var Score = function( data, opts ) {
  if( ! ( this instanceof Score ) ) {
    var args = Array.prototype.slice.call( arguments, 0 )
    return Gibber.construct( Score, args )
  }
  
  if( typeof opts === 'undefined' ) opts = {}
  
  this.timeline = []
  this.schedule = []
  this.shouldLoop = false
  this.loopPause = 0
  
  for( var i = 0; i < data.length; i+=2 ) {
    this.schedule.push( data[ i ] )
    this.timeline.push( data[ i+1 ] )    
  }
  
  var phase = 0, 
      index = 0,
      timeline = this.timeline,
      schedule = this.schedule,
      self = this,
      loopPauseFnc = function() {
        self.nextTime = phase = 0
        index = -1
        self.timeline.pop()
      }
      
  $.extend( this, {
    properties: { rate: 1, isPaused:true, nextTime:0  },
    name:'score',
    getIndex: function() { return index },
    callback : function( rate, isPaused, nextTime ) {
      if( !isPaused ) {
        if( phase >= nextTime && index < timeline.length ) {
          
          var fnc = timeline[ index ],
              shouldExecute = true
                    
          index++
          
          if( index <= timeline.length - 1 ) {
            var time = schedule[ index ]
            
            if( typeof time === 'number' && time !== Score.wait ) {
              self.nextTime = phase + time
            }else{
              if( time === Score.wait ) {
                self.isPaused = true
              }else if( time.owner instanceof Score ) {
                self.isPaused = true
                time.owner.oncomplete.listeners.push( self )
                // shouldExecute = false // doesn't do what I think it should do... 
              }
            }
          }else{
            if( self.shouldLoop ) {
              if( timeline[ timeline.length - 1 ] !== loopPauseFnc ) {
                timeline.push( loopPauseFnc )
              }
              self.nextTime = phase + self.loopPause
            }else{
              self.isPaused = true
            }
            self.oncomplete()
          }
          if( shouldExecute && fnc ) {
            if( fnc instanceof Score ) {
              if( !fnc.codeblock ) {
                fnc.start()
                console.log("STARTING SCORE")
              }else{
                fnc.rewind().next()
                //fnc.rewind().next()
                //fnc()
              }
            }else{
              fnc()
            }
          }
        }
        phase += rate
      }
      return 0
    },
    rewind : function() { 
      phase = index = 0 
      this.nextTime = this.schedule[ 0 ]
      return this
    },
    oncomplete: function() {
      // console.log("ON COMPLETE", this.oncomplete.listeners )
      var listeners = this.oncomplete.listeners
      for( var i = listeners.length - 1; i >= 0; i-- ) {
        var listener = listeners[i]
        if( listener instanceof Score ) {
          listener.next()
        }
      }
    }
  })
  
  this.oncomplete.listeners = []
  this.oncomplete.owner = this
  
  this.init()
  
  this.nextTime = this.schedule[ 0 ]
  
  var _rate = this.rate,
      oldRate  = this.__lookupSetter__( 'rate' )
   
  Object.defineProperty( this, 'rate', {
    get : function() { return _rate },
    set : function(v) {
      _rate = Mul( Gibber.Clock, v )
      oldRate.call( this, _rate )
    }
  })
  
  this.rate = this.rate // trigger meta-programming tie to master clock
  
  Gibber.createProxyProperties( this, {
    rate : { min: .1, max: 2, output: 0, timescale: 'audio' },
  })
}

Score.prototype = proto

Score.wait = -987654321
Score.combine = function() {
  var score = [ 0, arguments[ 0 ] ]
  
  for( var i = 1; i < arguments.length; i++ ) {
    var timeIndex = i * 2,
        valueIndex = timeIndex +  1,
        previousValueIndex = timeIndex - 1

    score[ timeIndex  ] = score[ previousValueIndex ].oncomplete
    score[ valueIndex ] = arguments[ i ]
  }
  
  return Score( score )
}

return Score

}

/*
a = Score([
  0, console.log.bind( null, 'test1'),
  seconds(.5),console.log.bind( null, 'test2'),
  Score.wait, null,
  seconds(.5),console.log.bind( null, 'test3'),
  seconds(.5),console.log.bind( null, 'test4'),
  seconds(.5),function() { a.rewind(); a.next() }
])

b = Score([
  100, console.log.bind(null,"B"),
  100, console.log.bind(null,"F"),  
  a.oncomplete, function() {
  	console.log("C")
  }
])
.start()

a.start()

-----
a = Score([
  0, console.log.bind( null, 'test1'),
  seconds(.5),console.log.bind( null, 'test2'),
  
  Score.wait, null,
  
  seconds(.5),console.log.bind( null, 'test3'),
  
  seconds(.5), Score([
    0, console.log.bind(null,"A"),
    beats(2), console.log.bind(null,"B")
  ]),
  
  Score.wait, null,
  
  seconds(.5),function() { a.rewind(); a.next() }
]).start()

-----
synth = Synth('bleep')
synth2 = Synth('bleep', {maxVoices:4})

// you need to uncomment the line below after the kick drum comes in
// and execute it

score.next()

score = Score([
  0, synth.note.score( 'c4', 1/4 ),
  
  measures(1), synth.note.score( ['c4','c5'], 1/8 ),
  
  measures(1), synth.note.score( ['c2','c3','c4','c5'], 1/16 ),
  
  measures(1), function() {
    kick = Kick().note.seq( 55,1/4 )
  },
  
  Score.wait, null,
  
  0, synth2.note.score('bb4',1/4 ),
  
  measures(1), synth2.chord.score( [['bb4','g4']], 1/4 ),
  
  measures(2), synth2.chord.score( [['c5','f4']], 1/4 ),
  
  measures(2), function() {
    synth2.chord.seq( [['eb4','bb4','d5']], 1/6 )
    synth2.note.seq.stop()
    synth2.fx.add( Delay(1/9,.35) )
    
    synth2.fadeOut(32)
  },
  
  measures(4), function() {
    ks = Pluck()
    	.note.seq( Rndi(100,600), 1/16 )
    	.blend.seq( Rndf() )
    	.fx.add( Schizo('paranoid') )
    
    Clock.rate = Line( 1, 1.1, 8 )
  },
  
  measures(8), function() {
		Master.fadeOut( 8 )
  },
  
  measures(8), Gibber.clear
  
]).start()

------

synth = Synth('bleep')

verse =  Score([ beats(1/2), synth.note.bind( synth, 'c4' ) ])
chorus = Score([ beats(1/2), synth.note.bind( synth, 'd4' ) ])
bridge = Score([ beats(1/2), synth.note.bind( synth, 'e4' ) ])

song = Score([
  0,                 verse,
  verse.oncomplete,  chorus,
  chorus.oncomplete, verse,
  verse.oncomplete,  chorus,
  chorus.oncomplete, bridge,
  bridge.oncomplete, chorus  
])

song.start()

*/
},{"gibberish-dsp":5}],51:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  //"use strict"
  
  var Gibberish = _dereq_( 'gibberish-dsp' ),
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
},{"gibberish-dsp":5}],52:[function(_dereq_,module,exports){
module.exports = function( Gibber, pathToSoundFonts ) {
  var Gibberish = _dereq_( 'gibberish-dsp' ),
      curves = Gibber.outputCurves,
      teoria = _dereq_( './theory' )( Gibber ).Teoria,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties = {
        amp: {
          min: 0, max: 1,
          hardMax:2,
          output: LOGARITHMIC,
          timescale: 'audio',
          dimensions:1
        }
      },
      cents = function(base, _cents) {
        return base * Math.pow(2,_cents/1200)
      },
      sensibleNames;
  
  sensibleNames = {
    piano : 'acoustic_grand_piano',
    guitar: 'electric_guitar_clean',
    bass  : 'acoustic_bass',
    organ : 'rock_organ',
    brass : 'synth_brass_1',
    strings:'synth_strings_1',
    choir : 'choir_aahs',
  }
  
  var SoundFont = function( soundFontName ) {
    var obj, path = SoundFont.path
    
    if( Gibber.Environment ) {
      if( Gibber.Environment.Storage.values.soundfonts ) {
        if( Gibber.Environment.Storage.values.soundfonts[ soundFontName ] ) {
          path = Gibber.Environment.Storage.values.soundfonts[ soundFontName ]
        }
      }
    }
    
    if( sensibleNames[ soundFontName ] ) soundFontName = sensibleNames[ soundFontName ];
    
    obj = new Gibberish.SoundFont( arguments[0], path ).connect( Gibber.Master )

    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    obj.fx.ugen = obj
    obj.chord = Gibber.Theory.chord
    
    Object.defineProperty(obj, '_', {
      get: function() { 
        obj.kill();
        return obj 
      },
      set: function() {}
    })
    
    obj.onload = function() {
      
      if( Gibber.Environment && Gibber.Environment.Storage.values.saveSoundFonts ) {
        if( !Gibber.Environment.Storage.values.soundfonts ) {
          Gibber.Environment.Storage.values.soundfonts = {}
        }else{
          if( Gibber.Environment.Storage.values.soundfonts[ soundFontName] ) return
        }
        
        Gibber.Environment.Storage.values.soundfonts[ soundFontName ] = Gibber.Audio.Core.SoundFont.storage[ soundFontName ]
        
        try{
          Gibber.Environment.Storage.save()
        }catch(e){
          console.log("STORAGE ERROR", e )
          
          if( e.name === 'QuotaExceededError' ) {
            console.log('Your localStorage for Gibber has been exceeded; we can\'t save the soundfile. It is still usable.')
          }
        }
      }
    }
    
    obj._note = obj.note.bind( obj ) 
    obj.note = function( name, amp ) {
      if( typeof name === 'number' ) {
        if( name < Gibber.minNoteFrequency ) {
          var scale = this.scale || Gibber.scale,
              note  = scale.notes[ name ]
              
          if( this.octave && this.octave !== 0 ) {
            var sign = this.octave > 0 ? 1 : 0,
                num  = Math.abs( this.octave )
            
            for( var i = 0; i < num; i++ ) {
              note *= sign ? 2 : .5
            }
          }
          
          name = note
        }
        var tNote = teoria.frequency.note( name ),
            noteName, _cents = 0
        
        if( tNote.note.accidental.value === 1 && tNote.note.accidental.sign !== 'b' ) { 
          var enharmonics = tNote.note.enharmonics()
          for( var i = 0; i < enharmonics.length; i++ ) {
            var enharmonic = enharmonics[ i ]
            if( enharmonic.accidental.sign === 'b' ) {
              tNote.note = enharmonic
              break;
            }
          }
        }
        
        _cents = tNote.cents 
        
        noteName =  tNote.note.name.toUpperCase() 
        if( tNote.note.accidental.value !== 0) {
          noteName += tNote.note.accidental.sign
        }
        noteName += tNote.note.octave
        
        name = noteName
      }
      
      
      obj._note( name, isNaN( amp ) ? 1 : amp, cents(1, _cents) )
      // this.playing.push({
      //   buffer:this.buffers[ name ],
      //   phase:0,
      //   increment: cents(1, _cents),
      //   length:this.buffers[ name ].length,
      //   'amp': isNaN( amp ) ? 1 : amp
      // })
    }
    
    Gibber.createProxyProperties( obj, mappingProperties )
    Gibber.createProxyMethods( obj, [ 'note', 'chord', 'send' ] )
  
    return obj
  }
  
  SoundFont.path = pathToSoundFonts || "../../../resources/soundfonts/"
  
  return SoundFont
}
},{"./theory":54,"gibberish-dsp":5}],53:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  function isInt(value) { return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value)) }
  
  var Synths = { Presets: {} },
      Gibberish = _dereq_( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = _dereq_( './clock' )( Gibber ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC

  var types = [
    [ 'PolySynth', 'Synth' ],
    [ 'PolyFM', 'FM' ],
    [ 'PolySynth2', 'Synth2' ],
    [ 'MonoSynth', 'Mono' ],
    [ 'PolyKarplusStrong', 'Pluck' ],
  ],
  _mappingProperties = {
    Synth: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio' },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      sustainLevel: { min:.01, max: 1, output: LOGARITHMIC, timescale:'audio'},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },   
    },
    Synth2: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio' },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      sustainLevel: { min:.01, max: 1, output: LOGARITHMIC, timescale:'audio'},
      cutoff : { min: 0, max: .7, output: LINEAR, timescale: 'audio' },
      resonance: { min: 0, max: 5.5, output: LINEAR, timescale: 'audio' },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },                
    },
    Mono: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio' },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LOGARITHMIC, timescale:'audio'},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LOGARITHMIC, timescale:'audio'},
      cutoff : { min: 0, max: .7, output: LINEAR, timescale: 'audio' },
      detune2: { min: 0, max: .15, output: LINEAR, timescale: 'audio' },
      detune3: { min: 0, max: .15, output: LINEAR, timescale: 'audio' },
      glide: { min:.99, max:.999995, output: LINEAR, timescale: 'audio'},
      resonance: { min: 0, max: 5.5, output: LINEAR, timescale: 'audio' },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    FM: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      sustainLevel: { min:.01, max: 1, output: LOGARITHMIC, timescale:'audio'},  
      cmRatio : { min:.1, max:50, output:LINEAR, timescale:'audio' },
      index: { min:.1, max:50, output:LINEAR, timescale:'audio' },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },     
    },
    Pluck: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },    
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      blend :{ min: 0, max: 1, output: LINEAR, timescale: 'audio' },
      damping :{ min: 0, max: 1, output: LINEAR, timescale: 'audio' },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },     
    }
  }

  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]

      Synths[ name ] = function() {
        var args = Array.prototype.slice.call( arguments, 0 ),
            obj,
            mv = 1,
            adsr = false,
            scale,
            requireReleaseTrigger = false,
            opts = {},
            optionsNum = typeof args[0] === 'string' ? 1 : 0
        
        Gibber.processArguments2( opts, args, name )
        
        for( var key in opts ) {
          if( Gibber.Audio.Clock.timeProperties.indexOf( key ) > -1 ) {
            opts[ key ] = Gibber.Clock.time( opts[key] )
          }
        }
        
        obj = new Gibberish[ type ]( opts ).connect( Gibber.Master )
        obj.type = 'Gen'
        
        $.extend( true, obj, Gibber.Audio.ugenTemplate )

        obj.fx.ugen = obj
        
        //Gibber.processArguments2( obj, args, name )        
        
        if( name === 'Vocoder' ) return obj
        
        if( name === 'Mono' ) {
          obj.note = function( _frequency, amp ) {
            if( typeof _frequency === 'undefined' ) return // rest
            if(typeof amp !== 'undefined' && amp !== 0) this.amp = amp;
              
            if( amp !== 0 ) {
              if(typeof this.frequency !== 'object' ){
                this.frequency = _frequency;
              }else{
                if( this.frequency.type !== 'property' ) {
                  this.frequency[0] = _frequency;
                  Gibberish.dirty(this);
                }else{
                  this.frequency = _frequency
                }
              }
              
              this.lastFrequency = this.frequency
              
              if( obj.envelope.getState() > 0 ) obj.envelope.run();
            }
          }
        }
        // override note method to allow note names
        obj._note = obj.note.bind( obj )
        obj.note = function() {
          var args = Array.prototype.splice.call( arguments, 0 )
          
          if( typeof args[0] === 'undefined' ) return

          args[ 0 ] = Gibber.Theory.processFrequency( obj, args[ 0 ] )
          
          this._note.apply( this, args )
          
          return this 
        }
        
        obj.chord = Gibber.Theory.chord.bind( obj )
      
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })
        
        //obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] )
        
        obj.trig = function() {
          this.note( this.lastFrequency )
        }
        
        Gibber.createProxyMethods( obj, [ 'note', 'chord', 'send', 'trig' ] )
                
        obj.name = name 
        

        //console.log( "PROCESS", args, _mappingProperties[ name ] )
        
        //Gibber.processArguments2( obj, args, obj.name )
        
        obj.toString = function() { return name }
        
        // define a continuous frequency mapping abstraction for all synths with children
        if( name !== 'Mono' ) {
          var __frequency = obj._frequency
          Object.defineProperty( obj, 'frequency', {
            configurable: true,
            get: function() { return this._frequency },
            set: function(v) { 
               __frequency = v;
               if( this.children ) {
                 for( var i = 0; i < this.children.length; i++ ) {
                   if( typeof this.children[i].frequency === 'number' ) {
                     this.children[i].frequency = __frequency
                   }else{
                     this.children[i].frequency[0] = __frequency // for binops
                   }
                 }
               }
            }
          })
        }
         
        var __scale = obj.scale;
        
        if( obj.scale ) obj.seq.scale = __scale
        
        Object.defineProperty(obj, 'scale', {
          get: function() { return __scale },
          set: function(v) {
            __scale = v;
            obj.seq.scale = __scale
          }
        })
        
        if( obj.presetInit ) obj.presetInit() 
        return obj
      }
    })()
  
  }
  
  Synths.Presets.Synth = {
  	short:  { attack: 44, decay: 1/16, },
  	bleep:  { waveform:'Sine', attack:44, decay:1/16 },
    bleepEcho: { waveform:'Sine', attack:44, decay:1/16, presetInit:function() { this.fx.add( Delay(1/6,.85 ) ) } },
    cascade: { waveform:'Sine', maxVoices:10, attack:Clock.maxMeasures, decay:Clock.beats(1/32),
      presetInit: function() { 
        this.fx.add( Gibber.Audio.FX.Delay(1/9,.2), Gibber.Audio.FX.Flanger() )
        this.pan = Sine( .25, 1 )._
      }
    },
    rhodes: { waveform:'Sine', maxVoices:4, attack:44, decay:1, 
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Tremolo(2, .2) ) },
    },
    calvin: { waveform:'PWM',  maxVoices:4, amp:.075, attack:Clock.maxMeasures, decay:1/4,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Delay(1/6,.5), Gibber.Audio.FX.Vibrato() ) }  
    },
    warble: { waveform:'Sine', attack:Clock.maxMeasures,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Vibrato(2), Gibber.Audio.FX.Delay( 1/6, .75 ) ) } 
    },
  }
  
  Synths.Presets.Synth2 = {
    pad2: { waveform:'Saw', maxVoices:4, attack:1.5, decay:1/2, cutoff:.3, filterMult:.35, resonance:4.5, amp:.2, 
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Delay( 1/9, .75 ) ) } 
    },
    pad4: { waveform:'Saw', maxVoices:4, attack:2, decay:2, cutoff:.3, filterMult:.35, resonance:4.5, amp:.2,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Delay( 1/9, .75 ) ) }
    },     
  }
  
  Synths.Presets.Mono = {
  	short : { attack: 44, decay: 1/16 },
  
  	lead : {
  		presetInit : function() { this.fx.add( Gibber.Audio.FX.Delay(1/4, .35), Gibber.Audio.FX.Reverb() ) },
  		attack: 1/8,
  		decay:1/2,
  		octave3:0,
  		cutoff:.2,
  		filterMult:.5,
  		resonance:5,
  		isLowPass: false,
  	},

  	winsome : {
  		presetInit : function() { 
        this.lfo = Gibber.Audio.Oscillators.Sine( 2, .075 )._
        this.cutoff = this.lfo
        this.detune2 = this.lfo
      },
  		attack: Clock.maxMeasures,
  		decay:1,
  		cutoff:.2,
  	},
  	bass : { 
      attack: Clock.maxMeasures,
  		decay:	1/8 - Clock.maxMeasures,
      octave: -2,
  		octave2 : -1,
  		cutoff: .5,
  		filterMult:.2,
  		resonance:1,
  	},
    bass2 : {
      attack: Clock.maxMeasures,
  		decay:	1/6,
      octave: -2,
  		octave2 : 0,
  		octave3 : 0,      
  		cutoff: .5,
  		filterMult:.2,
  		resonance:1,
      amp:.65
    },
    
    edgy: {
      presetInit: function() {
        this.decay = 1/8
        this.attack = ms(1)
      },
      octave: -2,
  		octave2 : -1,
  		cutoff: .5,
  		filterMult:.2,
      resonance:1, 
      waveform:'PWM', 
      pulsewidth:.2,
      detune2:0,
      amp:.2,
    },
  
  	easy : {
  		attack: Clock.maxMeasures,
  		decay:2,
  		octave2:0,
  		octave3:0,
  		cutoff:.3,
      glide:.9995,
  	},
    
  	easyfx : {
  		attack: Clock.maxMeasures,
  		decay:2,
      presetInit: function() {
        this.fx.add( Gibber.Audio.FX.Delay( Clock.time(1/6), .3) )
      },
      amp:.3,
  		octave2:0,
  		octave3:0,
  		cutoff:.3,
      glide:.9995,
  	},
  
    dark : {
      resonance:0,
      attack:44,
      cutoff:.075,
      amp:.35,
      filterMult:0
    },

    dark2 : {
      filterMult:.1,
      attack: Clock.maxMeasures,
      octave2:0,
      octave3:0,
      decay:1/4,
      amp:.45,
    },
    
    noise: {
      resonance:20,
      decay:1/2,
      cutoff:.3,
      glide:.99995,
      detune3:0,
      detune2:0,
      filterMult:0,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Gain(.1), Gibber.Audio.FX.Delay(1/6,.35) ) }
    },
  }
  
  Synths.Presets.FM = {
    stabs:{
      maxVoices:4,
			cmRatio : 1 / 1.0007,
			index	: 5,
			attack: Clock.maxMeasures,
			decay	: 1/8,
      amp:.1,
      presetInit: function() {
        this.bus = Gibber.Audio.Busses.Bus().fx.add( Gibber.Audio.FX.Delay(1/8,.75), Gibber.Audio.FX.LPF({ resonance:4 }) )
        this.bus.fx[1].cutoff = Gibber.Audio.Core.Binops.Add(.25, Gibber.Audio.Oscillators.Sine(.1,.2)._ )
        this.send( this.bus, .65 )
      },
    },
    bass : {
      cmRatio:1,
      index:3,
      presetInit: function() { this.attack = ms(1); },
      decay:1/16,
      octave:-2
    },
		glockenspiel : {
			cmRatio	: 3.5307,
			index 	: 1,
			attack	: 44,
			decay	: 44100,
		},
		radio : { //ljp
			cmRatio	: 1,
			index	: 40,
			attack	: 300 * 44.1,
			decay	: 500 * 44.1,
		},
		noise : { //ljp
			cmRatio	: 0.04,
			index	: 1000,
			attack	: 1 * 44.1,
			decay	: 100 * 44.1,
		},
		frog : { //ljp
			cmRatio	: 0.1,
			index	: 2.0,
			attack	: 300 * 44.1,
			decay	: 5 * 44.1,
		},
		gong : {
			cmRatio : 1.4,
			index	: .95,
			attack	: 44.1,
			decay	: 5000 * 44.1,
		},
		drum : {
			cmRatio : 1.40007,
			index	: 2,
			attack	: 44,
			decay	: 44100,
		},
		drum2 : {
			cmRatio: 1 + Math.sqrt(2),
			index: .2,
			attack: 44,
			decay: 20 * 44.1,
		},
		brass : {
      maxVoices:4,
			cmRatio : 1 / 1.0007,
			index	: 5,
			attack	: 4100,
			decay	: 1,
		},
		clarinet : {
			cmRatio	: 3 / 2,
			index	: 1.5,
			attack	: 50 * 44.1,
			decay	: 200 * 44.1,
		}
	};
  
  return Synths

}

},{"./clock":40,"gibberish-dsp":5}],54:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  "use strict"

var teoria = _dereq_('../../external/teoria.min'),
    $ = Gibber.dollar,
    isInt = function(value) { return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value)) }

var Theory = {
  Teoria: teoria,
  Scale : function( _root, _mode ) {
  	var that = {
  		root: typeof _root === "string" ? teoria.note(_root) : _root,
  		notes: [],
      degree:1,
		
  		chord : function(_notes, _offset) {
  			var _chord = [];
  			_offset = _offset || 0;
			  
        console.log("CHORD", _notes, this )
        
  			for(var i = 0; i < _notes.length; i++) {
  				_chord.push( this.notes[ _notes[i] + _offset ] );
  			}
  			return _chord;
  		},
		
  		create : function() {
        var __root = typeof root !== 'number' ? teoria.note( root ).fq() : root,
            __mode = mode
        
  			this.notes.length = 0
        
  			if( Gibber.Theory.Scales[ __mode ] ) {
  				var scale = Gibber.Theory.Scales[ __mode ]( __root )
  				scale.create( __root )// this.degree.value )
  				this.notes = scale.notes
  			}else{
  			  console.log( "No scale for the mode " + mode + " exists." )
  			}
  		},
		
  		set : function(__root, _mode) {
  			if(Array.isArray(arguments[0])) {
  				this.root = arguments[0][0];
  				this.mode = arguments[0][1];
  			}else{
  				this.root = __root;
  				this.mode = _mode;
  			}
  		},
  	};
	  
  	var mode = _mode || 'aeolian';
  	Object.defineProperty( that, 'mode', {
      configurable:true,
  		get: function() { return mode; },
  		set: function( val ) { 
        mode = val; 
        that.create(); 
      }	
  	});
    
    var root = _root || 440;
    Object.defineProperty( that, 'root', {
      get : function() { return root; },
      
      set : function( val ) { 
        if( typeof val === 'number' ) {
          root = val;
        }else if ( typeof val === 'string' ) {
          root = Theory.Teoria.note( val ).fq();
        }else if ( typeof val === 'object' ) {
          if( val.accidental ) {
            root = val.fq()
          }else{
            root = Theory.Teoria.note( val.value ).fq()
          }
        }
        
        that.create() 
      }
    });
    
    // createProxyProperty: function( obj, _key, shouldSeq, shouldRamp, dict, _useMappings ) {
    // obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority
    
    that.gibber = true // needed since createProxyProperties isn't called where this is normally set
                              // obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority
    Gibber.createProxyProperty( that, 'root', true, false, null, false, 1 )
    Gibber.createProxyProperty( that, 'mode', true, false, null, false, 1 )
    //Gibber.defineSequencedProperty( that, 'root', 1 )
    //Gibber.defineSequencedProperty( that, 'mode', 1 )    
    // Gibber.createProxyProperty( that, 'degree', true, false, null, false, 1 )    
    
    $.subscribe( '/gibber/clear', function() {
      that.seq.isConnected = false
      that.seq.isRunning = false
      that.seq.destinations.length = 0
    })  
    
    that.create( root )
    //that.toString = function() { return 'Scale: ' + that.root() + ', ' + that.mode() }
  	return that;
  },
  
  CustomScale : function( _root, _ratios ) {
    var that = {
      notes : [],
      degree: 1,// ___degree || 1,
      ratios: _ratios || [ 1, 1.10, 1.25, 1.3333, 1.5, 1.666, 1.75 ],
	
      create : function( _root ) {
        this.notes = [];
        
        var scaleRoot = typeof _root === 'number' ? _root : teoria.note( _root ).fq() ;
        
        for( var octave = 0; octave < 8; octave++ ) {
          for( var num = 0; num < this.ratios.length; num++ ) {	
            var degreeNumber = num //+ _degree - 1
            var tempRoot = scaleRoot * ( 1 + Math.floor( degreeNumber / this.ratios.length ) )
            this.notes.push( tempRoot * this.ratios[ degreeNumber % this.ratios.length ] );
          }
          scaleRoot *= 2;
        }
      
        scaleRoot = typeof _root === 'number' ? _root : teoria.note( _root ).fq() ;
  	    var negCount = 8;
        for(var octave = -1; octave >= -8; octave--) {
          scaleRoot /= 2;
          for( var num = 0; num < this.ratios.length; num++ ) {
  		      var noteNum = octave * this.ratios.length + num;
            var degreeNumber = num //+ _degree - 1
            var tempRoot = scaleRoot * ( 1 + Math.floor( degreeNumber / this.ratios.length ) )
            this.notes[noteNum] = tempRoot * this.ratios[ degreeNumber % this.ratios.length ];
          }
        }	
      },
	
    	chord : function(_notes, _offset) {
    		var _chord = [];
    		_offset = _offset || 0;
			
    		for(var i = 0; i < _notes.length; i++) {
    			_chord.push( this.notes[_notes[i] + _offset] );
    		}
    		return _chord;
    	}
    }
    
    that.create( _root );
      
    return that;
  },
  
  Scales : {
    Major: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ]) },
    Ionian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ]) },    
    Dorian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 5/3, 9/5 ]) },
    Phrygian: function( root ) { return Theory.CustomScale( root, [1, 16/15, 6/5, 4/3, 3/2, 8/5, 9/5 ]) },
    Lydian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 45/32, 3/2, 5/3, 15/8 ]) },
    Mixolydian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 8/5, 9/5 ]) },
    Minor: function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ]) },
    Aeolian : function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ]) },
    Locrian : function( root ) { return Theory.CustomScale( root, [1, 16/15, 6/5, 4/3, 62/45, 8/5, 15/8 ]) },
    MajorPentatonic : function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 3/2, 5/3 ] ) },
    MinorPentatonic : function( root ) { return Theory.CustomScale( root, [1, 6/5, 4/3, 3/2, 15/8] ) },
    Chromatic: function( root ) { return Theory.CustomScale( root, [1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 7/4, 15/8 ]) },
  	// Scales contributed by Luke Taylor
  	// Half-Whole or Octatonic Scale
  	//http://en.wikipedia.org/wiki/Octatonic_scale
    
  	HalfWhole : function(root) { return Theory.CustomScale( root, [ 1,1.059463,1.189207,1.259921,1.414214,1.498307,1.681793, 1.781797 ]); },

  	//Whole-Half or Octatonic Scale http://en.wikipedia.org/wiki/Octatonic_scale
  	WholeHalf : function(root) { return Theory.CustomScale( root, [ 1,1.122462,1.189207,1.334840,1.414214,1.587401,1.681793, 1.887749 ]); },

  	//Pythagorean Tuning http://en.wikipedia.org/wiki/Pythagorean_tuning

  	//Chromatic scale in Pythagorean tuning
  	Pythagorean : function(root) { return Theory.CustomScale( root, [ 1, 256/243, 9/8, 32/27, 81/64, 4/3, 729/512, 3/2, 128/81, 27/16, 16/9, 243/128 ]); },

  	//Major Pythagorean
  	PythagoreanMajor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 81/64, 4/3, 3/2, 27/16, 243/128 ]); },

  	//Major Pythagorean
  	PythagoreanMinor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 32/27, 4/3, 3/2, 128/81, 16/9 ]); },
	
  	// 5-limit Just Intonation http://en.wikipedia.org/wiki/List_of_intervals_in_5-limit_just_intonation
  	//Chromatic scale in 5-limit just intonation
  	Limit5 : function(root) { return Theory.CustomScale( root, [ 1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8 ]); },

  	//Major scale in 5-limit
  	Limit5Major : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ]); },

  	//Minor scale in 5-limit
  	Limit5Minor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ]); },

  	// Messiaen's modes of limited transposition http://en.wikipedia.org/wiki/Modes_of_limited_transposition
  	Mess3 : function(root) { return Theory.CustomScale( root, [1,1.122462, 1.189207, 1.259921, 1.414214, 1.498307, 1.587401, 1.781797, 1.887749 ]) },
  	Mess4 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.122462, 1.334840, 1.414214, 1.498307, 1.587401, 1.887749 ]) },
  	Mess5 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.334840, 1.414214, 1.498307, 1.887749 ]) },
  	Mess6 : function(root) { return Theory.CustomScale( root, [1, 1.122462, 1.259921, 1.334840, 1.414214, 1.587401, 1.781797, 1.887749 ]) },
  	Mess7 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.122462, 1.189207, 1.334840, 1.414214, 1.498307, 1.587401, 1.681793, 1.887749 ]) },

  	//And, a personal (anthony garcia) favorite synthetic mode, lydian flat 7:
  	Adams : function(root) { return Theory.CustomScale( root, [1, 1.122462, 1.259921, 1.414214, 1.498307, 1.681793, 1.781797 ]) },

  	//5 tone equal temperament //http://en.wikipedia.org/wiki/Equal_temperament#5_and_7_tone_temperaments_in_ethnomusicology
  	Equal5Tone : function(root) { return Theory.CustomScale( root, [ 1, 1.15, 1.32, 1.35, 1.52, 1.74 ]); },

  	//7 tone equal temperament
  	//http://en.wikipedia.org/wiki/Equal_temperament#5_and_7_tone_temperaments_in_ethnomusicology
  	Equal7Tone : function(root) { return Theory.CustomScale( root, [ 1, 1.1, 1.22, 1.35, 1.49, 1.64, 1.81 ]); },

  	Just : function(root) { return Theory.CustomScale( root, [ 1, 1.0417, 1.1250, 1.2000, 1.2500, 1.3333, 1.4063, 1.5, 1.6, 1.6667, 1.8, 1.8750] ); },
    
    Shruti: function(root) { return Theory.CustomScale( root, [1,256/243,16/15,10/9,9/8,32/27,6/5,5/4,81/64,4/3,27/20,45/32,729/512,3/2,128/81,8/5,5/3,27/16,16/9,9/5,15/8,243/128,2] ); },
  },
  
  processFrequency: function( obj, frequency ) {
    var note = frequency
    if( typeof frequency === 'string' ) {
      note = Gibber.Theory.Teoria.note( frequency ).fq()
    }else if( frequency < Gibber.minNoteFrequency ) {
      var scale = obj.scale || Gibber.scale,
          noteValue = frequency,
          isNoteInteger = isInt( noteValue ),
          note
      
      if( isNoteInteger ) {                      
        note  = scale.notes[ frequency  ]
      }else{
        var noteFloor = scale.notes[ Math.floor( noteValue )  ],
            noteCeil  = scale.notes[ Math.ceil( noteValue )  ],
            float = noteValue % 1,
            diff = noteCeil - noteFloor
        
        note = noteFloor + float * diff
      }
          
      if( obj.octave && obj.octave !== 0 ) {
        var sign = obj.octave > 0 ? 1 : 0,
            num  = Math.abs( obj.octave )
        
        for( var i = 0; i < num; i++ ) {
          note *= sign ? 2 : .5
        }
      }
    }
    
    return note
  },
  
	chord : function( val, volume ) {
		this.notation = val;
			
		if( typeof this.notation === "string" ) {
			var _root = this.notation.slice( 0,1 ),
          _octave, 
          _quality;
          
			if( isNaN( this.notation.charAt( 1 ) ) ) { 	// if true, then there is a sharp or flat...
				_root += this.notation.charAt( 1 );	// ... so add it to the root name
				_octave = parseInt( this.notation.slice( 2,3 ) );
				_quality = this.notation.slice( 3 );
			}else{
				_octave = parseInt( this.notation.slice( 1, 2 ) );
				_quality = this.notation.slice( 2 );
			}
		
			var _chord = teoria.note( _root + _octave ).chord( _quality );
			for( var j = 0; j < _chord.notes.length; j++ ) {
				var n = _chord.notes[ j ];
				this.note( typeof note === 'number' ? note : n.fq() );
			}
    }else{
			for( var k = 0; k < this.notation.length; k++ ) {
				var _note = this.scale ? this.scale.notes[ this.notation[k] ] : this.notation[ k ],
            note

        switch( typeof _note ) {
          case 'number':
            note = _note
            break;
          case 'object':
            if( _note.fq )
              note = _note.fq()
            else
              note = _note
              
            break;
          case 'string':
            note = Theory.Teoria.note( _note ).fq();
            break;
        }
        
        this.note( note )
			}
		}

		if( typeof arguments[ 1 ] !== "undefined" ) {
			this.amp = arguments[ 1 ];
		}
	
		return this;
	}
 
}

return Theory

}
},{"../../external/teoria.min":33}],55:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {

var Ugen = function( desc ) {
  var ctor = function( props ) {
    var obj = {}
    $.extend( obj, {
      properties: $.extend( {}, desc.inputs ),
      callback: desc.callback.bind( obj ),
      _init: desc.init.bind( obj ),
      name: desc.name
    })

    obj.__proto__ = Gibber.Audio.Core._synth
    
    if( typeof props === 'object' ) {
      for( var key in props ) {
        obj[ key ] = props[ key ]
      }
    }
    
    var doNotCopy = ['name','inputs','callback','init'], methods = []

    for( var key in desc ) {
      if( doNotCopy.indexOf( key ) === -1 ) {
        obj[ key ] = desc[ key ].bind( obj )
        methods.push( key )
      }
    }

    obj.init.call( obj )
    obj.oscillatorInit.call( obj )

    Gibber.createProxyProperties( obj, obj.properties )
    Gibber.createProxyMethods( obj, methods )

    for( var key in desc.inputs ) {
      if( typeof props === 'object' && props[ key ] ) {
        obj[ key ] = props[ key ]
      }else{
        obj[ key ] = desc.inputs[ key ].default
      }
    }  

    obj._init()
    
    obj.connect( Gibber.Master )
	  
    if( arguments.length > 0 )
      Gibber.processArguments2( obj, Array.prototype.slice.call( arguments, 0), obj.name )
  
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    obj.fx.ugen = obj
  
    return obj
  }

  return ctor
}

return Ugen

}

/*

// create constructor for XXX object using ugen factory
// this code would be used by end-users to create new ugens
XXX = Ugen({
  name:'Vox',
  inputs:{ 
    frequency:{ min:50, max:3000, default:440 },
    amp: { min:0, max:1, default:.1 }
  },
  callback: function( frequency, amp ) {
    this.out = this.sin( this.PI2 * (this.phase++ * frequency / 44100) ) * amp
    
    // if stereo, make this.out an array an fill appropriately
    // do not create a new array for every sample
    return this.out
  },
  init: function() {
    this.sin = Math.sin
    this.PI2 = Math.PI * 2
    this.phase = 0
    this.out =  0
  }
})

// instantiate using constructor
// frequency and amp are set to arguments
a = XXX( 330, .25 )

// can also pass dictionary
b = XXX({ frequency:250, amp:.1 })

// automatic sequencing of properties
a.frequency.seq( [440,880], 1/2 )

*/
},{}],56:[function(_dereq_,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var Vocoder = { Presets: {} },
      Gibberish = _dereq_( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = _dereq_( './clock' )( Gibber ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties =  {
        amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
        pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
        out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },     
      }
      
  Vocoder.Vocoder = function( carrier, modulator, numBands, startFreq, endFreq, Q ) {
    var vocoder = new Gibberish.Vocoder( carrier, modulator, numBands, startFreq, endFreq, Q ).connect( Gibber.Master )
    
    vocoder.type = 'Gen'
    
    $.extend( true, vocoder, Gibber.Audio.ugenTemplate )
    
    vocoder.fx.ugen = vocoder
    
    return vocoder
  }
  
  Vocoder.Robot = function( _options ) {
    var carrier, modulator, options = _options || {}, robot
    
    robot = Gibber.Audio.Vocoder.Vocoder( null, null, options.numBands || 16 )
    
    robot.disconnect()
    
    if( isNaN( options.maxVoices ) ) { options.maxVoices = 1 }
    if( isNaN( options.resonance ) ) { options.resonance = 4 }
    if( isNaN( options.attack    ) ) { options.attack = ms(1) }
    if( isNaN( options.decay     ) ) { options.decay = measures(8) }
    if( isNaN( options.pulsewidth) ) { options.pulsewidth = .05 }  

    robot.carrier = Gibber.Audio.Synths.Synth2( options )
    robot.note = robot.carrier.note.bind( robot )
    robot._note = robot.carrier._note.bind( robot )
    robot.chord = robot.carrier.chord.bind( robot )
    //robot._note = robot.carrier._note.bind( robot )
    robot.carrier._
    
    // in case robot.say.seq is called before module is loaded...
    var storeSayValues, storeSayDurations, storeInit = false
    robot.say = function( values, durations ) {
      if( storeInit === false ) {
        storeSayValues = values
        storeSayDurations = durations
        storeInit = true
      }
    }
    
    function initRobot() {
      robot.modulator = Speak( options )
      robot.modulator._

      robot.say = robot.modulator.say.bind( robot )
      Gibber.defineSequencedProperty( robot, 'say' )
      
      if( storeInit ) {
        robot.say.values = storeSayValues
        robot.say.durations = storeSayDurations
      }
      
      robot.connect()
    }
    
    if( ! Gibber.Modules[ 'gibber/publications/SpeakLib' ] ) {
      Gibber.import( 'gibber/publications/SpeakLib' ).done( function(speak) {
        var clear = setInterval( function() {
          if( typeof Speak !== 'undefined' ) {
            initRobot()
            clearInterval( clear )
          } 
        }, 250 )
      })
    }else{
      initRobot()
    }

    Gibber.defineSequencedProperty( robot, 'say' )
    Gibber.defineSequencedProperty( robot, 'chord' )    
    Gibber.defineSequencedProperty( robot, 'note' )
    
    $.extend( true, robot, Gibber.Audio.ugenTemplate )
    
    Gibber.createProxyProperties( robot, mappingProperties )
    
    
    return robot
  }

  return Vocoder
}
      
},{"./clock":40,"gibberish-dsp":5}],57:[function(_dereq_,module,exports){
!function() {

var Gibber = _dereq_( 'gibber.core.lib' )
Gibber.Audio = _dereq_( './audio.js')( Gibber )
module.exports = Gibber

}()
},{"./audio.js":34,"gibber.core.lib":2}]},{},[57])
(57)
});