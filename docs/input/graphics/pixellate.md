##Pixellate

A shader that pixellates Gibber's graphical output.

Example:
```javascript
a = Knot({ tube:3 })
a.scale = 2
a.spin( .005 )

b = Drums('xxxx')

f = Pixellate()
f.amount = b.out
f.amount.max = .1
```

####Properties

* _amount_ : Default range { 0,.25 }. Amount of pixellation. A value of .25 means the screen will be pixellated into four quadrants; a value of .1 means 10 'pixels' a value of 0 means no pixellation occurs.
* _blend_ : Default range {0,1}. Blend the pixellated texture with the texture entering the shader.
