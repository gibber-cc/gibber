###Focus

A rough simulation of a depth of field effect.

Example:
```javascript
a = Knot({ tube:3 })
a.scale = 2
a.spin( .005 )

b = Drums('xxxx')

f = Focus()
f.sampleDistance = 2
f.waveFactor = b.out
```

####Properties

* _sampleDistance_ : Default range { 0,2 }. Distance to the point of focus.
* _waveFactor_ : Default range { 0, .05 }. Distortion introduced by the effect.
* _screenWidth_ : Default range { 0,1024 }.
* _screenHeight_ : Default range { 0,1024 }.
