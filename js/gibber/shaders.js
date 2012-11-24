define(['gibber/graphics/three.min'], 
	function(){	
		require([
			'gibber/graphics/ShaderExtras',
			'gibber/graphics/postprocessing/EffectComposer',
			'gibber/graphics/postprocessing/RenderPass',
			'gibber/graphics/postprocessing/BloomPass',
			'gibber/graphics/postprocessing/FilmPass',
			'gibber/graphics/postprocessing/DotScreenPass',
			'gibber/graphics/postprocessing/TexturePass',
			'gibber/graphics/postprocessing/ShaderPass',				
			'gibber/graphics/postprocessing/MaskPass',
		]);
	var that = {
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
			Graphics.composer = new THREE.EffectComposer( Graphics.renderer);

			Graphics.renderScene = new THREE.RenderPass( Graphics.scene, Graphics.camera );

			Graphics.renderScene.clear = false;
			Graphics.renderScene.renderToScreen = false;

			Graphics.composer.addPass( Graphics.renderScene );
			
			that.makePostProcessingEffects();
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