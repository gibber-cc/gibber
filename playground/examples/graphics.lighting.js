/* __--__--__--__--__--__--__--__--

By default, marching.js uses a
lighting system consisting of a
skydome(fill), a single front light,
and a back light. This lighting
system includes ambient occlusion
and basic shadows, as taken from
this demo by Inigo Quilez:

https://www.shadertoy.com/view/Xds3zN

However, each Material in marching.js
can uses its own lighting algorithm.
In the example below, the left sphere and
the ground plane use the default lighting
algorithm while the right sphere uses
the normal for each pixel to determine 
its color.

** __--__--__--__--__--__--__--__*/

Union2(
  Sphere( 1 ).translate(-1.25),
  Sphere( 1 )
    .translate(1,0,0)
    .material( 'normal' ),
  Plane()
)
.render(10,false)

/* __--__--__--__--__--__--__--__--

For most shapes, the third values
passed to constructors will determine
the material used by the shape. In 
the last example we saw that there is
a "preset" to use normals for lighting;
there are also presets for common 
colors.

** __--__--__--__--__--__--__--__*/

Union2(
  Sphere( 1 )
    .translate( -1.25 )
    .material( 'green' ),
  Sphere( 1 )
    .translate(1)
    .material( 'red' ),
  Plane().material( 'yellow' )
)
.render(10,false)

/* __--__--__--__--__--__--__--__--

Note that each geomety's color is
determined by both properties of its
material and the lights in the scene.
For example, we could change the scene
above to use magenta light, our green
sphere will essentially show up as
black (magenta light contains no green).

** __--__--__--__--__--__--__--__*/

l = Light( Vec3(2,2,3), Vec3(1,0,1) )
  
Union2(
  Sphere( 1 )
    .translate( -1.25 )
    .material( 'green' ),
  Sphere( 1 )
    .translate(1)
    .material( 'red' ),
  Plane().material( 'yellow' )
).render(10,false)


/* __--__--__--__--__--__--__--__--

To really get full control over our
lighting, we'll want to avoid the 
default lighting scheme, which has
some properties baked in, and 
customize everything by hand. The
example below uses the Phong
lighting model, with an additioanl
Fresnel effect added. We'll als
use a simple white light positioned
to the upper left of the scene's
center.

** __--__--__--__--__--__--__--__*/

mat1 = Material( 'phong', Vec3(.05), Vec3(.5), Vec3(1), 8 )
light = Light( Vec3(2,2,3), Vec3(1) )
  
Union2(
  Sphere( 1 ).material( mat1 ),
  Plane().material( mat1 )
)
.render(10,false)

/* __--__--__--__--__--__--__--__--

In the example above, our material
uses the 'phong' lighting model, has
a ambient RGB coefficient of .05,
diffuse RGB coefficient of .5,
specular RGB coefficients of 1. The
last number determines the diffuseness
of the specular highlights, with lower
numbers yielding more diffuse highlights.

We can add a final Vec3 to control
the Fresnel effect on the material,
which can create a halo effect around
a geometry. The three parameters for
the Fresnel effect are bias, scale, 
and power.

** __--__--__--__--__--__--__--__*/

mat1 = Material( 'phong', Vec3(.05), Vec3(.5), Vec3(1), 8, Vec3(1,50,5) )
mat2 = Material( 'phong', Vec3(.05), Vec3(.5), Vec3(1), 8 )
light = Light( Vec3(2,2,3), Vec3(1) )
 
Union2(
  Sphere( 1 ).material( mat1 ),
  Plane().material( mat2 )
)
.render(10,false)

/* __--__--__--__--__--__--__--__--

We can have lots of lights! However,
this will increase rendering time,
so tread carefully if you're doing
realtime work.

** __--__--__--__--__--__--__--__*/

mat1 = Material( 'phong', Vec3(.05), Vec3(.5), Vec3(1), 8, Vec3(1,50,5) )
mat2 = Material( 'phong', Vec3(.05), Vec3(.5), Vec3(1), 8 )
Light( Vec3(2,2,3), Vec3(1) )
Light( Vec3(-2,2,3), Vec3(1,0,0) )
Light( Vec3(0,0,-3), Vec3(0,0,1) )  
 
Union2(
  Sphere( 1 ).material( mat1 ),
  Plane().material( mat2 )
)
  .render(10,false)

/* __--__--__--__--__--__--__--__--

Two other elements that affect 
lighting in marching.js are fog and
shadows. The fog() method accepts
two arguments, a color for the fog
and an intensity coefficient. For
typical fog effects, set the fog
color to be the same as the background
color for the scene.

** __--__--__--__--__--__--__--__*/

Background( Vec3(0,0,.5) )
Fog( .125, Vec3(0,0,.5) )
 
Union2(
  Sphere()
    .translate(-1.25,0,0)
    .material( 'green' ),
  Sphere()
    .translate(1)
    .material( 'red' ),
  Plane().material( 'yellow' )
)
  .render(10,false)

/* __--__--__--__--__--__--__--__--
 *
 * The effect is especially easy to see
 * on fields of repeated geoemtries. Run
 * the code below, and then uncomment
 * the fog and run it again.
 *
 * ** __--__--__--__--__--__--__--__*/

mat1 = Material( 'phong', Vec3(.05), Vec3(.5), Vec3(1), 8, Vec3(1,4,1) )
Light( Vec3(2,2,3), Vec3(1) )
Light( Vec3(-2,2,3), Vec3(1,0,0) )
Background( Vec3(0) )
Fog( .5, Vec3(0) )
 
Repeat(
  Sphere( .25 ).material( mat1 ),
  Vec3( .75)
)
.render(10,false)
