###Input

Read input from the microphone, for live-processing or sampling. Chrome is currently the only browser to support this feature.

Example:
```javascript
input = Input().fx.add( Delay() )

// record two measures of input and delay
sampler = Sampler().record( input.fx[0], 2 )
sampler.note.seq( [.5,1,2,4,.25].rnd(), 1/2 )

// disconnect input after sampler has finished recording
input._
```

#### Properties

* _amp_ : Default range: { 0, 1 }. Default value: 1. Gain stage on input.
* _fx_ : Array. You can `add` or `remove` fx from the bus using this array.

#### Methods

None worth mentioning.
