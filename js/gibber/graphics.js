define(['gibber/graphics/three.min'], 
	function(){	
		require([
			'gibber/graphics/Stats',
			'gibber/graphics/ShaderExtras',
			'gibber/graphics/postprocessing/EffectComposer',
			'gibber/graphics/postprocessing/RenderPass',
			'gibber/graphics/postprocessing/BloomPass',
			'gibber/graphics/postprocessing/FilmPass',
			'gibber/graphics/postprocessing/DotScreenPass',
			'gibber/graphics/postprocessing/TexturePass',
			'gibber/graphics/postprocessing/ShaderPass',				
			'gibber/graphics/postprocessing/MaskPass',
			'gibber/graphics/OBJLoader'
		]);
	var that = {
		fullScreenFlag : false,
		fullScreen : function() {
			if(this.renderer) { // if Graphics has been initialized...
				$("#three").attr("width", screen.width);
				$("#three").attr("height", screen.height);
				
				$(Graphics.renderer.domElement).css("height", "100%");
				$(Graphics.renderer.domElement).css("width", "100%");
				
				$(Graphics.renderer.domElement).width = screen.width;
				$(Graphics.renderer.domElement).height = screen.height;
				
				Graphics.camera.aspect = screen.width / screen.height;
				Graphics.camera.updateProjectionMatrix();

				Graphics.renderer.setSize( screen.width, screen.height );	
			}else{
				// flag that tells init method to call fullScreen when Graphics is initialized
				this.fullScreenFlag = true;
			}
		},
		makeEffect : function(props) {			
			var _constructor = function(_props) {
				var that = {
					category: "graphics",
					name: props.name || "anonymous",
					shaders : [],
					_update : function() {
						//console.log(this.mods);
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
					},
					update : function() {},
					mods : [],
					mod : function(_name, _modulator, _type, _mult) {
						this.mods.push({name:_name, modulator:_modulator, type:_type || "+", mult: _mult || 1 });
					},
				};
				
				_props = _props || {};
				
				for(var i = 0; i < props.shaders.length; i++) {
					var shaderDictionary = props.shaders[i];

					var shader = shaderDictionary.init(that);
					shader.name = shaderDictionary.name;
					that.shaders.push(shader);

					that[shaderDictionary.name] = shader;

					var shouldAdd = typeof _props.shouldAdd === 'undefined' || _props.shouldAdd === true;
					if(shouldAdd) {
						Graphics.composer.addPass( shader );
					}

					for(var j = 0; j < shaderDictionary.properties.length; j++) {
						(function() { 
							var property = shaderDictionary.properties[j];
							var v = property.value;
							var _shaderDictionary = shaderDictionary;
							var _shader = shader;
							Object.defineProperty(that, property.name, {
								get : function() { return v; },
								set : function(val) { 
									//console.log("SETTING " + property.name + " VALUE :" + val );
									v = val;
									_shader[ _shaderDictionary.type ][ property.name ].value = v;
								}
							});
						})();
					}
					for(var ii = 0; ii < shaderDictionary.properties.length; ii++) {
						var p = shaderDictionary.properties[ii];
						//if(typeof that[p.name] === "undefined") { // if an initialization property hasn't been set...
							// console.log("SETTING " + p.name + " TO " + p.value);
							that[p.name] = p.value;
							//}
					}
					
					if(i === props.shaders.length - 1) {
						shader.renderToScreen = true;
					}else{
						shader.renderToScreen = false;
					}
					
					if(shouldAdd) {
						if(Graphics.fx.length !== 0) {
							Graphics.fx[ Graphics.fx.length - 1].renderToScreen = false;
						}
						Graphics.fx.push(shader);
					}
				}
				
				for(var key in _props) {
					//console.log("SETTING", key);
					that[key] = _props[key];
				}
				that.props = _props;
				
				var _renderToScreen = shouldAdd;
 				Object.defineProperty(that, "renderToScreen", {
 					get : function() { return _renderToScreen; },
 					set : function(val) {
 						_renderToScreen = val;
						if(_renderToScreen) {
							this.shaders[ this.shaders.length - 1 ].renderToScreen = true;
						}else{
							this.shaders[ this.shaders.length - 1 ].renderToScreen = false;
						}
 					}
 				});
				
				that.add = function() {
					for(var i = 0; i < that.shaders.length; i++) {
						var shader = that.shaders[i];
						if(Graphics.fx.length !== 0) {
							Graphics.fx[ Graphics.fx.length - 1].renderToScreen = false;
						}
						Graphics.composer.addPass( shader );
						Graphics.fx.push(shader);
					}
				};
			
				that.remove = function() {
					var shouldResetRenderer = false;
					var shadersToRemove = [];
					for(var i = 0; i < props.shaders.length; i++) {
						shaderDictionary = props.shaders[i];
						for(var j = 0; j < this.shaders.length; j++) {
							if(this.shaders[j].name === shaderDictionary.name) {
								Graphics.composer.removePass(this.shaders[j]);	
								Graphics.fx.remove(this.shaders[j]);
								if(this.shaders[j].renderToScreen) {
									shouldResetRenderer = true;
								}
								shadersToRemove.push(this.shaders[j]);
							}
						}
					}
					for(var j = 0; j < shadersToRemove.length; j++) {
						this.shaders.remove(this.shaders[j]);
					}
					if(shouldResetRenderer && Graphics.fx.length > 0) {
						var __shader = Graphics.fx[ Graphics.fx.length - 1];
						__shader.renderToScreen = true;
						//console.log("RENDERING", __shader);
					}
					Graphics.graph.remove(this);
				};
				Graphics.graph.push(that);
				
				return that;
			};
			window[props.name] = _constructor;
			return _constructor;
		},
		
		init : function() {
			if(!that.initialized) {
				that.intialized = true;
				that.makePostProcessingEffects();

				// set the scene size
				var WIDTH = that.fullScreenFlag ? screen.width : $(".CodeMirror-scroll").outerWidth(),
				  	HEIGHT = that.fullScreenFlag ? screen.height : $(".CodeMirror-scroll").outerHeight();
			
				that.width = WIDTH;
				that.height = HEIGHT;
				that.fx = [];
				// set some camera attributes
				var VIEW_ANGLE = 45,
				  	ASPECT = WIDTH / HEIGHT,
				  	NEAR = 0.1,
				  	FAR = 10000;

				var $container = $('#three');
			
				that.renderer = new THREE.WebGLRenderer();
			
				that.camera = new THREE.PerspectiveCamera(
				    VIEW_ANGLE,
				    ASPECT,
				    NEAR,
				    FAR
				);
				
				that.scene = new THREE.Scene();

				that.graph = [];
			
				var rtParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: true };
			
				that.composer = new THREE.EffectComposer( that.renderer);
				that.renderScene = new THREE.RenderPass( that.scene, that.camera );
				that.renderScene.clear = false;
				that.renderScene.renderToScreen = false;
				that.composer.addPass( that.renderScene );

				// add the camera to the scene
				that.scene.add(that.camera);

				// the camera starts at 0,0,0 so pull it back
				that.camera.position.z = 300;
			
				that.renderer.setSize(WIDTH, HEIGHT);

				// attach the render-supplied DOM element
				$container.append(that.renderer.domElement);
			
				var ambientLight = new THREE.AmbientLight(0x666666);
			
				var pointLight = new THREE.PointLight(0xFFFFFF);

				// set its position
				pointLight.position.x = 100;
				pointLight.position.y = 100;
				pointLight.position.z = -130;
			
				//that.scene.add(ambientLight); // doesn't seem like a good idea...
				that.scene.add(pointLight);
			
				pointLight2 = new THREE.PointLight(0x666666);

				// set its position
				pointLight2.position.x = 0;
				pointLight2.position.y = 0;
				pointLight2.position.z = 260;

				//that.scene.add(ambientLight); // doesn't seem like a good idea...
				Graphics.scene.add(pointLight2);
				that.lights = [
					pointLight,
					pointLight2,
				];
				(function() {
					var r = function() {
						for(var i = 0; i < that.graph.length; i++) {
							that.graph[i]._update();
							that.graph[i].update();
						}

						that.renderer.clear();
					
						if(that.fx.length > 0) {
							that.composer.render(.01);
						}else{
							that.renderer.render(that.scene, that.camera);
						}
					
						if(that.stats)
							that.stats.update();
					
						window.requestAnimationFrame(r);
					};
					window.requestAnimationFrame(r);
				})();
				window.Camera = that.camera;
				
				window.background = that.background;
				window.Color = that.color;
				
				window.Model = that.model;
				window.Cylinder = that.cylinder;
				window.Torus = that.torus;
				window.Knot = that.torusKnot;
				window.Tetrahedron = that.tetrahedron;
				window.Icosahedron = that.icosahedron;
				window.Octahedron = that.octahedron;
				window.Cube = that.cube;
				window.Sphere = that.sphere;
			
				window.Waveform = that.waveform;
			}
			
			if(that.fullScreenFlag) that.fullScreen();
		},
		colors: {
			red: 	[1,0,0],
			green: 	[0,1,0],
			blue:	[0,0,1],
			white:	[1,1,1],
			black:	[0,0,0],
			cyan:	[0,1,1],
			magenta:[1,0,1],
			yellow:	[1,1,0],
			grey:	[.5,.5,.5],
			gray:	[.5,.5,.5],
			pink:	[1, .5,.5],
			orange: [1, .45, .2],
			purple: [.4, 0, .5],			
		},
		color : function() {
			var result, r,g,b;
			if(typeof arguments[0] === 'string') {
				var c  = that.colors[arguments[0]];
				r = c[0];
				g = c[1];
				b = c[2];
			}else if(Array.isArray(arguments[0])) {
				r = arguments[0][0];
				g = arguments[0][1];
				b = arguments[0][2];
			}else if(typeof arguments[0] === 'number') {
				if(arguments.length === 1) {
					r = arguments[0];
					g = arguments[0];
					b = arguments[0];
				}else{
					r = arguments[0];
					g = arguments[1];
					b = arguments[2];
				}
			}else if(typeof arguments[0] === 'object') {
				r = arguments[0].r;
				g = arguments[0].g;
				b = arguments[0].b;
			}
			
			result = new THREE.Color(0x000000);
			result.setRGB(r,g,b);
			return result;
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
		background: function() {
			if(arguments.length > 1) {
				Graphics.renderer.setClearColor(Color(arguments[0], arguments[1], arguments[2]));
			}else{
				if(typeof arguments[0] === 'object') {
					Graphics.renderer.setClearColorHex(arguments[0]);
				}if(typeof arguments[0] === 'number'){
					Graphics.renderer.setClearColor( Color(arguments[0], arguments[0], arguments[0]) );
				}else if(typeof arguments[0] === 'string'){
					Graphics.renderer.setClearColor( that.color(arguments[0]) );
				}
			}
		},
		showStats : function() {
			Graphics.stats = new Stats();
			Graphics.stats.domElement.style.position = 'absolute';
			Graphics.stats.domElement.style.top = '0px';
			Graphics.stats.domElement.style.right = '0px';			
			$("body").append( Graphics.stats.domElement );	
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
			props.fill = props.fill ? this.color(props.fill) : this.color('grey');
			props.stroke = props.stroke ? this.color(props.stroke) : undefined;
			
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
			
			that.colorFace = Graphics.colorFace;
			
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
			
			return Graphics.geometry(props, geometry);
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
			return Graphics.geometry(props, geometry);
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
			
			return Graphics.geometry(props, geometry);
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
			return Graphics.geometry(props, geometry);
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
			return Graphics.geometry(props, geometry);
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
			return Graphics.geometry(props, geometry);
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
			return Graphics.geometry(props, geometry);
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
			return Graphics.geometry(props, geometry);
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
				var _model = Graphics.geometry(props, geometry);
				returner.__proto__ = _model; // only way I could simple asynchronous loading to work.
			});
			loader.load(typeof props === 'string' ? props : props.model );
			
			return returner;	
		},

		waveform : function(props) {
			//_ugen, frame, _size, _canvas
			props.size = props.size || 64;
			props.frame = props.frame || {pos:[.5, .5, rndf(-.05,.05)], size:[.5, .5, 1]};
			props.color = props.color || "rgba(255, 255, 255, .5)";
			var shouldSample = props.waveform ? false : true;
			var that = {
				parent : Gibber.Environment.graphics,
				frame: props.frame,
				color: props.color,
				canvas : props.canvas || document.createElement('canvas'),
				ugen : props.ugen || props.waveform.ugen,
				waveform : props.waveform || null,
			};
			console.log("WAVE 1");
			
			if(shouldSample) {
				that.canvas.width = props.size; that.canvas.height = props.size;
				that.context = that.canvas.getContext("2d"),
				that.context.strokeStyle = "rgba(255,255,255,1)";
				that.context.lineWidth = .5;
						
				/*$(that.canvas).css({
					top:0,
					right:0,
					position:"absolute",
				});
				$("body").append(that.canvas);
				*/
				console.log("WAVE 2");
				that.drawMe = function(_avg) {
					avg.unshift(_avg);
					avg.pop();
					that.context.clearRect(0, 0, props.size, props.size);

					that.context.beginPath();
					var h2 = props.size / 2;
					for(var i = props.size - 1; i > 0; i-- ) {
						var val = Math.ceil(avg[props.size -i] * h2);

						that.context.moveTo(i, h2 + val);					
						that.context.lineTo(i, h2 - val);
					}

					that.context.closePath();
					that.context.stroke();
					
					that.texture.needsUpdate = true;
				};
				
				var avg = [];
				for(var i = 0; i < props.size; i++) {
					avg[i] = 0;
				}
				
				var reader = Gen({
					name:"reader",
					upvalues: { phase:0, sum:0, peak:0, draw:that.drawMe, pow:Math.pow },
					props: {channels:2},
					acceptsInput:true,
				
					callback : function(_in, channels) {
						//sum += Math.pow(_in[0], 2);
						var check = pow(_in[0], 2);
						peak = check > peak ? check : peak;
						//if(pow(_in[0], 2) > peak) peak = Math.pow(_in[0], 2);
						if(++phase % 512 === 0) {
							//var __avg = Math.sqrt(sum / 44100);
							draw(Math.sqrt(peak));
							//sum = 0;
							phase = 0;
							peak = 0;
						}
						return _in;
					}
				});
				that.texture = new THREE.Texture(that.canvas);
				that.texture.needsUpdate = true;
			}

			var WIDTH = $(".CodeMirror-scroll").outerWidth(),
			  	HEIGHT = $(".CodeMirror-scroll").outerHeight();
			
			var ver = 'void main() {\
				  gl_Position = projectionMatrix *	\
				                modelViewMatrix *	\
				                vec4(position,1.0);	\
			}';
			
			var frag = 'void main() {\
				 gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); }\
			}';
			
			
			
			that.sprite = new THREE.Sprite({
				blendSrc:THREE.Zero,
				blendDst:THREE.SrcAlphaFactor,
				color:that.color,
				map:that.texture || that.waveform.texture, 
				//material: new THREE.ShaderMaterial({vertexShader: ver, fragmentShader:frag}),
				affectedByDistance:false,
				useScreenCoordinates : true,
			});

			that.sprite.position.x = (that.frame.pos[0] * WIDTH);
			that.sprite.position.y = (that.frame.pos[1] * HEIGHT);
			that.sprite.position.z = that.frame.pos[2] || 0;
			that.sprite.scale.x = (that.frame.size[0] * WIDTH) / props.size;
			that.sprite.scale.y = (that.frame.size[1] * HEIGHT) / props.size;
			that.sprite.scale.z = 1;						
			that.parent.scene.add(that.sprite);
			that.parent.graph.push(that);
			
			that.update = function() { 
				/*if(that.waveform === null) {
					that.texture.needsUpdate = true; 
				}*/
			};
			
			console.log("BEFORE GRAPH INIT");
			if(shouldSample) {
				that.fx = reader();
				that.ugen.fx.add( that.fx );
			}
			
			return that;
		},
		
		makePostProcessingEffects : function() {
/**#Dots - Shader
A post-processing shader recreating the halftone technique (http://en.wikipedia.org/wiki/Halftone) 

## Example Usage ##
`graphics();
background(.25);
a = Cube({ fill: [1,0,0], scale:2 });
d = Dots({ scale:.25 });
a.spin(.01);;`
**/
/**###Dots.scale : property
Float. The size of the dots. Larger values result in smaller dots.
**/
/**###Dots.center : property
THREE.Vector2. Center position of dots
**/
/**###Dots.angle : property
Float. Angle of dots in radians
**/
/**###Dots.mix : property
Float. Blend of effect with original pixels.
**/


			that.makeEffect({
				name:"Dots",
				shaders : [
					{
						name: 'screen',
						properties: [{
							name:'center',
							value: new THREE.Vector2( .5, .5 ),
						},
						{
							name:'angle',
							value:.5,
						},
						{
							name:'scale',
							value:.035,
						},
						{ name:'mix',	value: 1.0 },
						],
						type:'uniforms',
						init : function(obj) {
							var _center = obj.center ? new THREE.Vector2( obj.center[0], obj.center[1] ) : new THREE.Vector2( .5, .5 );
							return new THREE.DotScreenPass( _center, obj.angle, obj.scale, obj.mix );
						},
					},
				],
			});
/**#Film - Shader
A shader recreating film grain / scanline effects.

## Example Usage ##
`graphics();
a = Cube({ fill: [1,0,0] });
d = Film({ sCount:512, nIntensity:1 });
a.spin(.01);`
**/
/**###Film.sCount : property
Integer. The number of scanlines to emulate
**/
/**###Film.sIntensity : property
Float. The strength of the scanline effect
**/
/**###Film.nIntensity : property
Float. The strength of the noise effect
**/
/**###Film.grayscale : property
Boolean. Default false. Whether or not the image should be converted to grayscale.
**/
/**###Film.mix : property
Float. Blend of effect with original pixels.
**/

			that.makeEffect({
				name:"Film",
				shaders : [
				{
					name:"Film",
					properties:[
						{
							name: "nIntensity",
							value: 1,
							type:'uniforms',
						},
						{
							name: "sIntensity",
							value: .5,
							type:'uniforms',
						},
						{
							name: "sCount",
							value: 1024,
							type:'uniforms',
						},
						{
							name: "grayscale",
							value: false,
							type:'uniforms',
						},
						{
							name: "mix",
							value: 1,
							type:'uniforms',
						},
					],
					type:'uniforms',
					init: function(obj) {
						console.log(obj);
						obj.nIntensity = obj.nIntensity || 1;
						obj.sIntensity = obj.sIntensity || .5;
						obj.sCount = obj.sCount || 1024;
						obj.grayscale = obj.grayscale || false;
						obj.mix = obj.mix || 1;
						return new THREE.FilmPass(obj.nIntensity, obj.sIntensity, obj.sCount, obj.grayscale, obj.mix);
					}
			
				}
				],
			});

/**#Bloom - Shader
A shader producing fringes of light around bright objects and blurring details. Involves convolution and is expensive

## Example Usage ##
`graphics();
a = Cube({ fill: [0,0,0], stroke:[1,1,1] });
b = Bloom({ opacity:2 });
a.spin(.01);`
**/
/**###Bloom.opacity : property
Float. The strength of the Bloom effect
**/
/**###Bloom.kernelSize : property
Float. The size of the convolution kernel used. Can only be set upon initialization
**/

			that.makeEffect({
				name:"Bloom",
				shaders : [
					{
						name:'Bloom',
						properties: [],
						type:'uniforms',
						init: function(obj) {
							return new THREE.BloomPass( obj.opacity || 1.5, obj.kernelSize );
						}
					},
					{
						name:'Screen',
						properties: [
							{ name: 'opacity', value: .5, },
							//{ name: 'mix',	value: 1.0 },
						],
						type:'uniforms',
						init: function(obj) {
							return new THREE.ShaderPass( THREE.ShaderExtras[ "screen" ] );
						}
					},
				]
			});
			
/**#Tilt - Shader
A shader that uses a two-pass blur to produce 'tilted' copies of the original image.

## Example Usage ##
`graphics();
a = Cube({ fill: [1,0,0], stroke:[1,1,1] });
b = Tilt({ h:2, v:2, r:1 });
a.spin(.01);`
**/
/**###Tilt.h : property
Float. The strength of the tilt effect on the horizontal axis
**/
/**###Tilt.v : property
Float. The strength of the tilt effect on the vertical axis
**/
/**###Tilt.r : property
Float. The radius of the blur.
**/
/**###Tilt.mix : property
Float. Blend of effect with original pixels.
**/	
			that.makeEffect({
				name:"Tilt",
				shaders: [
				{
					name:"hTilt",
					properties:[
						{ name:"h", 	value: 1.0 / 512.0, type:"uniforms" },
						{ name:"r", 	value: 0.35, type:"uniforms" },
						{ name:'mix',	value: 1.0 },
					],
					type:"uniforms",
					init : function(obj) {
						return new THREE.ShaderPass( THREE.ShaderExtras[ "horizontalTiltShift" ] );
					},
				},
				{
					name:"vTilt",
					properties:[
						{ name:"v", 	value: 1.0 / 512.0, type:"uniforms" },
					],
					type:"uniforms",
					init : function(obj) {
						return new THREE.ShaderPass( THREE.ShaderExtras[ "verticalTiltShift" ] );
					},
				},
		
		
				]
			});
			
/**#Tint - Shader
Apply a tint to the light parts of the scene.

## Example Usage ##
`graphics();
a = Cube({ fill: [1,0,0], stroke:[1,1,1] });
b = Tint( { color: Color("red") });
a.spin(.01);`
**/
/**###Tint.color : property
Color. The color to tint the scene.
**/
/**###Tint.mix : property
Float. Blend of effect with original pixels.
**/	
	
			that.makeEffect({
				name:"Tint",
				shaders : [
					{
						name:'color',
						properties: [
							{
								name: 'color',
								value: new THREE.Color( 0x000000 ).setRGB(1,1,1),
							},
				 			{ name:'mix',    	value: 1.0 },
						],
						type:'uniforms',
						init: function(obj) {
							var c = new THREE.ShaderPass( THREE.ShaderExtras[ "colorify" ] );
							if(typeof obj.color !== "undefined") {
								c.uniforms['color'].value = obj.color;
							}
							return c;
						}
					}
				]
			});

/**#Godrays - Shader
An effect simulating light emnating from an object. Works best with dark backgrounds... objects with dark fills and light strokes are particularly nice. Can also
be used to create pretty interesting geometric effects with high density and decay settings.

## Example Usage ##
`graphics();
a = Cube({ fill: [0,0,0], stroke:[1,1,1] });
b = Godrays( { density:.35 } );
a.spin(.01);`
**/
/**###Godrays.x : property
Float. The x-axis center position the Godrays are emitted from.
**/
/**###Godrays.y : property
Float. The y-axis center position the Godrays are emitted from.
**/
/**###Godrays.exposure : property
Float. The amount of bleed from light areas
**/	
/**###Godrays.decay : property
Float. How quickly the godrays fade from their point of origin
**/		
/**###Godrays.weight : property
Float.
**/	
/**###Godrays.max : property
Float. Default 1. A clamp value for the brightness of the godrays.
**/
/**###Godrays.mix : property
Float. Default 1. Blend of effect with original pixels.
**/
	
			that.makeEffect({
				name:"Godrays",
				shaders: [
				{
					name:"godrays",
					properties:[
			 			{ name:'x', value: 0.5},
			 			{ name:'y', value: 0.5},
			 			{ name:'exposure', value: 0.6},
			 			{ name:'decay',    value: 0.7},
			 			{ name:'density',  value: 0.4},
			 			{ name:'weight',   value: 0.8},
			 			{ name:'max',    value: 1.0},
			 			{ name:'mix',    value: 1.0},							
					],
					type:'uniforms',
					init : function(obj) {
						return new THREE.ShaderPass( THREE.ShaderExtras[ "Godrays" ] );
					},
				}
				],
			});
	
			that.makeEffect({
				name:"Screen",
				shaders: [
				{
					name:"screen",
					properties:[
			 			{ name:'opacity', value: 1},			
					],
					type:'uniforms',
					init : function(obj) {
						return new THREE.ShaderPass( THREE.ShaderExtras[ "screen" ] );
					},
				}
				],
			});
/**#Blur - Shader
Applies separate horizontal and vertical blurs.

## Example Usage ##
`graphics();
a = Cube({ fill: [1,0,0], stroke:[1,1,1] });
b = Blur({ h: .01, v:.01 });
a.spin(.01);`
**/
/**###Blur.h : property
Float. The amount of horizontal blur.
**/
/**###Blur.v : property
Float. The amount of vertical blur.
**/
/**###Blur.mix : property
Float. Blend of effect with original pixels.
**/	

			that.makeEffect({
				name:"Blur",
				shaders : [
					{
						name: 'h',
						properties: [
							{ name:'h', 	value:.003 },
						],
						type:'uniforms',
						init : function(obj) {
							return new THREE.ShaderPass( THREE.ShaderExtras[ "horizontalBlur" ] );
						},
					},
					{
						name: 'v',
						properties: [
							{ name:'v', 	value:.003 },
				 			{ name:'mix',	value: 1.0 },
						],
						type:'uniforms',
						init : function(obj) {
							return new THREE.ShaderPass( THREE.ShaderExtras[ "verticalBlur" ] );
						},
					}
				],
			});
/**#Pixellate - Shader
Resample image at a reduced frequency

## Example Usage ##
`graphics();
a = Cube({ fill: [1,0,0], stroke:[1,1,1] });
b = Pixellate({ amount: .01 });
a.spin(.01);`
**/
/**###Pixellate.amount : property
Float. Default .01. The number of pixels to output per pass. Higher values give greater degradation.
**/

/**###Pixellate.mix : property
Float. Blend of effect with original pixels.
**/	
			
			that.makeEffect({
				name:"Pixellate",
				shaders : [
				{
					name: "Pixellate",
					properties : [
						{
							name:'amount',
							value:.01,
						},
						{ name:'mix',	value: 1.0 },
					],
					type:'uniforms',
					init : function(obj) {
						return new THREE.ShaderPass( THREE.ShaderExtras[ "pixellate" ] );
					},			
				}
				]
			});
		},
	};
	return that;
});