##Abs

Take the absolute value of a unit generator's output (or a number) on a per-sample basis.

In the example below, note that the frequency only travels above the default pitch of the sine oscillator (440 Hz).
```
sine = Sine()

mod = Sine( .5, 50 )._ // disconnect!

sine.frequency = Add( 440, Abs( mod ) )
```

#### Properties

* _0_ : Float or Ugen. The first operand passed to the constructor.