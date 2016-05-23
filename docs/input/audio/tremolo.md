###Tremolo

Basic amplitude modulation effect

Example:
```javascript
a = Synth({ attack:44, decay:44100 }).play( Rndi(100,1000), 1/2 )

r = Tremolo({ amp: 1, frequency:.5 })

a.fx.add( r )
```

#### Properties

* _frequency_ : Default range: { .05, 20 }. The frequency of the modulating oscillator. 
* _amp_  : Default range: { 0, 1 }. Amplitude of the modulating oscillator. 

#### Methods

None worth mentioning.
