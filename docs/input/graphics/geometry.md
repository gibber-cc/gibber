###3D Geometries

All 3d geometries share the methods and properties outlined below. In addition, each geometry has a set of properties that can only best (at least currently) on instantiation; they cannot be modified after a geometry has been created.

These constructors and their defaults are as follows:  

Cube:   { width:50, height:50, depth:50 },  
Sphere: { radius:50, segments:16, rings: 16 },  
Torus:  { radius:50, tube:10, radialSegments:8, tubularSegments:8, arc:Math.PI * 2 },  
TorusKnot: { radius: 50, tube:20, radialSegments:64, tubularSegments: 8, p:5, q:3, heightScale:1 },  
Plane: { width:1, height:1, segmentsWidth:1, segmentsHeight:1 },

Thus to make Sphere with 4 rings we would use:
```
a = Sphere({ rings:4 })
```

#### Properties

* _scale_ : This property can get/set the scale of the geometry on all three axis.
* _scale.x_ : Default 1. Get/set the scale of the geometry along the x-axis.
* _scale.y_ : Default 1. Get/set the scale of the geometry along the y-axis.
* _scale.z_ : Default 1. Get/set the scale of the geometry along the z-axis.  
+ _rotation_ : This property can get/set the rotation of the geometry on all three axis.
+ _rotation.x_ : Default 0. Get/set the rotation of the geometry along the x-axis.
+ _rotation.y_ : Default 0. Get/set the rotation of the geometry along the y-axis.
+ _rotation.z_ : Default 0. Get/set the rotation of the geometry along the z-axis.  
* _position_ : This property can get/set the position of the geometry on all three axis
* _position.x_ : Default 0. Get/set the position of the geometry along the x-axis
* _position.y_ : Default 0. Get/set the position of the geometry along the y-axis
* _position.z_ : Default 0. Get/set the position of the geometry along the z-axis  
* _material_ : The THREE.js material used by the geometry
* _geometry_ : The wrapped THREE.js geometry.
* _mesh_ : The THREE.js mesh.

#### Methods

* _remove_() : Removes the geometry from the 3d scene
* _update_() : This is user-defined function that is called once per frame of video. You can use it to update any property of the object (or carry out any other action) on a frame by frame basis. For example, to gradually increase the size of cube:

```
a = Cube()

a.update = function() {
  a.scale.x += .01
  if( a.scale.x > 3 ) a.scale.x = 1 
}
```
* _spin_( Float:x, Float:y, Float;z ) : This method spins the geometry an amount determined by the arguments passed to it. If a single value is passed, the geometry spins around all three axis at the same speed. If three values are passed, the geometry spins on each axis according to each particular argument. If 0 is passed the object ceases spinning.
