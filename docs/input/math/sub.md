###Sub

A simple unit generator to subtract values on a per-sample basis, primarily for use in modulation. `Sub` has a constructor that accepts two values.

Simple ring modulation:
```
sine = Sine()

mod = Sine( .5, 50 )._ // disconnect!

sine.frequency = Sub( 440, Abs( mod ) )
```

#### Properties

* _0_ : Float or Ugen. The first operand passed to the constructor.
* _1_ : Float or Ugen. The second operand passed to the constructor.