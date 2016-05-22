##Flanger

Flanging effect acheived through a modulated delay line.

Example:
```javascript
a = FM().play( Rndi(100,1000), 1/4 )

f = Flanger({ rate:Slider(), feedback:Slider() }) 

a.fx.add( f )
```

#### Properties

* _rate_ : Default range: { .01, 20 }. The speed in Hz that the delay tap position is modulated by.  
* _feedback_  : Default range: { 0, .99 }. The amount of output signal fed back into the input.
* _amount_ : Default range: { 25, 300 }. The size of the delay line.

#### Methods

None worth mentioning.
