###Clamp

Clamp the output of a ugen to a range of values.

In the example below, the `clamp` ugen acts as a half-wave rectifier.
```
sine = Sine()

mod = Sine( .5, 250 )._ // disconnect!

clamp = Clamp( mod, 0, mod.amp )

sine.frequency = Add( 440, clamp )
```

#### Properties

* _input_ : Ugen. The signal that will be clamped.
* _min_ : Float or Ugen. Define the minimum boundary for clamping.
* _max_ : Float or Ugen. Define the maximum boundary for clamping.

Note that math ugens do not automatically connect to the master graph as they are
typically used for modulation. You have to explicitly call `clamp.connect()` if you
want to connect the output directly to a bus.