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
    shader.uniform( 'xCount', 1, 100, 10 )
    shader.uniform( 'yCount', 1, 100, 10 )
    shader.uniform( 'blend', 0, 1, 0 )
    
    shader.uniforms.colorX = { type:'c', value:{ r:1, g:1, b:1 } }
    shader.uniforms.colorY = { type:'c', value:{ r:1, g:1, b:1 } }
    
    Object.defineProperties( shader, {
      colorX: {
        get: function()  { return shader.uniforms.colorX.value },
        set: function(v) { shader.uniforms.colorX.value = v }        
      },
      colorY: {
        get: function()  { return shader.uniforms.colorY.value },
        set: function(v) { shader.uniforms.colorY.value = v }        
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
    "  float growth = mod(time, 1.) / -20.;",
    "",
    "  float moddist = mod( dist + growth, radius );",
    "  float _out = smoothstep( moddist, moddist+edgeDistance, radius / 2. );",
    "  _out += smoothstep( moddist, moddist-edgeDistance, radius / 2.);",
    "",
    "  gl_FragColor = vec4( vec3(1.- _out), 1. );",
    "}",
    ].join('\n')
    
    var shader = Shader( frag )
    shader.uniform( 'blend', 0, 1, 0 )
    shader.uniform( 'thickness', 0, 1, .1 )
    shader.uniform( 'x', 0, 1, .5 )
    shader.uniform( 'y', 0, 1, .5 )
    shader.uniform( 'speed', -1, 1, .1 )               
    shader.uniform( 'radius', 0, 1, .05 )
    
    shader.uniforms.color = { type:'c', value:{ r:1, g:0, b:0 } }
    // shader.uniforms.colorY = { type:'c', value:{ r:1, g:1, b:1 } }
    // 
    // Object.defineProperties( shader, {
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
  }
}

for( var key in Shaders ) {
  window[ key ] = Shaders[ key ]
}

//$.extend( window, Gibber.Graphics.Geometry )

})()
