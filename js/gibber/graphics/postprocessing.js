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
  		  sampleDistance: 0.94,
  		  waveFactor:     0.00125
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
        amp:0,
        time:0,
      },
      init : function( fragment ) {
        var column = null, out = null, shader = null
        
        if( typeof fragment[0] === 'object' ) {
          column = fragment[0]
          console.log(column)
          fragment = column.value
        }
        
        shader = Gibber.Graphics.makeFragmentShader( fragment )
        if( shader !== null) {
          out = new THREE.ShaderPass( shader )
        }
        
        if( out !== null && column !== null ) {
          out.column = column
          column.shader = out
        }
        
        return out
      }
    },
  }

var PP = Gibber.Graphics.PostProcessing = {
  composer : null,
  fx: [],
  init : function() {
    this.composer = new THREE.EffectComposer( Gibber.Graphics.renderer );
    
		this.renderScene = new THREE.RenderPass( Gibber.Graphics.scene, Gibber.Graphics.camera );

		this.renderScene.clear = false;
		this.renderScene.renderToScreen = true;
    
    this.composer.addPass( this.renderScene )
    
    for( var key in shaders ) {
      (function() {
        var name = key,
            shaderProps = shaders[ key ]
        
        var constructor = function() {
          // if( 'shaders' in shaders[ key ] ) {
          //console.log( shaderProps, shaderProps.shaders, shaderProps.shaders[0] )
          //var shader = shaderProps.shaders[0].init({ center:undefined, angle:.5, scale:.035, mix:.1 })
          var args = Array.prototype.slice.call( arguments,0 ),
              shader = shaderProps.init.call( shaderProps, args )
          console.log( args )   
          if( shader === null) {
            console.log( "SHADER ERROR... aborting" )
            return
          }
          
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
          
          $.extend( shader, PP.shader )
          
          Gibber.Graphics.graph.push( shader )
          
          shader.update =   function() {}
          
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
          
          var mappingProperties = shader.mappingProperties = _mappingProperties[ name ]
          shader.mappingObjects = []
          for( var key in mappingProperties ) {
            (function() {
              var property = key,
                  prop = mappingProperties[ property ],
                  mapping = $.extend( {}, prop, {
                    Name  : property.charAt(0).toUpperCase() + property.slice(1),
                    name  : property,
                    type  : 'mapping',
                    value : shader[ property ],
                    object: shader,
                    oldSetter : shader.__lookupSetter__( property ),
                    targets: [],
                  }),
                  oldSetter = mapping.oldSetter
              
              shader.mappingObjects.push( mapping )
              
              Object.defineProperty( shader, mapping.Name, {
                get : function()  { return mapping },
                set : function( v ) {
                  shader[ mapping.Name ] = v
                }
              })

              Object.defineProperty( shader, property, {
                get : function() { return mapping.value },
                set : function( v ) {
                  if( typeof v === 'object' && v.type === 'mapping' ) {
                    Gibber.createMappingObject( mapping, v )
                  }else{
                    if( mapping.mapping ) mapping.mapping.remove()
                    
                    mapping.value = v
                    oldSetter.call( shader, mapping.value )
                  }
                }
              })
            })()
          } 
          
          shader.replaceWith = function( replacement ) {
      
            for( var i = 0; i < this.sequencers.length; i++ ) {
              this.sequencers[ i ].target = replacement
              replacement.sequencers.push( this.sequencers[i] )
            }
      
            for( i = 0; i < this.mappingObjects.length; i++ ) {
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

//$.extend( window, Gibber.Graphics.Geometry )

})()
