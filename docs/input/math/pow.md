##Pow

Raise the first operand to the power of the second operand on a per-sample basis. `Pow` has a constructor that accepts two values.

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