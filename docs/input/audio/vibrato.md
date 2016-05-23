###Vibrato

A simple frequency modulation effect acheived using a delay line.

Example:
```javascript
a = FM().play( Rndi(100,1000), 1/4 )

v = Vibrato({ rate:Slider() }) 

a.fx.add( x )
```

#### Properties

* _rate_ : Default range: { .01, 20 }. The speed in Hz that the delay tap position is modulated by.  
* _amount_ : Default range: { 25, 300 }. The size of the delay line; this effectively controls the depth of the vibrato.

#### Methods

None worth mentioning.
