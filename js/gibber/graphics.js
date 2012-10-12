define(function() {	
	return {
		init : function() {
			console.log("GRAPHICS");
			$("#three").attr( "width",  $(".CodeMirror-scroll").outerWidth() );
			$("#three").attr( "height", $(".CodeMirror-scroll").outerHeight() );
			
			// set the scene size
			var WIDTH = $(".CodeMirror-scroll").outerWidth(),
			  	HEIGHT = $(".CodeMirror-scroll").outerHeight();

			// set some camera attributes
			var VIEW_ANGLE = 45,
			  	ASPECT = WIDTH / HEIGHT,
			  	NEAR = 0.1,
			  	FAR = 10000;

			// get the DOM element to attach to
			// - assume we've got jQuery to hand
			var $container = $('#three');
			console.log("THIS", this);
			// create a WebGL renderer, camera
			// and a scene
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
			//this.texture = new THREE.Texture(that.cnvs);
			//this.texture.needsUpdate = true;
			/*this.sprite = new THREE.Sprite({
				color:0xffffff,
				//map:that.texture, 
				affectedByDistance:false,
				useScreenCoordinates : true,
			});

			this.sprite.position.x =  0;
			this.sprite.position.y = 0;
			this.sprite.position.z = 0;
			this.sprite.scale.x = 8;
			this.sprite.scale.y = 8;
			this.sprite.scale.z = 1;						
			this.scene.add(this.sprite);*/
			

			// add the camera to the scene
			this.scene.add(this.camera);

			// the camera starts at 0,0,0 so pull it back
			this.camera.position.z = 300;

			// start the renderer
			this.renderer.setSize(WIDTH, HEIGHT);

			// attach the render-supplied DOM element
			$container.append(this.renderer.domElement);
			
			var pointLight = new THREE.PointLight(0xFFFFFF);

			// set its position
			pointLight.position.x = 10;
			pointLight.position.y = 50;
			pointLight.position.z = 130;
			
			/*var radius = 50,
			    segments = 16,
			    rings = 16;

			// create a new mesh with
			// sphere geometry - we will cover
			// the sphereMaterial next!
			var sphere = new THREE.Mesh(
			  	new THREE.SphereGeometry(radius,segments,rings),
			    new THREE.MeshPhongMaterial({color: 0xCC0000 })
			);
		
			// add the sphere to the scene
			this.scene.add(sphere);*/

			// add to the scene
			//this.scene.add(pointLight);
			
			/*var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };
			renderTargetGlow = new THREE.WebGLRenderTarget( WIDTH, HEIGHT, renderTargetParameters );
 
			// Prepare the blur shader passes
			hblur = new THREE.ShaderPass( THREE.ShaderExtras[ "horizontalBlur" ] );
			vblur = new THREE.ShaderPass( THREE.ShaderExtras[ "verticalBlur" ] );
 
			var bluriness = 30;
 
			hblur.uniforms[ "h" ].value = bluriness / WIDTH;
			vblur.uniforms[ "v" ].value = bluriness / HEIGHT;
 
			// Prepare the glow scene render pass
			var renderModelGlow = new THREE.RenderPass( this.scene, this.camera);
 
			// Create the glow composer
			var glowcomposer = new THREE.EffectComposer( this.renderer, renderTargetGlow );
 
			// Add all the glow passes
			//glowcomposer.addPass( renderModelGlow );
			glowcomposer.addPass( hblur );
			glowcomposer.addPass( vblur );
			*/
			var that = this;
			(function() {
				var r = function() {
					//console.log("CALLED", that);
					for(var i = 0; i < that.graph.length; i++) {
						that.graph[i].update();
					}
					//console.log(0);
					//glowcomposer.render(that.scene, that.camera);
					//console.log(1);
					that.renderer.render(that.scene, that.camera);
					//console.log(2);
					
					that.stats.update();
					//slow down animation
					setTimeout( function() { requestAnimationFrame( r ); }, 1000 / 30 );
					//window.requestAnimationFrame(r);
				};
				window.requestAnimationFrame(r);
			})();
			
			window.Waveform = this.waveform;
			console.log("FINISH INIT");
		},
		waveform : function(props) {
			console.log("WAVE 0");
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
					//that.context.fillStyle = "rgba(0,0,0,1)";
					that.context.clearRect(0, 0, props.size, props.size);

					that.context.beginPath();
					//console.log(avg);
					var h2 = props.size / 2; //Math.round(64 / 2);
					//console.log(h2);
					for(var i = 0; i < props.size; i++ ) {
						var val = Math.ceil(avg[i] * h2);
						//if(i === 0) console.log(val);
						that.context.moveTo(i, h2 + val);					
						that.context.lineTo(i, h2 - val);
					}

					that.context.closePath();
					that.context.stroke();
					
					that.texture.needsUpdate = true;
				};
							console.log("WAVE 3");
				var avg = [];
				for(var i = 0; i < props.size; i++) {
					avg[i] = 0;
				}
				console.log("BEFORE GRAPH");
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
});
