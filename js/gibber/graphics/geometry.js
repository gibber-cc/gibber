(function() {

"use strict"

var parametricFunc = function() {
  var points = rndf(-50,50,3)
  
  return { x:points[0], y:points[1], z:points[2] }
}

var types = {
      Cube:   { width:50, height:50, depth:50 },
      Sphere: { radius:50, segments:16, rings: 16 },
      Tetrahedron: { radius:50, detail: 0 },
      Octahedron: { radius:50, detail: 0 },
      Icosahedron: { radius:50, detail: 0 },
      Cylinder: { radiusTop:20, radiusBottom:20, height:100, radiusSegments:8, heightSegments:1, openEnded:false},
      Parametric: { func: parametricFunc, slices:8, stacks:8 },
      
      Torus:  { radius:50, tube:10, radialSegments:8, tubularSegments:8, arc:Math.PI * 2 },
      TorusKnot: { radius: 50, tube:20, radialSegments:64, tubularSegments: 8, p:5, q:3, heightScale:1 },
      Plane: { width:1, height:1, segmentsWidth:1, segmentsHeight:1 },
    },
    vectors = [ 'rotation', 'scale', 'position' ],
    processArgs = function( args, type, shape ) {
     var _args = Gibber.processArguments( args, type ),
         out
  
     if( typeof args[0] === 'object' ) {
       out = []
       for( var argsKey in shape ) {
         var pushValue = typeof args[0][ argsKey ] !== 'undefined' ? args[0][ argsKey ] : shape[ argsKey ]
         out.push( pushValue )
       }
       for( var arg in args[ 0 ] ) {
         if( ! shape[arg] ) {
           out[ arg ] = args[ 0 ][ arg ]
         }
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
   mappingProperties = {
     rotation: {
       min: 0, max: Math.PI * 2,
       output: Gibber.LINEAR,
       wrap: true,       
       timescale: 'graphics',
     },
     scale: {
       min: 0, max: 2,
       output: Gibber.LINEAR,
       wrap: false,
       timescale: 'graphics',
     },
     position: {
       min: -100, max: 100,
       output: Gibber.LINEAR,
       wrap: false,
       timescale: 'graphics',
     }
   }

Gibber.Graphics.Geometry = {}

for( var key in types) {

  (function() {
    var type = key,
        shape = types[ key ]
    var constructor = function() {
      if( Gibber.Graphics.canvas === null){
        Gibber.Graphics.init('3d', null, false)
      }else if( Gibber.Graphics.mode === '2d' ) {
        Gibber.Graphics.use( '3d' )
      }
      
      Gibber.Graphics.running = true 

      var args = processArgs( arguments, type, shape )

      this.name = type
      
      this.fill =     args.fill || new THREE.Color(0xffffff)
      var hasShader = typeof arguments[0] !== 'undefined' && arguments[0].shader
      
      if( !hasShader) {
        if( !args.texture ) {
          this.material = new THREE.MeshPhongMaterial( { color: this.fill, shading: THREE.FlatShading, shininess: 50 } )
        }else{
          this.material = new THREE.MeshBasicMaterial({ map: args.texture, affectedByDistance:false, useScreenCoordinates:true })
        }
      }else{
        this.material = new THREE.ShaderMaterial( arguments[0].shader.material || arguments[0].shader );
        if( arguments[0].shader.material ) arguments[0].shader.target = this
      }
      this.geometry = Gibber.construct( THREE[ type + "Geometry" ], args )
      
      this.mesh = new THREE.Mesh( this.geometry, this.material )

      this.spinX = this.spinY = this.spinZ = 0
      
      this.seq = Gibber.Seq()
    
      this.mappingProperties = mappingProperties
      this.mappingObjects = []
      
      var ltrs = { x:'X', y:'Y', z:'Z' }
      for( var i = 0; i < vectors.length; i++ ) {
        
        (function( obj ) { // for each vector rotation, scale, position
          var prop = vectors[ i ],
              property = prop === 'scale' ? Vec3(1, 1, 1) : Vec3(),
              update = function() { 
                //console.log( property.toArray() )
                obj.mesh[ prop ].set( property.x(), property.y(), property.z() )
                //obj.mesh[ prop ].set.apply( obj.mesh[ prop ], property.toArray() ) 
              },
              x = property.x, y = property.y, z = property.z
          
          Object.defineProperties( property, {
            x: { get: function() { return x }, set: function(v) { x = v; update() }, configurable:true },
            y: { get: function() { return y }, set: function(v) { y = v; update() }, configurable:true },
            z: { get: function() { return z }, set: function(v) { z = v; update() }, configurable:true },
          })
          
          property.name = type + '.' + prop
          
          for(var _ltr in ltrs) {
            (function() {
              var ltr = _ltr,
                  Ltr = ltrs[ ltr ],
                  propertyDict = mappingProperties[ prop ],
                  propertyName = prop + ltr,
                  mapping = $.extend( {}, propertyDict, {
                    Name  : Ltr,
                    name  : ltr,
                    modName : prop + '.' + ltr,
                    type  : 'mapping',
                    value : property[ ltr ],
                    object: property,
                    modObject: obj,
                    targets:[],
                    oldSetter: property.__lookupSetter__( ltr ),
                    oldGetter: property.__lookupGetter__( ltr ),            
                    set : function( val )  { property[ ltr ] = val },
                  }),
                  fnc
              
              mapping.object = property
              
              fnc = obj[ '_' + propertyName ] = function(v) {
                if( typeof v !== 'undefined' ) {
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
              
              Object.defineProperty( property, Ltr, {
                get: function()  { return mapping },
                set: function(v) { 
                  property[ Ltr ] = v 
                }
              })
              
              Object.defineProperty( property, ltr, {
                get: function() { return obj[ '_' + propertyName ] },
                set: function(v) {
                  if( typeof v === 'object' && v.type === 'mapping' ) {
                    Gibber.createMappingObject( mapping, v )
                  }else{
                    if( mapping.mapping ) mapping.mapping.remove()
                    obj[ '_' + propertyName ]( v )
                  }
                }
              })
              
              Gibber.defineSequencedProperty( obj, '_' + propertyName )
              Gibber.defineRampedProperty( obj, '_' + propertyName )
            })()
          }
                    
          var propertyDict = mappingProperties[ prop ], 
              mapping
              
          mapping = $.extend( {}, propertyDict, {
            Name  : prop.charAt(0).toUpperCase() + prop.slice(1),
            name  : prop,
            type  : 'mapping',
            value : property,
            object: obj,
            targets:[],
            oldSetter : function(v) {
              switch( $.type( v ) ) {
                case 'object' :
                  if(typeof v.x === 'number') property.x = v.x
                  if(typeof v.y === 'number') property.y = v.y
                  if(typeof v.z === 'number') property.z = v.z
                break;
                case 'array' :
                  if(typeof v[0] === 'number') property.x = v[ 0 ]
                  if(typeof v[1] === 'number') property.y = v[ 1 ]
                  if(typeof v[2] === 'number') property.z = v[ 2 ]
                  break;
                case 'number' :
                  x = y = z = v
                  break;
              }
              update()
            }
          })

          Object.defineProperty( obj, prop, {
            get: function() { return property },
            set: function(v) {
              if( mapping.mapping ) mapping.mapping.remove()
              switch( $.type( v ) ) {
                case 'object' :
                  if( v.type === 'mapping' ) {
                    Gibber.createMappingObject( mapping, v )
                  }else{
                    if(typeof v.x === 'number') property.x = v.x
                    if(typeof v.y === 'number') property.y = v.y
                    if(typeof v.z === 'number') property.z = v.z
                  }
                  break;
                case 'array' :
                  if(typeof v[0] === 'number') property.x = v[ 0 ]
                  if(typeof v[1] === 'number') property.y = v[ 1 ]
                  if(typeof v[2] === 'number') property.z = v[ 2 ]
                  break;
                case 'number' :                  
                  property.x = property.y = property.z = v
                  break;
              }
              update()
            },            
          })
                    
          Object.defineProperty( obj, mapping.Name, {
            get: function() { return mapping },
            set: function(v) {
              if( typeof v === 'object' && v.type === 'mapping' ) {
                Gibber.createMappingObject( mapping, v )
              }
            }
          })
          
          property.mappings = []
          Gibber.defineSequencedProperty( obj, prop )
          Gibber.defineRampedProperty( obj, prop )
          
        })( this )
        
      }
      
      this.update = function() {}
          
			this._update = function() {
				for( var i = 0; i < this.mods.length; i++ ) {
					var mod = this.mods[ i ],
              val,
              prop,
              upper,
              newVal
          
          if( mod.name.indexOf( '.' ) > -1 ) {
            var parts = mod.name.split( '.' )
            val  = this[ parts[ 0 ] ][ parts[ 1 ] ]()
            upper = parts[ 1 ].toUpperCase()
            
  					switch( mod.type ) {
  						case "+":
  							newVal = typeof mod.modulator === "number" ?  val + mod.modulator * mod.mult : val + mod.modulator.getValue() * mod.mult
  							break
  						case "++":
  							newVal += typeof mod.modulator === "number" ? val + Math.abs( mod.modulator * mod.mult) : val + Math.abs( mod.modulator.getValue() * mod.mult )
  							break							
  						case "-" :
  							newVal = typeof mod.modulator === "number" ? val - mod.modulator * mod.mult : val - mod.modulator.getValue() * mod.mult
  							break
  						case "=":
  							newVal = typeof mod.modulator === "number" ? mod.modulator : mod.modulator.getValue() * mod.mult
  							break
  						default:
  						break;	
  					}
            
            this[ parts[ 0 ] ][ parts[1] ].set( newVal )
            
          }else{
            var modValue = typeof mod.modulator === "number" ? mod.modulator : mod.modulator.getValue()
            
  					switch(mod.type) {
  						case "+":
                this[ mod.name ].x += modValue * mod.mult
                this[ mod.name ].y += modValue * mod.mult
                this[ mod.name ].z += modValue * mod.mult

  							break
  						case "++":
                this[ mod.name ].x += Math.abs( modValue * mod.mult )
                this[ mod.name ].y += Math.abs( modValue * mod.mult )
                this[ mod.name ].z += Math.abs( modValue * mod.mult )

  							break							
  						case "-" :
                this[ mod.name ].x -= modValue * mod.mult 
                this[ mod.name ].y -= modValue * mod.mult 
                this[ mod.name ].z -= modValue * mod.mult

  							break
  						case "=":
                this[ mod.name ].x = modValue * mod.mult 
                this[ mod.name ].y = modValue * mod.mult 
                this[ mod.name ].z = modValue * mod.mult                

  							break
  						default:
  						break;	
  					}
          }
				}
			}
      
			this.mods = []
      
      this.remove = this.kill = function(shouldNotRemove) {
        Gibber.Graphics.scene.remove( this.mesh )
        if( !shouldNotRemove )
          Gibber.Graphics.graph.splice( Gibber.Graphics.graph.indexOf( this ), 1 )
          
        return this
      }
      
      this.replaceWith = function( newObj ) { this._ }
      
			this.mod = function( _name, _modulator, _type, _mult ) {
				this.mods.push({ name:_name, modulator:_modulator, type:_type || "+", mult: _mult || 1 })
        
        return this
			}
      
      this.removeMod = function( name ) {
        if( name ) {
          for( var i = this.mods.length - 1; i >= 0; i-- ) {
            var m = this.mods[ i ]
            if( m.name === name ) {
              this.mods.splice( i, 1 )
              //break
            }
          }
        }else{
          this.mods = []
        }
      }
      
      this.ramp = function( prop, from, to, time ) {
        if( arguments.length === 3 ) {
          time = to
          to = from
          from = this[ prop ]
        }        
      }
      
      this.spin = function( x,y,z ) {
        if( arguments.length === 1 ) {
          if( x !== 0 ) {
            this.mod('rotation', x )
          }else{
            this.removeMod('rotation', 0 )
            this.removeMod('rotation.x', 0 )
            this.removeMod('rotation.y', 0 )
            this.removeMod('rotation.z', 0 )
          }
        }else if( arguments.length === 0){
          this.removeMod( 'rotation' )
        }else{
          if( x !== 0 ) {
            this.mod( 'rotation.x', x )
          }else{
            this.removeMod( 'rotation.x' )
          }
          if( y !== 0 ) {
            this.mod( 'rotation.y', y )
          }else{
            this.removeMod( 'rotation.y' )
          }
          if( z !== 0 ) {
            this.mod( 'rotation.z', z )
          }else{
            this.removeMod( 'rotation.z' )
          }
        }
        return this
      }
      
      if( arguments[0] ) {
        if( arguments[0].scale ) this.scale = arguments[0].scale
        if( arguments[0].rotation ) this.scale = arguments[0].rotation
        if( arguments[0].position ) this.scale = arguments[0].position
      }
                
      Gibber.Graphics.scene.add( this.mesh )
      Gibber.Graphics.graph.push( this )
      
      this.mappings = []
      
      Object.defineProperty( this, '_', {
        get: function() { 
          if( this.seq.isRunning ) this.seq.disconnect()  
      
          for( var i = 0; i < this.mappings.length; i++ ) {
            this.mappings[ i ].remove() 
          }
      
          if( this.clearMarks ) // check required for modulators
            this.clearMarks()
            
          this.remove(); 
          console.log( type + ' is removed.' ) 
        },
        set: function() {}
      })
      
      this.toString = function() { return this.name }
      
      console.log( type + ' is created.' )
    } 

    Gibber.Graphics.Geometry[ type ] = function() { // wrap so no new keyword is required
      return Gibber.construct( constructor, arguments )
    }

  })()
}

$.extend( window, Gibber.Graphics.Geometry )

window.Knot = window.TorusKnot
delete window.TorusKnot 

})()
