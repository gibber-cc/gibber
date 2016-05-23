###Gain

Basic amplitude control for insertion in fx chains.

Example:
```javascript
a = Synth({ attack:44, decay:44100 }).play( Rndi(100,1000), 1/2 )

a.fx.add( Crush( 2, .1 ) )

b = Gain({ amp: .5 })

a.fx.add( b )
```

#### Properties

* _amount_  : Default range: { 0, 1 }. Constant to modulate input value by.

#### Methods

None worth mentioning.
