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
			"uniform float amp;",
			"uniform sampler2D tDiffuse;",
			"uniform float time;",
			"varying vec2 p;",
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
              
        Object.defineProperty( shader, _name, {
          configurable: true,
          get: function() { return _value; },
          set: function(v) {
            _value = v
            shader.material.uniforms[ _name ].value = v
          },
        })
        
        Gibber.createProxyProperty( shader, _name )
        shader[  _name.charAt(0).toUpperCase() + _name.slice(1) ].timescale = 'graphics' // TODO: why is this necessary?
        
        return shader
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