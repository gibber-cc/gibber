###Film

A shader recreating film grain / scanline effects

Example:
```javascript
a = Cube()
a.scale = 2
a.spin( .05 )

f = Film()
f.sCount = Slider()
f.sIntensity = Slider()
```

####Properties

* _sCount_ : Default range { 0,2048 }. The number of scanlines in the frame. 
* _sIntensity_ : Float. The strength of the scanline effect.
* _nIntensity_ : Float. The strength of the film grain noise.
