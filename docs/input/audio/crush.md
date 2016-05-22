##Crush

Digital distortion through bit-depth quantization and sample-rate reduction.

Example:
```javascript
a = FM().play( Rndi(100,1000), 1/4 )

c = Crush({ bitDepth:Slider(), sampleRate:Slider() })

a.fx.add( c )
```

#### Properties

* _bitDepth_ : Default range: { 1, 16 }. Float. The number of bits used in the output sample.  
* _sampleRate_ : Default range: { 0, 1 }. Float. The sample rate of the output signal. 

#### Methods

None worth mentioning.
