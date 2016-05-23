###Dots

A post-processing shader recreating the halftone technique (http://en.wikipedia.org/wiki/Halftone) 

Example:
```javascript
a = Cube()
a.scale = 2
a.spin( .05 )
b = Dots({ scale:.25 })
```

####Properties

* _scale_ : Float. The size of the dots. Larger values result in smaller dots.
* _center_ : THREE.Vector2. Center position of dots
* _angle_ : Float. Angle of dots in radians
