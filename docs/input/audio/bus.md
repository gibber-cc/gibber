###Bus

A audio bus for routing FX, or controlling amplitude and panning.

```
drums = EDrums('x*ox*xo')

bus1 = Bus().fx.add( Schizo() )
bus1.pan = 1

bus2 = Bus().fx.add( Delay({ bitDepth:3 }) )
bus2.pan.seq( [-1,0,1], 1 )

drums.send( bus1, .5 )
drums.send( bus2, .5 )
```

#### Properties

* _amp_ : Float. Default range: { .0, 1 }. Default value: 1. Gain on the bus signal.
* _pan_  : Float range: { -1, 1 }. Default: 0. Position of the bus in the stereo spectrum.
* _fx_ : Array. You can `add` or `remove` fx from the bus using this array.

#### Methods

None worth mentioning.
