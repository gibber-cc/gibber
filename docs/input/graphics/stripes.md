###Stripes

A simple generative shader that creates a grid of lines.
Example:
```javascript
a = Drums('xxxx')

b = Stripes()
b.xCount = a.out
b.colorX.r = 1
b.colorX.g = 0
b.colorX.b = .5
```

####Properties

* _xCount_ : Default range { 1,100 }. The number of lines along the x-axis of the texture. 
* _yCount_ : Default range { 1,100 }. The number of lines along the y-axis of the texture. 
* _blend_ : Default range {0,1}. Blend the pixellated texture with the texture entering the shader.
* _colorX_: { r,g,b }. Each component is in the range of 0-1.
* _colorY_: { r,g,b }. Each component is in the range of 0-1.
