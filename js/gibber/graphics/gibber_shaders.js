(function() {

"use strict"
    
var processArgs = function( args, type, shape ) {
   var _args = Gibber.processArguments( args, type ),
       out

   if( typeof args[0] === 'object' ) {
     out = []
     for( var argsKey in shape ) {
       var pushValue = typeof args[0][ argsKey ] !== 'undefined' ? args[0][ argsKey ] : shape[ argsKey ]
       out.push( pushValue )
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
}
// _mappingProperties = {
//   Bleach : {
//     opacity: {
//       min: 0, max: 1,
//       output: Gibber.LINEAR,
//       timescale: 'graphics',
//     }
//   },
//   Shader : {
//     amp:{
//       min:0, max:1,
//       output: Gibber.LINEAR,
//       timescale: 'graphics',
//     },
//     time:{
//       min:0, max:1,
//       output: Gibber.LINEAR,
//       timescale: 'graphics',
//     },
//   }
// }
// defaultFragment = [
//   "uniform lowp float amp;",
//   "uniform sampler2D tDiffuse;",
//   "uniform lowp float time;",
//   "varying lowp vec2 p;",
//   "",
//   "void main() {",
//   "  gl_FragColor = texture2D( tDiffuse, p ).rgba;",
//   "}"
// ].join('\n'),
// defaultVertex = [
//   "varying vec2 p;",
//   "void main() {",
//     "p = uv;",
//     "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
//   "}"
// ].join("\n")

var Shaders = Gibber.Graphics.GibberShaders = {
  Stripes : function() {
    var frag = [
    "varying vec2 p;",
    "uniform float xCount;",
    "uniform float yCount;",
    "uniform float blend;",    
    "uniform sampler2D tDiffuse;",
    "uniform vec3 colorX;",
    "uniform vec3 colorY;", 
    "",
    "void main() {",
    "  vec3 color;",     
    "  float x = p.x * xCount;",
    "  float y = p.y * yCount;",
    "	 int stripeX = int(mod( x, 2.));",
    "	 int stripeY = int(mod( y, 2.));",
    "",    
    "  if( stripeX == 1 || stripeY == 1) {",
    "    color = colorX;",
    "  }else{",
    "    color = vec3(0., 0., 0.);",
    "  }",
    "",
    "  vec3 prev = texture2D( tDiffuse, p ).rgb;",
    "  gl_FragColor = vec4( mix(color, prev, blend), 1. );",
    "}",
    ].join('\n')
    
    var shader = Shader( frag )
    shader.uniform( 'xCount', 4, 1, 100, 'float' )
    shader.uniform( 'yCount', 4, 1, 100, 'float' )
    shader.uniform( 'blend', 0, 1, 0, 'float' )
    
    shader.uniforms.colorX = { type:'c', value:{ r:1, g:1, b:1 } }
    shader.uniforms.colorY = { type:'c', value:{ r:1, g:1, b:1 } }
    
    Object.defineProperties( shader, {
      colorX: {
        get: function()  { return shader.uniforms.colorX.value },
        set: function(v) { shader.uniforms.colorX.value = Color(v) }        
      },
      colorY: {
        get: function()  { return shader.uniforms.colorY.value },
        set: function(v) { shader.uniforms.colorY.value = Color(v) }
      }
    })
    
    return shader
  },
  
  Circles : function() {
    var frag = [
    "uniform float time;",
    "uniform float thickness;",
    "uniform float speed;",
    "uniform float radius;",
    "uniform float x;",
    "uniform float y;",
    "uniform sampler2D tDiffuse;",
    "uniform vec3 color;",
    "varying vec2 p;",
    "",
    "void main() {",
    "  vec2 uv = 2. * p - 1.;",
    "  float _speed = 20. * speed;",
    "  float edgeDistance = radius * thickness;",
    "  float dist = distance( p, vec2(x,y) );",
    "  float growth = mod(time, 1.) / -_speed;",
    "",
    "  float moddist = mod( dist + growth, radius );",
    "  float _out = smoothstep( moddist, moddist+edgeDistance, radius / 2. );",
    "  _out += smoothstep( moddist, moddist-edgeDistance, radius / 2.);",
    "",
    "  gl_FragColor = vec4( vec3(1.- _out), 1. );",
    "}",
    ].join('\n')
    
    var shader = Shader( frag )
    shader.uniform( 'blend', 1, 0, 1, 'float' )
    shader.uniform( 'thickness', .1, 0, 1, 'float' )
    shader.uniform( 'x', .5, 0, 1, 'float' )
    shader.uniform( 'y', .5, 0, 1, 'float' )
    shader.uniform( 'speed', 1, -1, 1, 'float' )               
    shader.uniform( 'radius', .05, 0, 1, 'float' )
    
    shader.uniforms.color = { type:'c', value:{ r:1, g:0, b:0 } }
    // shader.uniforms.colorY = { type:'c', value:{ r:1, g:1, b:1 } }
    // 
    
    var oldSpeedSet = shader.__lookupSetter__('speed'), oldSpeedGet = shader.__lookupGetter__('speed')
    Object.defineProperties( shader, {
      speed: {
        get: function() { return oldSpeedGet() },
        set: function(v) {
          v = v > 0 ? 1 - v : -1 - v
          oldSpeedSet( v )
        }
      }
    })
    //   colorX: {
    //     get: function()  { return shader.uniforms.colorX.value },
    //     set: function(v) { shader.uniforms.colorX.value = v }        
    //   },
    //   colorY: {
    //     get: function()  { return shader.uniforms.colorY.value },
    //     set: function(v) { shader.uniforms.colorY.value = v }        
    //   }
    // })
    return shader
  },
  Pixellate : function() {
    var frag = [
  		"uniform sampler2D tDiffuse;",
  		"uniform float amount;",
  		"uniform float blend;",
  		"varying vec2 vUv;",
  		"void main() {",
  		"	vec2 sd = vec2( amount );",
  		"	vec2 samplePos = vUv - mod( vUv, sd );",
  		"	vec4 p = texture2D( tDiffuse, samplePos );",
  		"	vec4 pp = texture2D( tDiffuse, vUv );",
  		"	vec3 _blend = (p.rgb * vec3( blend ) ) + ( pp.rgb * vec3(1.0 - blend ) );",
  		"	gl_FragColor = vec4( _blend, 1. );",
  		"}"
    ].join('\n')
    
    var vert = [
			"varying vec2 vUv;",
			"void main() {",
			"	vUv = uv;",
			"	gl_Position = vec4( position[0],position[1],position[2], 1.0 );",
			"}"
		].join("\n")
    
    var shader = Shader( frag, vert )
    shader.uniform( 'amount', .01, 0, 1, 'float' )
    shader.uniform( 'blend', 1, 0, 1, 'float' )
  
    return shader
  },
}




for( var key in Shaders ) {
  window[ key ] = Shaders[ key ]
}

//$.extend( window, Gibber.Graphics.Geometry )

})()
