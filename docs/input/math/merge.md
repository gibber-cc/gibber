##Merge

`Merge` accepts a stereo input and converts it to mono so that it can be used with other math / binary operators. For example, the `Drums` ugen (and most other synths / samplers) outputs a stereo signal. If we want to use this signal for modulation we need to employ `Merge`.

```
drums = Drums( 'x*ox*xo-' )
mono = Merge( drums ) 

sine = Sine()
sine.frequency = Mul( mono, 400 )
```

#### Properties

* _0_ :  Ugen. The stereo generator output to be converted into a mono signal.
