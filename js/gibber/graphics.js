define(['gibber/graphics/three.min'], 
	function(){	
		require([
			'gibber/geometry',
			'gibber/shaders',			
			'gibber/graphics/Stats',
		], function(_geometry, _shaders) {
			_geometry.init();
			that.shaders = _shaders;
		});
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

			init : function() {
				if(!that.initialized) {
					that.intialized = true;

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
				
					// must wait until scene and renderer are created to initialize effect composer
					that.shaders.init();
				
					that.graph = [];
				
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
					that.lights = [ pointLight, pointLight2 ];
					
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
		return that;
	}
);