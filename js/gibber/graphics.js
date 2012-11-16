define(['gibber/graphics/three.min'], function(){	
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
				for(var key in _props) {
					that[key] = _props[key];
				}
				
				for(var i = 0; i < props.shaders.length; i++) {
					var shaderDictionary = props.shaders[i];

					for(var ii = 0; ii < shaderDictionary.properties.length; ii++) {
						var p = shaderDictionary.properties[ii];
						if(typeof that[p.name] === "undefined") { // if an initialization property hasn't been set...
							that[p.name] = p.value;
						}
					}
					
					var shader = shaderDictionary.init(that);
					shader.name = shaderDictionary.name;
					that.shaders.push(shader);
					
					that[shaderDictionary.name] = shader;
					
					//console.log(_props);
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
									v = val;
									_shader[ _shaderDictionary.type ][ property.name ].value = v;
								}
							});
						})();
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
			require([
				'gibber/graphics/three.min',
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
				'gibber/graphics/OBJLoader',	
			], function() {
				console.log("GRAPHICS");
				that.intialized = true;
				that.makePostProcessingEffects();
				//$("#three").attr( "width",  $(".CodeMirror-scroll").outerWidth() );
				//$("#three").attr( "height", $(".CodeMirror-scroll").outerHeight() );
			
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
			
				pointLight2 = new THREE.PointLight(0xFFFFFF);

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
			
				if(that.fullScreenFlag) that.fullScreen();
			});
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
		background: function() {
			if(arguments.length > 1) {
				Graphics.renderer.setClearColor(Color(arguments[0], arguments[1], arguments[2]));
			}else{
				if(typeof arguments[0] !== 'string') {
					Graphics.renderer.setClearColorHex(arguments[0]);
				}else{
					Graphics.renderer.setClearColor(that.color(arguments[0]));
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
		geometry : function(props, geometry) {
			props.fill = props.fill ? this.color(props.fill) : this.color('black');
			props.stroke = props.stroke ? this.color(props.stroke) : undefined;
						
			var that;
			if(!geometry.isModel) {
				var materials = props.stroke ?  [
				    new THREE.MeshPhongMaterial( { color: props.fill, shading: THREE.FlatShading, shininess:50, specular:0xffffff} ),
					new THREE.MeshBasicMaterial( { color: props.stroke, shading: THREE.FlatShading, wireframe: true, transparent: true } )
				] 
				: new THREE.MeshLambertMaterial( { color: props.fill, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
			
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
			
			Object.defineProperties(that, {
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
			
			that.spin = function() {
				if(arguments[0]) {
					that.mod('rx', arguments[0]);
				}
				if(arguments[1]) {
					that.mod('ry', arguments[1]);
				}
				if(arguments[2]) {
					that.mod('rz', arguments[2]);
				}
			};
			
			that.update = function() {};
			Gibberish.extend(that, props);
			Graphics.graph.push(that);
			
			return that;
		},
		
		icosahedron : function(props) {
			props = props || {};
			var geometry = new THREE.IcosahedronGeometry( props.radius || 50, props.detail || 0	 );
			return Graphics.geometry(props, geometry);
		},
		octahedron : function(props) {
			props = props || {};
			var geometry = new THREE.OctahedronGeometry( props.radius || 50, props.detail || 0 );
			return Graphics.geometry(props, geometry);
		},
		tetrahedron : function(props) {
			props = props || {};
			var geometry = new THREE.TetrahedronGeometry( props.radius || 50, props.detail || 0 );
			return Graphics.geometry(props, geometry);
		},
		sphere : function(props) {
			props = props || {};
			var geometry = new THREE.SphereGeometry( props.radius || 50, props.segments || 16, props.rings || 16 );
			return Graphics.geometry(props, geometry);
		},
		cube : function(props) {
			props = props || {};
			var geometry = new THREE.CubeGeometry( props.width || 50, props.height || 50, props.depth || 50 );
			return Graphics.geometry(props, geometry);
		},
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
		torus : function(props) {
			props = props || {};
			var geometry = new THREE.TorusGeometry( 
				props.radius,
				props.tube,
				props.radialSegments,
				props.tubularSegments,
				props.arc
			);
			return Graphics.geometry(props, geometry);
		},
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
			that.makeEffect({
				name:"Dots",
				shaders : [
					{
						name: 'screen',
						properties: [{
							name:'center',
							value:[0,0],
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
							return new THREE.DotScreenPass( new THREE.Vector2( obj.center[0], obj.center[1] ), obj.angle, obj.scale, obj.mix );
						},
					},
				],
			});
	
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
							{ name:'mix',	value: 1.0 },
						],
						type:'uniforms',
						init: function(obj) {
							return new THREE.ShaderPass( THREE.ShaderExtras[ "screen" ] );
						}
					},
				]
			});
	
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
						var c = new THREE.ShaderPass( THREE.ShaderExtras[ "horizontalTiltShift" ] );
						return c;
					},
				},
				{
					name:"vTilt",
					properties:[
						{ name:"v", 	value: 1.0 / 512.0, type:"uniforms" },
						{ name:"r", 	value: 0.35, type:"uniforms"},
						{ name:'mix',	value: 1.0 },
					],
					type:"uniforms",
					init : function(obj) {
						var c = new THREE.ShaderPass( THREE.ShaderExtras[ "verticalTiltShift" ] );
						return c;
					},
				},
		
		
				]
			});
	
			that.makeEffect({
				name:"Colorify",
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
			 			{ name:'mix',    	value: 1.0},							
			 			{ name:'samples',   value: 10.0},				
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
	
			that.makeEffect({
				name:"Blur",
				shaders : [
					{
						name: 'h',
						properties: [
							{ name:'h', 	value:.003 },
				 			{ name:'mix',	value: 1.0 },
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
			
			that.makeEffect({
				name:"Pixellate",
				shaders : [
				{
					name: "Pixellate",
					properties : [
						{
							name:'amount',
							value:1,
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
