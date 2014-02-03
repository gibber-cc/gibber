(function() {
  var GG = Gibber.Graphics
	
	GG.Shaders = {
		make : function( frag, vert ) {
			//console.log( ' MAKE SHADER ', frag, vert )
	    var shader = {
	    	uniforms: {
	    		"tDiffuse": { type: "t", value: null },
	        "amp": { type:"f", value:0 },
	        "time": { type:"f", value:0 },
	    	},
			
				fragmentShader :  frag || GG.Shaders.defaultFragment,
				vertexShader   :  vert || GG.Shaders.defaultVertex,
			}
		
			return shader
		},
		defaultFragment : [
			"uniform lowp float amp;",
			"uniform sampler2D tDiffuse;",
			"uniform lowp float time;",
			"varying lowp vec2 p;",
      "",
			"void main() {",
			"  gl_FragColor = texture2D( tDiffuse, p ).rgba;",
			"}"
		].join('\n'),
		defaultVertex : [
  		"varying vec2 p;",
  		"void main() {",
  			"p = uv;",
  			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
  		"}"
  	].join("\n"),
		
		Material : function( frag, vert ) {
	    var shader = {},
					fragText = typeof frag === 'object' ? frag.value : frag, 
					vertText = typeof vert === 'object' ? vert.value : vert,
					_shader = {
			    	uniforms: {
			    		"tDiffuse": { type: "t", value: null },
			        "amp": { type:"f", value:0 },
			        "time": { type:"f", value:0 },
			    	},
	
						fragmentShader :  fragText || GG.Shaders.defaultFragment,
						vertexShader   :  vertText || GG.Shaders.defaultVertex,
					}
	
			var _material = new THREE.ShaderMaterial( _shader )
	
			// if columns are passed as arguments set them up for livecoding
			if( typeof frag === 'object' ) { frag.shader = shader }
			if( typeof vert === 'object' ) { vert.shader = shader }			
			
			shader.fragmentText = _material.fragmentShader
			shader.vertexText =   _material.vertexShader
			
			Object.defineProperty( shader, 'material', {
				get: function() { return _material; },
				set: function(v) { _material = v; if( this.target) this.target.mesh.material = _material; }
			})
			
			var _target = null
			Object.defineProperty( shader, 'target', {
				get:function() { return _target },
				set:function(v) { 
					_target = v
					if( _target.mesh ) {
						_target.mesh.material = this.material;
						_target.mesh.material.needsUpdate = true;
					}
				}
			})
			
      Gibber.Graphics.graph.push( shader )
      
      shader.update = function() {}
      
			var phase = 0
			shader._update = function() {
				for(var i = 0; i < shader.mods.length; i++) {
					var mod = shader.mods[i],
              val = shader[ mod.name ],
              upper = mod.name
          
          upper = upper.charAt(0).toUpperCase() + upper.substr(1)
					//if( phase % 60 === 0 ) { console.log( mod,val, upper ) }
          
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
			shader.remove = function() {}
			
			//console.log( shader.uniforms )
      // for( var key in _shader.uniforms ) {
      //   ( function() {
      //     var propName = key,
      //         value = _shader.uniforms[ propName ].value
      //           
      //           console.log( "defining ", propName )
      //     Object.defineProperty( shader, propName, {
      //       configurable: true,
      //       get: function() { return value; },
      //       set: function(v) {
      //         value = v
      //         shader.material.uniforms[ propName ].value = value
      //       },
      //     })
      //                 
      //   })()
      // }
			shader.uniforms = _shader.uniforms
			
      var mappingProperties = shader.mappingProperties = {
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
			
      shader.mappingObjects = []
			shader.uniform = function(_name, _min, _max, _value) {
				_min = isNaN( _min ) ? 0 : _min
				_max = isNaN( _max ) ? 1 : _max				
				_value = isNaN( _value ) ? _min + (_max - _min) / 2 : _value
				
				if( typeof shader.mappingProperties[ _name ] === 'undefined' ) {
					mappingProperties[ _name ] = shader.mappingProperties[ _name ] = {
		        min:_min, max:_max,
		        output: Gibber.LINEAR,
		        timescale: 'graphics',
		      }
				}

				if( typeof shader.uniforms[ _name ] === 'undefined' ) shader.uniforms[ _name ] = { type:'f', value:_value }
				
        var property = _name,
            value = shader.uniforms[ property ].value || _value,
						prop = shader.mappingProperties[ _name ],
						mapping, oldSetter, fnc
        
        // Object.defineProperty( shader, property, {
        //   configurable: true,
        //   get: function() { return value; },
        //   set: function(v) {
        //     value = v
        //     shader.material.uniforms[ property ].value = value
        //   },
        // })

        mapping = $.extend( {}, prop, {
          Name  : property.charAt(0).toUpperCase() + property.slice(1),
          name  : property,
          type  : 'mapping',
          value : value,
          object: shader,
          oldSetter : shader.__lookupSetter__( property ),
          oldGetter:  shader.__lookupGetter__( property ),
          targets: [],
        })
        
        shader.mappingObjects.push( mapping )
        
        fnc = shader[ '_' + property ] = function(v) {
          if(v) {
            mapping.value = v
            mapping.oldSetter( mapping.value )
          }
            
          return mapping.value
        }

        fnc.set = function(v) { 
          mapping.value = v; 
          mapping.oldSetter( mapping.value ) 
        }

        fnc.valueOf = function() { return mapping.value }
        
        Object.defineProperty( shader, mapping.Name, {
          get : function()  { return mapping },
          set : function( v ) {
            shader[ mapping.Name ] = v
          }
        })

        Object.defineProperty( shader, property, {
          get : function() { return shader[ '_' + property ] },
          set : function( v ) {
            if( typeof v === 'object' && v.type === 'mapping' ) {
              Gibber.createMappingObject( mapping, v )
            }else{
              if( mapping.mapping ) mapping.mapping.remove()
              shader[ '_' + property ]( v )
              shader.material.uniforms[ property ].value = v

            }
          }
        }) 
        
        Gibber.defineSequencedProperty( shader, '_' + property )
        
			}
      
      for( var key in mappingProperties ) {
				var prop = mappingProperties [ key ]
				shader.uniform( key, prop.min, prop.max, shader[ key ] )
      } 
			
			return shader
		}
	}
	
	window.ShaderMaterial = GG.Shaders.Material
  //Gibber.Graphics.makeFragmentShader = function( fragment ) {
    // var gl = Gibber.Graphics.renderer.getContext()
    // 
    // var shader = gl.createShader( gl.FRAGMENT_SHADER )
    //   // Set the shader source code.
    // 
    // gl.shaderSource( shader, fragment )
    // 
    // // Compile the shader
    // gl.compileShader( shader )
    // 
    //   // Check if it compiled
    // var success = gl.getShaderParameter( shader, gl.COMPILE_STATUS )
    // if (!success) {
    //   // Something went wrong during compilation; get the error
    //   throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    //   return null
    // } 
})();