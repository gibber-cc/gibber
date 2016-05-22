##HPF

A 24db per octave, high-pass resonant filter. 

Example:
```javascript
d = XOX( 'x*o*x*o-' )

h = HPF()
h.cutoff = Add( .4, Sine(.2, .3)._ )
h.resonance = 4

d.fx.add( h )
```

#### Properties

* _cutoff_ : Default range: { 0, 1 }. Float. The cutoff frequency for the filter measured from 0 to 1 where 1 is nyquist. In practice, values above .75 or so seem unstable.  
* _resonance_ : Default range: { 0, 5.5 }. The amount of emphasis placed on the frequencies surrounding the cutoff. This can cause the filter to blow up at values above 5.5, but can also introduce pleasing distortion at high values in certain situations. Be careful!

#### Methods

None worth mentioning.
