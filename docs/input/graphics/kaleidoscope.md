###Kaleidoscope

Aptly named, this shader creates a kaleidoscope effect that can be rotated.

Example:
```javascript
a = Knot({ tube:3 })
a.scale = 2
a.spin( .05 )

k = Kaleidoscope()
k.sides = Slider()
k.update = function() {
  this.angle += .005
}
```

####Properties

* _sides_ : Default range { 2,36 }. The number of fragments comprising the kaleidoscope effect. 
* _angle_ : Default range { 0,2PI }. The rotation of the fragments.
