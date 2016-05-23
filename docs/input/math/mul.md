###Mul

A simple unit generator to multiple multiple values together on a per-sample basis, primarily for use in modulation. `Mul` has a constructor that accepts two values.

Simple ring modulation:
```
sine = Sine()
sine.frequency.seq( Rndi(220,880), 1/4 )

mod = Sine( 220, 1 )._

mul = Mul( sine, mod )

mul.connect()
```

#### Properties

* _0_ : Float or Ugen. The first operand passed to the constructor.
* _1_ : Float or Ugen. The second operand passed to the constructor.