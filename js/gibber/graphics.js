define(function() {	
	var a = {
		makeEffect : function(props) {			
			var _constructor = function(_props) {
				var that = {
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
				
				for(var i = 0; i < props.shaders.length; i++) {
					var shaderDictionary = props.shaders[i];

					for(var ii = 0; ii < shaderDictionary.properties.length; ii++) {
						var p = shaderDictionary.properties[ii];
						that[p.name] = p.value;
					}
					
					var shader = shaderDictionary.init(that);
					shader.name = shaderDictionary.name;
					that.shaders.push(shader);
					
					that[shaderDictionary.name] = shader;
										
					Graphics.composer.addPass( shader );

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
					
					if(Graphics.fx.length !== 0) {
						Graphics.fx[ Graphics.fx.length - 1].renderToScreen = false;
					}
					Graphics.fx.push(shader);
				}
				
				var _renderToScreen = true;
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
							
				that.remove = function() {
					for(var i = 0; i < props.shaders.length; i++) {
						shaderDictionary = props.shaders[i];
						for(var j = 0; j < this.shaders.length; j++) {
							if(this.shaders[j].name === shaderDictionary.name) {
								Graphics.composer.removePass(this.shaders[j]);	
								Graphics.fx.remove(this.shaders[j]);
							}
						}
					}
					Graphics.graph.remove(this);
				};
				//Graphics.fx.push(that);
				Graphics.graph.push(that);
				
				return that;
			};
			window[props.name] = _constructor;
			return _constructor;
		},

		init : function() {
			//console.log("GRAPHICS");
			$("#three").attr( "width",  $(".CodeMirror-scroll").outerWidth() );
			$("#three").attr( "height", $(".CodeMirror-scroll").outerHeight() );
			
			// set the scene size
			var WIDTH = $(".CodeMirror-scroll").outerWidth(),
			  	HEIGHT = $(".CodeMirror-scroll").outerHeight();
			
			this.width = WIDTH;
			this.height = HEIGHT;
			
			this.fx = [];
			// set some camera attributes
			var VIEW_ANGLE = 45,
			  	ASPECT = WIDTH / HEIGHT,
			  	NEAR = 0.1,
			  	FAR = 10000;

			var $container = $('#three');
			
			this.renderer = new THREE.WebGLRenderer();
			this.camera = new THREE.PerspectiveCamera(
			    VIEW_ANGLE,
			    ASPECT,
			    NEAR,
			    FAR
			);

			this.scene = new THREE.Scene();
			this.graph = [];
			
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.top = '0px';
			this.stats.domElement.style.right = '0px';			
			$("body").append( this.stats.domElement );
			
			this.composer = new THREE.EffectComposer( this.renderer );
			
			this.renderScene = new THREE.RenderPass( this.scene, this.camera );
			this.renderScene.renderToScreen = false;
			this.composer.addPass( this.renderScene );

			// add the camera to the scene
			this.scene.add(this.camera);

			// the camera starts at 0,0,0 so pull it back
			this.camera.position.z = 300;

			this.renderer.setSize(WIDTH, HEIGHT);

			// attach the render-supplied DOM element
			$container.append(this.renderer.domElement);
			
			var pointLight = new THREE.PointLight(0xFFFFFF);

			// set its position
			pointLight.position.x = 10;
			pointLight.position.y = 50;
			pointLight.position.z = 130;
			
			this.scene.add(pointLight);
			
			/*this.scene.add( new THREE.Mesh(
			  	new THREE.CubeGeometry( 50, 50, 50 ),
				new THREE.MeshLambertMaterial({ color: 0xCC0000 })
			    //new THREE.MeshPhongMaterial( {color: props.color ? new THREE.Color(0x000000).setRGB(props.color.r,props.color.g,props.color.b) : 0xCC0000 } )
				//sphereMaterial
				) 
			);*/

			var that = this;
			(function() {
				var r = function() {
					for(var i = 0; i < that.graph.length; i++) {
						that.graph[i]._update();
						that.graph[i].update();
					}

					that.renderer.clear();
					
					if(that.fx.length > 0) {
						that.composer.render();
					}else{
						that.renderer.render(that.scene, that.camera);
					}
					
					that.stats.update();
					
					//slow down animation
					setTimeout( function() { requestAnimationFrame( r ); }, 1000 / 30 );
					//window.requestAnimationFrame(r);
				};
				window.requestAnimationFrame(r);
			})();
			
			//window.Blur = this.blur;
			//window.Dots = this.dots;
			window.Cube = this.cube;
			window.Sphere = this.sphere;
			window.Waveform = this.waveform;
			console.log("FINISH INIT");
		},
		sphere : function(props) {
			props = props || {};
			
			var that = new THREE.Mesh(
			  	new THREE.SphereGeometry( props.radius || 50, props.segments || 16, props.rings || 16),	// radius, segments per ring, rings, 
			    new THREE.MeshPhongMaterial({color: props.color ? new THREE.Color(0x000000).setRGB(props.color.r,props.color.g,props.color.b) : 0xCC0000 } )
			);
			that.category = "graphics";
			Graphics.scene.add(that);
			
			that.x = that.position.x;
			that.y = that.position.y;
			that.z = that.position.z;
			
			that.rx = that.rotation.x;
			that.ry = that.rotation.y;
			that.rz = that.rotation.z;
			
			Object.defineProperties(that, {
				x : { get: function() { return this.position.x; }, set: function(val) { this.position.x = val; } },
				y : { get: function() { return this.position.y; }, set: function(val) { this.position.y = val; } },
				z : { get: function() { return this.position.z; }, set: function(val) { this.position.z = val; } },	
				
				rx : { get: function() { return this.rotation.x; }, set: function(val) { this.rotation.x = val; } },
				ry : { get: function() { return this.rotation.y; }, set: function(val) { this.rotation.y = val; } },
				rz : { get: function() { return this.rotation.z; }, set: function(val) { this.rotation.z = val; } },							
			});		
			
			that.update = function() {};
			Gibberish.extend(that, props);
			Graphics.graph.push(that);
			
			return that;
		},
		cube : function(props) {
			props = props || {};
			
			/*var vertex='attribute float displacement;\
			uniform float amplitude;\
			varying vec3 vNormal;\
			void main() {\
				vNormal = normal;\
			    vec3 newPosition = position + normal * vec3(displacement * amplitude);\
				gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition,1.0);\
			}';
		
			var fragment = 'varying vec3 vNormal;\
			void main() {\
				vec3 light = vec3( 0.5, 0.2, 5.0 );\
				light = normalize( light );\
			    float dProd = max( 0.0, dot(vNormal, light) );\
				gl_FragColor = vec4(dProd, dProd, dProd, 1.0);\
			}';
		
			var sphereMaterial = new THREE.ShaderMaterial({
			    vertexShader:   vertex,
			    fragmentShader: fragment,
			});*/
			
			
			var that = new THREE.Mesh(
			  	new THREE.CubeGeometry( props.width || 50, props.height || 50, props.depth || 50 ),
			    new THREE.MeshPhongMaterial( {color: props.color ? new THREE.Color(0x000000).setRGB(props.color.r,props.color.g,props.color.b) : 0xCC0000 } )
				//sphereMaterial
			);
			that.category = "graphics";
			
			that.remove = that.kill = function() {
				Graphics.scene.remove(that);
			};
			
			//var sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xCC0000 });			
			that._update = function() {
				for(var i = 0; i < this.mods.length; i++) {
					var mod = this.mods[i];
					switch(mod.type) {
						case "+":
							this[mod.name] += typeof mod.modulator === "number" ? mod.modulator : mod.modulator.function.getValue() * mod.mult;
							break;
						case "++":
							this[mod.name] += typeof mod.modulator === "number" ? 		mod.modulator : Math.abs(mod.modulator.function.getValue() * mod.mult);
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
			});		
			
			that.update = function() {};
			Gibberish.extend(that, props);
			Graphics.graph.push(that);
			
			return that;
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
	};
	
	a.makeEffect({
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
					value:.3,
				}],
				type:'uniforms',
				init : function(obj) {
					return new THREE.DotScreenPass( new THREE.Vector2( obj.center[0], obj.center[1] ), obj.angle, obj.scale );
				},
			},
		],
	});
	
	a.makeEffect({
		name:"Film",
		shaders : [
		{
			name:"Film",
			properties:[
				{
					name: "nIntensity",
					value: .35,
					type:'uniforms',
				},
				{
					name: "sIntensity",
					value: .025,
					type:'uniforms',
				},
				{
					name: "sCount",
					value: 648,
					type:'uniforms',
				},
				{
					name: "grayscale",
					value: false,
					type:'uniforms',
				},
			],
			type:'uniforms',
			init: function(obj) {
				return new THREE.FilmPass(.35, .025, 648, 0);
			}
			
		}
		],
	});
	
	a.makeEffect({
		name:"Colorify",
		shaders : [
			{
				name:'colorify',
				properties: [{
					name: 'color',
					value: 0x00FF00,
					type: 'uniforms',
				}],
				type:'uniforms',
				init: function(obj) {
					return new THREE.ShaderPass( THREE.ShaderExtras[ "colorify" ] );
				}
			}
		]
	});
	
	a.makeEffect({
		name:"Blur",
		shaders : [
			{
				name: 'h',
				properties: [{
					name:'h',
					value:.003,
				}],
				type:'uniforms',
				init : function(obj) {
					return new THREE.ShaderPass( THREE.ShaderExtras[ "horizontalBlur" ] );
				},
			},
			{
				name: 'v',
				properties: [{
					name:'v',
					value:.003,
				}],
				type:'uniforms',
				init : function(obj) {
					return new THREE.ShaderPass( THREE.ShaderExtras[ "verticalBlur" ] );
				},
			}
		],
	});
	
	return a;
});
