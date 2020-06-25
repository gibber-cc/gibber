/* __--__--__--__--__--__--__--____

textures
   
Gibber lets you use textures in a
number of different ways, from presets
to defining your own GLSL shader 
code.

** __--__--__--__--__--__--__--__*/

// Textures are added using the
// .texture() method, which can
// be applied to any geometry.

Sphere().texture( 'truchet' ).render()

// once a texture has been created, we
// can then access it through the 
// texture function:

s = Sphere().texture( 'truchet' ).render()

// most textures have a scale property
s.texture.scale = 20

// texture properties can be sequenced
s.texture.scale.seq( [5,10,20,50], 1/2 )

// other textures presets to play with 
// include 'dots', 'checkers', 'zigzag',
// and 'stripes'

Union2(
  b = Box(.75).texture('dots', { radius:.5 }),
  b1 = Box(.75).texture('checkers').translate(-2,0),
  b2 = Box(.75).texture('stripes').translate(2,0),
  b3 = Box(.75).texture('zigzag').translate(0,2)  
).render(10,false)

// the textures above all work by wrapping
// a 2D texture around the 3D geometry. There
// are two textures that can use 3D coordinates
// as parameters and avoid the glitches that
// might occur using 2D coordinates.

Box()
  .texture('cellular', { scale:10, strength:.25 })
  .rotate( 45,1,1,1 )
  .render()

// or simplex noise:

b = Box()
  .texture('noise', { scale:4, strength:.125 })
  .rotate( 45,1,1,1 )
  .render()

// both these functions are actually 4D; so we can
// change their 'time' property over time.

b.texture.time = gen( cycle(.025) * 4 )

// we can also assign audio objects to control this:

b = Box()
  .texture('noise', { scale:4, strength:.125 })
  .rotate( 45,1,1,1 )
  .render()

kick = Kick()
kick.trigger.seq( 1,1/4 )

b.texture.time = kick
b.texture.time.multiplier = 20

// we can also use the same texture presets
// for bump mapping, which creates physical bumps
// and dips in the geometry using texture data.
t = Texture('truchet', { scale:15 })
b = Box()
  .bump( t, .025 )
  .material('red')
  .rotate( 45,1,1,1 )
  .render()

onframe = time => b.rotate( time * 15, 1,1,1 )
