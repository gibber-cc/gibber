define(['gibber/graphics/three.min'], 
	function(){	
		require([
			'gibber/graphics/OBJLoader'
		]);
	var that = {		
		init : function() {				
			window.Model = that.model;
			window.Cylinder = that.cylinder;
			window.Torus = that.torus;
			window.Knot = that.torusKnot;
			window.Tetrahedron = that.tetrahedron;
			window.Icosahedron = that.icosahedron;
			window.Octahedron = that.octahedron;
			window.Cube = that.cube;
			window.Sphere = that.sphere;
		},
		colorFace : function(color, faceNumber) {
			var faceIndices = ['a', 'b', 'c', 'd'];  
			
			if(this.children) {
				geometry = this.children[0].geometry;
			}
			if(typeof faceNumber === 'number') {
				var face = geometry.faces[ faceNumber || 0 ]; 
				var numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
				
				var _color = color ? color : Color(0,0,0);
				if(typeof _color === 'function') {
					_color = Color(_color());
				}
				
				for( var j = 0; j < numberOfSides; j++ )  {
				    var vertexIndex = face[ faceIndices[ j ] ];
				    var color = new THREE.Color( 0xffffff );
				    color.setRGB( 1, 0, 0 );
				    face.vertexColors[ j ] = color;
				}
			}else{
				for(var i = 0; i < geometry.faces.length; i++) {
					var _color = color ? color : Color(0,0,0);
					if(typeof _color === 'function') {
						_color = Color(_color());
					}
					
					var face = geometry.faces[ i ]; 

					var numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
					for( var j = 0; j < numberOfSides; j++ )  {
					    var vertexIndex = face[ faceIndices[ j ] ];
					    face.vertexColors[ j ] = _color;
					}
				}
			}
			geometry.colorsNeedUpdate = true;
		},
		
/**#Geometry - Geometry
This outlines a collection of shared methods and properties for all primitive geometries and 3D models ([Cube](javascript:Gibber.Environment.displayDocs('Cube'\)),
[Sphere](javascript:Gibber.Environment.displayDocs('Sphere'\), [Icosahedron](javascript:Gibber.Environment.displayDocs('Icosahedron'\)), [Tetrahedron](javascript:Gibber.Environment.displayDocs('Tetrahedron'\)), [Octahedron](javascript:Gibber.Environment.displayDocs('Octahedron'\)),
[Icosahedron](javascript:Gibber.Environment.displayDocs('Icosahedron'\)), [Cylinder](javascript:Gibber.Environment.displayDocs('Cylinder'\)), [Torus](javascript:Gibber.Environment.displayDocs('Torus'\)),  [Knot](javascript:Gibber.Environment.displayDocs('Knot'\)), [Model](javascript:Gibber.Environment.displayDocs('Model'\))). They all have similar methods for changing colors, positions, rotation, scale etc.
**/
		 
/**###Geometry.rotation : property
Object. The rotation of the object in radians. There are x, y, and z properties to this property. There are four different ways to set this property:  
  
`geometry.rotation = 1; // the x,y and z rotations will all be set to 1
geometry.rotation = [0,1,0]; // the rotation along the x and z axis will be set to 0, y will be 1
geometry.rotation = {x:0, y:1, z:0};
geometry.rotation.x = 1; // only the rotation on the x axis is changed`
**/

/**###Geometry.position : property
Object. The position of the object. There are x, y, and z properties to this property. There are four different ways to set this property:  
  
`geometry.position = 0; // the x,y and z position will all be set to 0. This will center the object.
geometry.position = [0,50,0]; // y is 50, x and z are 0
geometry.position = {x:0, y:50, z:0};
geometry.position.x = 50; // only the position on the x axis is changed`
**/

/**###Geometry.scale : property
Object. The scale of the object. There are x, y, and z properties to this property. There are four different ways to set this property:  
  
`geometry.scale = 1; // the x,y and z scale will all be set to 1.
geometry.scale = [2,4,2]; // y is 4, x and z are 2
geometry.scale = {x:1, y:2, z:1};
geometry.scale.x = 10; // only the scale on the x axis is changed`
**/

/**###Geometry.fill : property
Object. The color of light the geometry faces reflect. There are r, g, and b properties to this property. There are five different ways to set this property, including
strings. The recognized color names are: red, black, grey, white, green, blue, cyan, magenta, yellow, pink, orange, purple. Other ways to set the property are:  
  
`geometry.fill = 1; // the r,g and b properties will all be set to 1.
geometry.fill = [0,1,0]; // green
geometry.fill = {r:1, g:0, b:0}; // red
geometry.fill.r = 1; // only the red amount is changed
geometry.fill = "purple";`
**/	

/**###Geometry.stroke : property
Object. The color of light the geometry wireframe reflects. This property only works if a stroke color is set upon initialization, otherwise no wireframe is created.
There are r, g, and b properties to this property. There are five different ways to set this property, including
strings. The recognized color names are: red, black, grey, white, green, blue, cyan, magenta, yellow, pink, orange, purple. Other ways to set the property are:  
  
`geometry.stroke = 1; // the r,g and b properties will all be set to 1.
geometry.stroke = [0,1,0]; // green
geometry.stroke = {r:1, g:0, b:0}; // red
geometry.stroke.r = 1; // only the red amount is changed
geometry.stroke = "purple";`
**/	
/**###Geometry.remove : method
Removes the geometry from the scene. 
### Example Usage ###
`graphics();
a = Cube({
	fill: [1,0,0],
	stroke:[.5,0,0],
	height: 50,
});
a.spin(.01);  
a.remove();`
**/
/**###Geometry.mod : method
Modulate a parameter of the geometry each frame

**param** *propertyName*: String. The property to be modulated.  
  
**param** *source*: Number or Object. The modulation source. This can be a constant number or an object that outputs a time varying value (like an LFO).  
  
**param** *type*: String. Default value is "+". How the modulation source should be applied to the property. Options are "+", "-", "\*", "++", and "=". "++" means 
absolute addition, where the absolute value of the modulation source is added to the property.  
  
**param** *scale*: Float. A scalar to multiply the output of the modulation source by before it is applied to the property.  

### Example Usage ###
`graphics();
a = Cube({
	fill: [1,0,0],
	stroke:[.5,0,0],
	height: 50,
});
b = Drums('xoxo');
f = Follow(b);
a.mod('sx', f, "=", 64);
a.spin(.01);`
**/

/**###Geometry.removeMod : method
Remove a modulation by name.
### Example Usage ###
`graphics();
a = Cube({
	fill: [1,0,0],
	stroke:[.5,0,0],
	height: 50,
});
a.mod('rx', .01);
a.removeMod('rx');`
**/

		geometry : function(props, geometry) {
			props.fill = props.fill ? Graphics.color(props.fill) : Graphics.color('grey');
			props.stroke = props.stroke ? Graphics.color(props.stroke) : undefined;
			
      var _graphics = that;
			var that;
			if(!geometry.isModel) {
				var materials = props.stroke ?  [
				    new THREE.MeshPhongMaterial( { color: props.fill, shading: THREE.FlatShading, shininess:props.shiny || 50, specular:props.specular || 0xffffff, vertexColors:THREE.VertexColors } ),
					new THREE.MeshBasicMaterial( { color: props.stroke, shading: THREE.FlatShading, wireframe: true, transparent: true } )
				] 
				: new THREE.MeshPhongMaterial( { color: props.fill, shading: THREE.FlatShading, shininess:props.shiny || 50 } );
				
				that = props.stroke ? 
					THREE.SceneUtils.createMultiMaterialObject( geometry, materials ) :
					new THREE.Mesh(	geometry, materials);
			}else{
				that = geometry;
			}
			
			that.category = "graphics";
			
			that.remove = that.kill = function() {
				Graphics.scene.remove(that);
			};
			
			that._update = function() {
				for(var i = 0; i < this.mods.length; i++) {
					var mod = this.mods[i];
					switch(mod.type) {
						case "+":
							this[mod.name] += typeof mod.modulator === "number" ? mod.modulator : mod.modulator.function.getValue() * mod.mult;
							break;
						case "++":
							this[mod.name] += typeof mod.modulator === "number" ? mod.modulator : Math.abs(mod.modulator.function.getValue() * mod.mult);
							break;							
						case "-" :
							this[mod.name] -= typeof mod.modulator === "number" ? mod.modulator : mod.modulator.function.getValue() * mod.mult;
							break;
						case "=":
							this[mod.name] = typeof mod.modulator === "number" ? mod.modulator : mod.modulator.function.getValue() * mod.mult;
							break;
						default:
						break;	
					}
				}
			};
			that.mods = [];
			that.mod = function(_name, _modulator, _type, _mult) {
				this.mods.push({name:_name, modulator:_modulator, type:_type || "+", mult: _mult || 1 });
			};
			Graphics.scene.add(that);
			
			that.x = that.position.x;
			that.y = that.position.y;
			that.z = that.position.z;
			
			that.rx = that.rotation.x;
			that.ry = that.rotation.y;
			that.rz = that.rotation.z;
			
			var scale = {x:1, y:1, z:1};
			var rotation = {x:0, y:0, z:0};
			var position = {x:0, y:0, z:0};
			var fill = props.fill;
			var stroke = props.stroke;
			
			Object.defineProperties(that, {
				fill : {
					get: function() { 
						if(that.children.length > 0) {
							return that.children[0].material.color; 
						}
						return that.material.color;
					},
					set: function() {
						var val = arguments[0];
						if(typeof val === 'object') {
							if(Array.isArray(val)) {
								if(that.children.length > 0) {
									that.children[0].material.color.r = val[0];
									that.children[0].material.color.g = val[1];
									that.children[0].material.color.b = val[2];
								}else{
									that.material.color.r = val[0];
									that.material.color.g = val[1];
									that.material.color.b = val[2];
								}
							}else{
								if(that.children.length > 0) {
									that.children[0].material.color = val;
								}else{
									that.material.color = val;
								}
							}
						}else if(typeof val === 'number') {
							if(that.children.length > 0) {
								that.children[0].material.color.r = val;
								that.children[0].material.color.g = val;
								that.children[0].material.color.b = val;
							}else{
								that.material.color.r = val;
								that.material.color.g = val;
								that.material.color.b = val;
							}
						}else if(typeof val === 'string') {
							if(that.children.length > 0) {
								that.children[0].material.color = Graphics.color(val);
							}else{
								that.material.color = Graphics.color(val);
							}
						}
					}
				},
				
				// TODO: make a stroke mesh if it doesn't already exist
				stroke : {
					get: function() { 
						if(that.children.length > 0) {
							return that.children[1].material.color; 
						}
						return undefined;
					},
					set: function() {
						var val = arguments[0];
						if(typeof val === 'object') {
							if(Array.isArray(val)) {
								if(that.children.length > 0) {
									that.children[1].material.color.r = val[0];
									that.children[1].material.color.g = val[1];
									that.children[1].material.color.b = val[2];
								}
							}else{
								if(that.children.length > 0) {
									that.children[1].material.color = val;
								}
							}
						}else if(typeof val === 'number') {
							if(that.children.length > 0) {
								that.children[1].material.color.r = val;
								that.children[1].material.color.g = val;
								that.children[1].material.color.b = val;
							}
						}else if(typeof val === 'string') {
							if(that.children.length > 0) {
								that.children[1].material.color = Graphics.color(val);
							}
						}
					}
				},
				
				
				x : { get: function() { return this.position.x; }, set: function(val) { this.position.x = val; } },
				y : { get: function() { return this.position.y; }, set: function(val) { this.position.y = val; } },
				z : { get: function() { return this.position.z; }, set: function(val) { this.position.z = val; } },	
				
				rx : { get: function() { return this.rotation.x; }, set: function(val) { this.rotation.x = val; } },
				ry : { get: function() { return this.rotation.y; }, set: function(val) { this.rotation.y = val; } },
				rz : { get: function() { return this.rotation.z; }, set: function(val) { this.rotation.z = val; } },
				
				sx : { get: function() { return this.scale.x; }, set: function(val) { this.scale.x = val; } },
				sy : { get: function() { return this.scale.y; }, set: function(val) { this.scale.y = val; } },
				sz : { get: function() { return this.scale.z; }, set: function(val) { this.scale.z = val; } },

				scale : { 
					get: function() { return scale; }, 
					set: function(val) { 
						if(typeof val === 'object') {
							if(Array.isArray(val)) {
								scale.x = val[0];
								scale.y = val[1];
								scale.z = val[2];
							}else{
								scale = val;
							}
						}else if(typeof val === 'number') {
							scale.x = val;
							scale.y = val;
							scale.z = val;
						}

						this.sx = scale.x;
						this.sy = scale.y;
						this.sz = scale.z;
					}
				},
				rotation : { 
					get: function() { return rotation; }, 
					set: function(val) { 
						if(typeof val === 'object') {
							if(Array.isArray(val)) {
								rotation.x = val[0];
								rotation.y = val[1];
								rotation.z = val[2];
							}else{
								rotation = val;
							}
						}else if(typeof val === 'number') {
							rotation.x = val;
							rotation.y = val;
							rotation.z = val;
						}
						
						this.rx = rotation.x;
						this.ry = rotation.y;
						this.rz = rotation.z;
					}
				},
				position : { 
					get: function() { return position; }, 
					set: function(val) { 
						if(typeof val === 'object') {
							if(Array.isArray(val)) {
								position.x = val[0];
								position.y = val[1];
								position.z = val[2];
							}else{
								position = val;
							}
						}else if(typeof val === 'number') {
							position.x = val;
							position.y = val;
							position.z = val;
						}
						
						this.rx = position.x;
						this.ry = position.y;
						this.rz = position.z;
					}
				},			
			});		
			// TODO : fix colorFace problem
			that.colorFace = that.colorFace;
			
			that.spin = function() {
				if(arguments.length === 0) {
					that.mod('rx', .01);
					that.mod('ry', .01);
					that.mod('rz', .01);
				}else if(arguments.length === 1) {
					if(arguments[0] === 0) {
						console.log("REMOVING ALL ROTATION MODS");
						that.removeMod('rx');
						that.removeMod('ry');
						that.removeMod('rz');
					}else{
						that.mod('rx', arguments[0]);
						that.mod('ry', arguments[0]);
						that.mod('rz', arguments[0]);
					}
				}else{
					if(arguments[0]) {
						if(arguments[0] !== 0) {
							that.mod('rx', arguments[0]);
						}else{
							that.removeMod('rx');
						}
					}
					if(arguments[1]) {
						if(arguments[1] !== 0) {
							that.mod('ry', arguments[1]);
						}else{
							that.removeMod('ry');
						}
					}
					if(arguments[2]) {
						if(arguments[2] !== 0) {						
							that.mod('rz', arguments[2]);
						}else{
							that.removeMod('rz');
						}
					}
				}
			};
			
			that.removeMod = function() {
				var killme = [];
				for(var i = 0; i < that.mods.length; i++) {
					var mod = that.mods[i];
					if(typeof arguments[0] === 'string') {
						if(arguments[0] === mod.name) {
							killme.push(mod);
						}
					}
				}
				for(var i = 0; i < killme.length; i++) {
					that.mods.remove(killme[i]);
				}
			}
			
			that.update = function() {};
			Gibberish.extend(that, props);
			Graphics.graph.push(that);
						
			return that;
		},

/**#Icosahedron - Geometry
A twenty sided 3D geometry. See the [Geometry](javascript:Gibber.Environment.displayDocs('Geometry'\)) reference for details on properties and methods. 

## Example Usage ##
`graphics();
a = Icosahedron({
	fill: [1,0,0],
	stroke:[.5,0,0],
	radius: 50,
	detail:0
});
a.spin(.01);`

## Constructor
**param** *properties*: Object. A dictionary of property names and values to set. There are two extra constructor properties that can be set 
'radius' and 'detail'.
**/

/**###Icosahedron.radius : property
Float. The size of the icosahedron. This can only be set in a dictionary passed to the constructor method. You can change the size of the object using the scale property
after the object has been created.	
**/

/**###Icosahedron.detail : property
Integer. The number of times each face in the icosahedron is subdivided into 4 triangles. For example, an icosahedron with a detail of
2 would have 320 faces (20 > 80 > 320).
**/

		icosahedron : function(props) {
			props = props || {};
			var geometry = new THREE.IcosahedronGeometry( props.radius || 50, props.detail || 0	 );
			
			return that.geometry(props, geometry);
		},

/**#Octahedron - Geometry
An eight sided 3D geometry. See the [Geometry](javascript:Gibber.Environment.displayDocs('Geometry'\)) reference for details on properties and methods. 

## Example Usage ##
`graphics();
a = Octahedron({
	fill: [1,0,0],
	stroke:[.5,0,0],
	radius: 50,
	detail:0
});
a.spin(.01);`

## Constructor
**param** *properties*: Object. A dictionary of property names and values to set. There are two extra constructor properties that can be set 
'radius' and 'detail'.
**/

/**###Octahedron.radius : property
Float. The size of the octahedron. This can only be set in a dictionary passed to the constructor method. You can change the size of the object using the scale property
after the object has been created.	
**/

/**###Octahedron.detail : property
Integer. The number of times each face in the octahedron is subdivided into 4 triangles. For example, an octahedron with a detail of
2 would have 320 faces (20 > 80 > 320).
**/
		
		octahedron : function(props) {
			props = props || {};
			var geometry = new THREE.OctahedronGeometry( props.radius || 50, props.detail || 0 );
			return that.geometry(props, geometry);
		},
		
/**#Tetrahedron - Geometry
An eight sided 3D geometry. See the [Geometry](javascript:Gibber.Environment.displayDocs('Geometry'\)) reference for details on properties and methods. 

## Example Usage ##
`graphics();
a = Tetrahedron({
	fill: [1,0,0],
	stroke:[.5,0,0],
	radius: 50,
	detail:0
});
a.spin(.01);`

## Constructor
**param** *properties*: Object. A dictionary of property names and values to set. There are two extra constructor properties that can be set 
'radius' and 'detail'.
**/

/**###Tetrahedron.radius : property
Float. The size of the icosahedron. This can only be set in a dictionary passed to the constructor method. You can change the size of the object using the scale property
after the object has been created.	
**/

/**###Tetrahedron.detail : property
Integer. The number of times each face in the tetrahedron is subdivided into 4 triangles. For example, an tetrahedron with a detail of
2 would have 320 faces (20 > 80 > 320).
**/
		
		tetrahedron : function(props) {
			props = props || {};
			var geometry = new THREE.TetrahedronGeometry( props.radius || 50, props.detail || 0 );
			geometry.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) );
			
			return that.geometry(props, geometry);
		},

/**#Sphere - Geometry
An sphereical 3D geometry. See the [Geometry](javascript:Gibber.Environment.displayDocs('Geometry'\)) reference for details on properties and methods. 

## Example Usage ##
`graphics();
a = Sphere({
	fill: [1,0,0],
	stroke:[.5,0,0],
	radius: 50,
});
a.spin(.01);`

## Constructor
**param** *properties*: Object. A dictionary of property names and values to set. There are two extra constructor properties that can be set 
'radius', 'rings' and 'segments'. These can only be set in the constructor.
**/

/**###Sphere.radius : property
Float. The size of the sphere. This can only be set in a dictionary passed to the constructor method. You can change the size of the object using the scale property
after the object has been created.	
**/

/**###Sphere.rings : property
Integer. The vertical resolution of the sphere. This property can only be set in the constructor.
**/

/**###Sphere.segments : property
Integer. The horizontal resolution of the sphere. This property can only be set in the constructor.
**/

		
		sphere : function(props) {
			props = props || {};
			var geometry = new THREE.SphereGeometry( props.radius || 50, props.segments || 16, props.rings || 16 );
			return that.geometry(props, geometry);
		},
/**#Cube - Geometry
An cubical 3D geometry. See the [Geometry](javascript:Gibber.Environment.displayDocs('Geometry'\)) reference for details on properties and methods. 

## Example Usage ##
`graphics();
a = Cube({
	fill: [1,0,0],
	stroke:[.5,0,0],
	height: 50,
});
a.spin(.01);`

## Constructor
**param** *properties*: Object. A dictionary of property names and values to set. There are two extra constructor properties that can be set 
'width', 'height' and 'depth'. These can only be set in the constructor.
**/

/**###Cube.width : property
Float. The size of the cube along the x axis. This property can only be set in the constructor.
**/

/**###Cube.height : property
Float. The size of the cube along the y axis. This property can only be set in the constructor.
**/

/**###Cube.depth : property
Float. The size of the cube along the z axis. This property can only be set in the constructor.	
**/
	
		cube : function(props) {
			props = props || {};
			var geometry = new THREE.CubeGeometry( props.width || 50, props.height || 50, props.depth || 50 );
			return that.geometry(props, geometry);
		},

/**#Cylinder - Geometry
An cylindrical 3D geometry. See the [Geometry](javascript:Gibber.Environment.displayDocs('Geometry'\)) reference for details on properties and methods. 

## Example Usage ##
`graphics();
a = Cylinder({
	fill: [1,0,0],
	stroke:[.5,0,0],
	height: 50,
	radiusTop: 25,
	radiusBottom: 25,
});
a.spin(.01);`

## Constructor
**param** *properties*: Object. A dictionary of property names and values to set. There are six extra constructor properties that can be set 
'radiusTop', 'radiusBottom', 'height', 'radiusSegments', 'heightSegments', 'openEnded'. These can only be set in the constructor.
**/

/**###Cylinder.height : property
Float. The height of the cylinder. This property can only be set in the constructor.
**/

/**###Cylinder.radiusTop : property
Float. The width of the cylinder at the top. This property can only be set in the constructor
**/

/**###Cylinder.radiusBottom : property
Float. The width of the cylinder at the bottom. This property can only be set in the constructor
**/

/**###Cylinder.heightSegments : property
Integer. The number of segments along the vertical axis. Default is 1 and should probably be left that way unless you plan to do some type
of vertices deformation. This property can only be set in the constructor.
**/

/**###Cylinder.radiusSegments : property
Integer. The number of segments around the vertical axis. Default is 8. This property can only be set in the constructor.
**/

/**###Cylinder.openEnded : property
Boolean. Default true. Whether or not the cylinder appears hollow. This property can only be set in the constructor.
**/

		cylinder : function(props) {
			props = props || {};
			var geometry = new THREE.CylinderGeometry( 
				props.radiusTop,
				props.radiusBottom,
				props.height,
				props.radiusSegments,
				props.heightSegments,
				props.openEnded
			);
			return that.geometry(props, geometry);
		},	
/**#Torus - Geometry
A 3D ring. See the [Geometry](javascript:Gibber.Environment.displayDocs('Geometry'\)) reference for details on properties and methods. 

## Example Usage ##
`graphics();
a = Torus({
  fill:[1,0,0],
  stroke:[.5,0,0],
  scale:.75,
  tube:10,
  tubularSegments:16
});
a.spin(.01);`

## Constructor
**param** *properties*: Object. A dictionary of property names and values to set. There are five extra constructor properties that can be set 
'radius', 'tube', 'radialSegments', 'tubularSegments', 'arc'. These can only be set in the constructor.
**/

/**###Torus.tube : property
Float. The thickness of the tube that the ring is composed of. This property can only be set in the constructor
**/

/**###Torus.radius : property
Float. The overall size of the torus geometry. This property can only be set in the constructor
**/

/**###Torus.radialSegments : property
Integer. The resolution traveling around the geometry. This property can only be set in the constructor
**/

/**###Torus.tubularSegments : property
Integer. The resolution of the tube. This property can only be set in the constructor
**/

/**###Torus.arc : property
Float. The size of the arc created by the torus. Default is 2PI (a ring). Interesting patterns can be made using higher values.
**/
		
		torus : function(props) {
			props = props || {};
			if(props.segments) {
				props.radialSegments = props.segments;
				props.tubularSegments = props.segments;
			}
			var geometry = new THREE.TorusGeometry( 
				props.radius,
				props.tube,
				props.radialSegments,
				props.tubularSegments,
				props.arc
			);
			return that.geometry(props, geometry);
		},
		
/**#Knot - Geometry
A torus twisted into a knot. See the [Geometry](javascript:Gibber.Environment.displayDocs('Geometry'\)) reference for details on properties and methods. 

## Example Usage ##
`graphics();
a = Knot({
  fill:[1,0,0],
  stroke:[.5,0,0],
  scale:.75,
  tube:10,
  tubularSegments:16
});
a.spin(.01);`

## Constructor
**param** *properties*: Object. A dictionary of property names and values to set. There are six extra constructor properties that can be set 
'radius', 'tube', 'radialSegments', 'tubularSegments', 'p', 'q', 'scaleHeight'. These can only be set in the constructor.
**/

/**###Knot.tube : property
Float. The thickness of the tube that the ring is composed of. This property can only be set in the constructor
**/

/**###Knot.radius : property
Float. The overall size of the torus geometry. This property can only be set in the constructor
**/

/**###Knot.radialSegments : property
Integer. The resolution traveling around the geometry. This property can only be set in the constructor
**/

/**###Knot.tubularSegments : property
Integer. The resolution of the tube. This property can only be set in the constructor
**/

/**###Knot.p : property
Float. Angular momentum along one axis.
**/	

/**###Knot.q : property
Float. Angular momentum along another axis.
**/	

/**###Knot.scaleHeight : property
Float. Allows you to stretch the knot and create interesting elongated forms.
**/	

		torusKnot : function(props) {
			props = props || {};
			var geometry = new THREE.TorusKnotGeometry( 
				props.radius,
				props.tube,
				props.radialSegments,
				props.tubularSegments,
				props.p,
				props.q,
				props.scaleHeight
			);
			return that.geometry(props, geometry);
		},
/**#Model - Geometry
A 3D model loaded from an .obj file. See the [Geometry](javascript:Gibber.Environment.displayDocs('Geometry'\)) reference for details on properties and methods. 

## Example Usage ##
`graphics();
a = Model({
  model : "models/WaltHead.obj",
  fill:[1,0,0],
  stroke:[.5,0,0],
  scale:.75,
});
a.spin(.01);`

/**###Model.model : property
String. The path (starting from the main Gibber directory) to the .obj file to load. Can only be set in constructor.
**/		
		model : function(props) {
			var returner = {};
			
			var loader = new THREE.OBJLoader();
			loader.addEventListener( 'load', function( event ) {
				var geometry = event.content;
				geometry.isModel = true;
				var _model = that.geometry(props, geometry);
				returner.__proto__ = _model; // only way I could simple asynchronous loading to work.
			});
			loader.load(typeof props === 'string' ? props : props.model );
			
			return returner;	
		},
	};
  console.log( that );
	return that;
});