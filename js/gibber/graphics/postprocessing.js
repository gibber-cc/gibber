(function() {

"use strict"
    
var processArgs = function( args, type, shape ) {
   var _args = Gibber.processArguments( args, type ),
       out

   if( typeof args[0] === 'object' ) {
     out = []
     for( var argsKey in shape ) {
       var pushValue = typeof args[0][ argsKey ] !== 'undefined' ? args[0][ argsKey ] : shape[ argsKey ]
       out.push( pushValue )
     }
   }else if( Array.isArray( args )){
     out = args
   }else{
     out = []
     for( var argsKey in shape ) {
       out.push( shape[ argsKey ] )
     }
   }

   return out
  },
  _mappingProperties = {
    Dots: {
      angle: {
        min: 0, max: Math.PI * 2,
        output: Gibber.LINEAR,
        wrap: true,       
        timescale: 'graphics',
      },
      scale: {
        min: 0, max: 1,
        output: Gibber.LINEAR,       
        timescale: 'graphics',
      },  
    },
    Film: {
      nIntensity: {
        min: 0, max: 1,
        output: Gibber.LINEAR,      
        timescale: 'graphics',
      },
      sIntensity: {
        min: 0, max: 1,
        output: Gibber.LINEAR,      
        timescale: 'graphics',
      },
      sCount: {
        min: 0, max: 2048,
        output: Gibber.LINEAR,      
        timescale: 'graphics',
      },
    },
    Kaleidoscope: {
      angle: {
        min: 0, max: Math.PI * 2,
        output: Gibber.LINEAR,
        wrap: true,       
        timescale: 'graphics',
      },
      sides: {
        min: 2, max: 36,
        output: Gibber.LINEAR,       
        timescale: 'graphics',
      },
    },
    Focus: {
      screenWidth: {
        min: 0, max: 1024,
        output: Gibber.LINEAR, 
        timescale: 'graphics',
      },
      screenHeight: {
        min: 0, max: 1024,
        output: Gibber.LINEAR, 
        timescale: 'graphics',
      },
      sampleDistance: {
        min: 0, max: 2,
        output: Gibber.LINEAR, 
        timescale: 'graphics',
      },
      waveFactor: {
        min: 0, max: .05,
        output: Gibber.LINEAR, 
        timescale: 'graphics',
      },
    },
    Bleach : {
      opacity: {
        min: 0, max: 1,
        output: Gibber.LINEAR,
        timescale: 'graphics',
      }
    },
    Shader : {
      amp:{
        min:0, max:1,
        output: Gibber.LINEAR,
        timescale: 'graphics',
      },
      time:{
        min:0, max:1,
        output: Gibber.LINEAR,
        timescale: 'graphics',
      },
    }
  },
  shaders = {
     Dots: {
  		properties: {
    		angle:  .5,
    		scale:  .035,
        center: new THREE.Vector2( .5, .5 ),
  		},
  		type:'uniforms',
  		init : function(obj) {
  			var _center = obj.center ? new THREE.Vector2( obj.center[0], obj.center[1] ) : new THREE.Vector2( .5, .5 );
  			return new THREE.DotScreenPass( _center, obj.angle, obj.scale, obj.mix );
  		},
    },
    Film: {
			properties:{
				nIntensity: 1,
				sIntensity: .5,
				sCount: 1024,
				grayscale: false,
				mix: 1,
			},
			type:'uniforms',
			init: function(obj) {
        obj = obj || {}
				obj.nIntensity = obj.nIntensity || 1
				obj.sIntensity = obj.sIntensity || .5
				obj.sCount = obj.sCount || 1024
				obj.grayscale = obj.grayscale || false
				obj.mix = obj.mix || 1
				return new THREE.FilmPass( obj.nIntensity, obj.sIntensity, obj.sCount, obj.grayscale, obj.mix )
			}
		},
    Kaleidoscope: {
      properties: {
    		sides: 6.0,
    		angle: 0.0,
      },
      
      init: function( obj ) {
        obj = obj || {}
        obj.sides = obj.sides || 6
        obj.angle = obj.angle || 0
        
        return new THREE.ShaderPass( THREE.KaleidoShader )
      }
    },
    Edge: {
      properties: {
    		aspect: new THREE.Vector2( 512, 512 ) ,
      },
      
      init: function(obj) {
        obj = obj || {}
        obj.aspect = obj.aspect || shaders.Edge.properties.aspect
        
        return new THREE.ShaderPass( THREE.EdgeShader )
      }
    },
    Focus : {
      properties : {
  		  screenWidth:    1024,
  		  screenHeight:   1024,
  		  sampleDistance: 2,
  		  waveFactor:     0.1
      },
      init: function(obj) {
        return new THREE.ShaderPass( THREE.FocusShader )
      }
    },
    Godrays : {
      properties: {},
      init: function() {
        return new THREE.ShaderPass( THREE.ShaderGodRays )
      }
    },
    Bleach :{ 
      properties: { opacity: 1 },
      init : function() {
        return new THREE.ShaderPass( THREE.BleachBypassShader )
      }
    },
    Colorify : {
      properties: { color: new THREE.Color( 0xff0000 ) },
      init: function( obj ) {
        obj = obj || {}
        console.log( obj.color )
        obj.color = typeof obj.color === 'string' ? new THREE.Color( Color(obj.color).hexString() ) : shaders.Colorify.properties.color
        
        var shader = new THREE.ShaderPass( THREE.ColorifyShader )
        shader.uniforms[ 'color' ].value = obj.color
        return shader
      }
    },
    Shader : {
      properties : {
        amp:.1,
        time:0,
      },
			fragment : null,
			vertex : null,
      init : function( fragment, vertex ) {
        var columnV = null, columnF = null, out = null, shader = null
        if( fragment && typeof fragment === 'object' ) {
          columnF  = fragment
          fragment = Gibber.Graphics.PostProcessing.defs + columnF.value
        }
				
        if( vertex && typeof vertex === 'object' ) {
          columnV = vertex
          vertex = columnV.value
        }
        
        shader = Gibber.Graphics.Shaders.make( fragment, vertex )
				
        if( shader !== null) {
          out = new THREE.ShaderPass( shader )
        }
        
        if( out !== null ) {
					out.fragmentText = shader.fragmentText
					out.vertexText = shader.vertexText
          if( columnV ) { out.columnV = columnV; columnV.shader = out }
					if( columnF ) { out.columnF = columnF; columnF.shader = out }
        }
        	
        return out
      },
    },
  }

var PP = Gibber.Graphics.PostProcessing = {
  composer : null,
  fx: [],
  isRunning : false,
  defs: [
    "#define PI 3.14159265358979323846264",
    "float rand(vec2 co){",
    "  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
    "}\n",
  ].join('\n'),
  
  start: function() {
    this.composer = new THREE.EffectComposer( Gibber.Graphics.renderer );

    this.renderScene = new THREE.RenderPass( Gibber.Graphics.scene, Gibber.Graphics.camera );

    this.renderScene.clear = true;
    this.renderScene.renderToScreen = true;

    this.composer.addPass( this.renderScene )
    this.isRunning = true
  },
  init : function() {
    // Gibber.Graphics.running = true
    for( var key in shaders ) {
      (function() {
        var name = key,
            shaderProps = shaders[ key ],
            mappingProperties = _mappingProperties[ key ]
        
        var constructor = function() {
          // if( 'shaders' in shaders[ key ] ) {
          //console.log( shaderProps, shaderProps.shaders, shaderProps.shaders[0] )
          //var shader = shaderProps.shaders[0].init({ center:undefined, angle:.5, scale:.035, mix:.1 })
          if( Gibber.Graphics.canvas === null){
            Gibber.Graphics.init('2d', null, false)
          }
          
          Gibber.Graphics.running = true 
          
					if( name !== 'Shader' ) {
	          var args = Array.prototype.slice.call( arguments,0 ),
	              shader = shaderProps.init.call( shaderProps, args )
					}else{
					  shader = shaderProps.init( arguments[0], arguments[1] )
          }
          
          Gibber.createProxyProperties( shader, {} ) // call with empty object to initialize
          
					shader.uniform = function(_name, _value, _min, _max, type ) {
						_min = isNaN( _min ) ? 0 : _min
						_max = isNaN( _max ) ? 1 : _max				
						_value = isNaN( _value ) && typeof _value !== 'object' ? _min + (_max - _min) / 2 : _value
		        
						if( typeof shader.mappingProperties[ _name ] === 'undefined' ) {
							_mappingProperties[ _name ] = shader.mappingProperties[ _name ] = {
				        min:_min, max:_max,
				        output: Gibber.LINEAR,
				        timescale: 'graphics',
				      }
						}
            
            var info = getShaderInfo( _value, type, _name ),
                shaderType = info[0],
                threeType  = info[1],
                shaderString = info[2]
            
            console.log( "TYPE = ", shaderType, threeType )
            
						if( typeof shader.uniforms[ _name ] === 'undefined' && ( shader.columnF ) ) {
              var text = shaderString
              text += shader.columnF.editor.getValue()
              shader.columnF.editor.setValue( text )
            }
            
            shader.uniforms[ _name ] = { 'type': threeType, value:_value }
            
            Object.defineProperty( shader, _name, {
              configurable: true,
              get : function() { return shader.uniforms[_name].value },
              set : function(v){ return shader.uniforms[_name].value = v }
            })
            Gibber.createProxyProperty( shader, _name, true )
            
            shader[ _name ] = _value
            
            return shader
          }
					
          
          if( shader === null) {
            console.log( "SHADER ERROR... aborting" )
            return
          }
          
          if( !PP.isRunning ) { PP.start() }

          shader.renderToScreen = true
          
          shader.name = name
          shader.sequencers = []
          
          if( PP.fx.length > 0 ) {
            PP.fx[ PP.fx.length - 1 ].renderToScreen = false;
          }
        

          //console.log( shader )
          PP.composer.addPass( shader )
          //return shader;
          PP.fx.push( shader )
          // console.log(shader.material.program)
          // console.log( gl );
          // 
          // Gibber.Utilities.future( function() {
          //   var status = gl.getProgramParameter( shader.material.program, gl.LINK_STATUS )
          //   if( !status ) { 
          //     console.log(" REMOVING BUGGY SHADER ", status)
          //     shader.remove() 
          //   }
          // }, 44 * 15)
          
          PP.defineProperties( shader )
          
          console.log( shader, mappingProperties )
          
          for( var key in mappingProperties ) {
    				var prop = mappingProperties [ key ]
    				shader.uniform( key, shader[ key ], prop.min, prop.max, shader.uniforms[ key ].type )
          }
          
          $.extend( shader, PP.shader )
          
          Gibber.Graphics.graph.push( shader )
          
          shader.update = function() {}
          
    			shader._update = function() {
    				for(var i = 0; i < shader.mods.length; i++) {
    					var mod = shader.mods[i],
                  val = shader[ mod.name ],
                  upper = mod.name
              
              upper = upper.charAt(0).toUpperCase() + upper.substr(1)
              
              if( Array.isArray( val ) ) val = val[0]
              
    					switch(mod.type) {
    						case "+":
    							shader[ upper ].value = typeof mod.modulator === "number" ? val + mod.modulator : val + mod.modulator.getValue() * mod.mult
    							break
    						case "++":
    							shader[ upper ].value = typeof mod.modulator === "number" ? val + mod.modulator : val + Math.abs( mod.modulator.getValue() * mod.mult )
    							break							
    						case "-" :
    							shader[ upper ].value = typeof mod.modulator === "number" ? val - mod.modulator : val - mod.modulator.getValue() * mod.mult
    							break
    						case "=":
    							shader[ upper ].value = typeof mod.modulator === "number" ? mod.modulator : mod.modulator.getValue() * mod.mult
    							break
    						default:
    						break;	
    					}
              
              shader[ upper ].oldSetter.call( this, shader[ upper ].value ) 
    				}
            
            if( typeof shader.time !== 'undefined' ) shader.time += 1/60;
						
						shader.update()
    			}
      
    			shader.mods = []
    			shader.mod = function( _name, _modulator, _type, _mult ) {
    				this.mods.push({ name:_name, modulator:_modulator, type:_type || "+", mult: _mult || 1 })
    			}
          
          shader.removeMod = function( name ) {
            if( name ) {
              for( var i = 0; i < this.mods.length; i++ ) {
                var m = this.mods[ i ]
                if( m.name === name ) {
                  this.mods.splice( i, 1 )
                  break
                }
              }
            }
          }
          
          shader.replaceWith = function( replacement ) {
      
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
      
            this.remove()
          }

          shader.properties = shaderProps.properties
          
          Gibber.processArguments2( shader, Array.prototype.slice.call( arguments,0 ), shader.name )
          
          shader.mappings = []
          
          Object.defineProperty( shader, '_', {
            get: function() { 
              if( shader.seq.isRunning ) shader.seq.disconnect()  
      
              for( var i = 0; i < shader.mappings.length; i++ ) {
                shader.mappings[ i ].remove() 
              }
      
              if( shader.clearMarks ) // check required for modulators
                shader.clearMarks()
            
              shader.remove(); 
              //console.log( type + ' is removed.' ) 
            },
            set: function() {}
          })
          
          return shader;
        }
        window[ name ] = constructor;
      })()
    }
  },
  
  defineProperties: function( shader ) {
    for( var key in shaders[ shader.name ].properties ) {
      ( function( _shader ) {
        var propName = key,
            value = shaders[ shader.name ].properties[ propName ]
        
        Object.defineProperty( shader, propName, {
          configurable: true,
          get: function() { return value; },
          set: function(v) {
            value = v
            shader.uniforms[ propName ].value = value
          },
        })
                
      })( shader )
    }
  },
  
  shader: {
    remove : function() {
      PP.composer.passes.splice( PP.composer.passes.indexOf( this ), 1 )
      PP.fx.splice( PP.fx.indexOf( this ), 1 )
      if( PP.fx.length > 0 ) {
        PP.fx[ PP.fx.length - 1 ].renderToScreen = true;
      }
      for( var key in this.mappingProperties) {
        var Key = key.charAt(0).toUpperCase() + key.slice(1)
        
        if( typeof this[ Key ].mapping === 'object' ) {
          this[ Key ].mapping.remove()
        }
      }
    }
  },
}

var types = [
  [ 'Vec2', 'Vector2', 'vec2' ],
  [ 'Vec3', 'Vector3', 'vec3' ],
  [ 'Vec4', 'Vector4', 'vec4' ],    
]
.forEach( function( element, index, array ) {
  var type = element[ 0 ],
    threeType = element[ 1 ] || element[ 0 ],
    shaderType = element[ 2 ] || 'f'
    
  window[ type ] = function() {
    var args = Array.prototype.slice.call( arguments, 0 ),
        obj
    
    if( Array.isArray( args[0] ) ) {
      var _args = []
      for( var i = 0; i < args[0].length; i++ ) {
        _args[ i ] = args[0][ i ]
      }
      args = _args
    }    
        
    obj = Gibber.construct( THREE[ threeType ], args )
    
    obj.name = type
    obj.shaderType = shaderType
    
    return obj
  }
})

var threeTypes = {
  'vec2' : 'v2',
  'vec3' : 'v3',
  'vec4' : 'v4',
  'int'  : 'i',
  'float'  : 'f'
}

var getShaderInfo = function( value, type, _name ) {
  var shaderType = null, threeType = null, shaderString = '', isArray = false
  
  if( type ) {
    if( type in threeTypes ) {
      shaderType = type
    }else{
      for( var key in threeTypes ) {
        if( threeTypes[ key ] === type ) {
          shaderType = key
          break;
        }
      }
    }
  }else{
    if( Array.isArray( value ) ) {
      var arrayMember = value[ 0 ],
          arrayMemberType = arrayMember.shaderType || typeof arrayMember
          
      if( arrayMemberType === 'number' ) {
        var isInt = arrayMember % 1 === 0
        
        // check to make sure all elements are ints, otherwise use float
        if( isInt ) { isInt = value.every( function( element ) { return element % 1 === 0 } ) }
        
        shaderType = isInt ? 'int' : 'float'
      }else{
        shaderType = arrayMemberType
      }
      isArray = true
    }else if( typeof value === 'object' ){
      shaderType = value.shaderType
    }else{
      shaderType = typeof value
      if( shaderType === 'number' ) {
        console.log("CHECKING FLOAT VS INT")
        shaderType = value % 1 === 0 ? 'int' : 'float'
      } 
    }
  }
  
  shaderString = "uniform " + shaderType + " " + _name
  
  shaderString += isArray ? '[' + value.length + '];\n' : ';\n'
  
  threeType = threeTypes[ shaderType ]
  if( isArray ) {
    threeType += shaderType.indexOf( 'vec' ) > - 1 ? 'v' : 'v1'
  }
  
  return [ shaderType, threeType, shaderString ]
}

})()
