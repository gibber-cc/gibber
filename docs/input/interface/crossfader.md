###Crossfader

A horizontal crossfader. Crossfader are a type of [Widget][widget] and inherit its methods and properties.

Example:
```javascript
// crossfade between two drum loops

loop1 = Drums( 'x*o*x*o-' )
loop2 = Drums( 'x*ox*xo-' ).pitch( 2 )

// map amplitudes of both loops to crossfader
loop1.amp = loop2.amp = Crossfader()

// invert mapping on one loop
loop2.Amp.invert()
```

#### Properties
See the [Widget][widget] prototype for many other relevant properties.

* _value_  : Float. Default range: { 0, 1 }. Default: 0.

#### Methods
See the [Widget][widget] prototype for relevant methods.

