##Chorus

Chorusing effect acheived through a modulated delay line. This is actually just a flanger with settings that make it resemble a chorus effect.

Example:
```javascript
a = FM().play( Rndi(100,1000), 1/4 )

c = Chorus({ rate:Slider(), feedback:Slider() }) 

a.fx.add( c )
```

#### Properties

* _rate_ : Default range: { .01, 20 }. Default value: 1. The speed in Hz that the delay tap position is modulated by.  
* _feedback_  : Default range: { 0, .99 }. Default: 0.The amount of output signal fed back into the input.
* _amount_ : Default range: { 25, 300 }. Default: ms(1). The size of the delay line in samples.

#### Methods

None worth mentioning.
