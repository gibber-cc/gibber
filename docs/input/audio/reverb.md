###Reverb

Implementation of the Schroeder/Moorer model.

Inherits from Ugen.

Example:
```javascript
a = Pluck().play( Rndi(100,1000), 1/4 )

r = Reverb({ roomSize: Add( .75, Sine( .05, .245 )._ ) })

a.fx.add( r )
```

#### Properties

* _roomSize_ : Default range: { .5, .995 }. The size of the room that is simulated.
* _damping_  : Default range: { 0, 1 }. Attenuation of high frequencies.

#### Methods

None worth mentioning.
