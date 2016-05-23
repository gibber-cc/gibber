###RingMod

Ring modulation effect.

Example:
```javascript
a = Pluck().play( Rndi(100,1000), 1/4 )

r = RingMod({ amp: 1, frequency:440 })

a.fx.add( r )
```

#### Properties

* _frequency_ : Default range: { 20, 3000 }. The frequency of the modulating oscillator. 
* _amp_  : Default range: { 0, 1 }. Amplitude of the modulating oscillator. 

#### Methods

None worth mentioning.
