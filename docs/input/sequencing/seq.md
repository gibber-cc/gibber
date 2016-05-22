##Seq

The Seq object is a standalone sequencer that can schedule calls to methods and properties on a target object. Alternatively, it can be used to quickly sequence repeated calls to an anonymous function. Scheduling occurs at audio-rate and may be modulated by audio sources.

Sequencers can work in one of two ways. In the first, anonymous functions can easily be scheduled to execute repeatedly. To create a `Seq` that accomplishes this, simply pass the constructor two values: the function to be executing and an array of time values to use for scheduling. In the second mode, a JS object is passed with keys for (at minimum) `durations` and `target`. The `durations` value is an array of times that determine when the sequencer fires. The `target` value is an object that the sequencer can alter properties of and call methods on. Any additional key passed to the JS object becomes a property or method that is sequenced on the target object.

In the below example, the `b` `Seq` object uses the second mode, sequencing calls to the `note` method on the `a` ugen. The `c` `Seq` uses the first constructor type, passing an anonymous function to be executed and a timing to be used for scheduling. 

```
a = Synth( 'bleep' )

b = Seq({
  note: [0,1,2,3],
  durations: 1/4,
  target: a,
})

c = Seq( function() {
  b.rate[ 1 ] *= 2
}, 2 )
```

#### Properties

* _rate_ : A Gibber [Mul][mul] object. By default this ugen takes Gibber's master clock (stored in `seq.rate[0]` and multiplies it by 1 (stored in `seq.rate[1]`. To cut the time in half, run `seq.rate[1] *= .5`.
* _target_ : Object. When the Seq object has a target, it can be used to change properties and call methods on that `target` object.
* _durations_: Array, Function, or Number. The scheduling used by the sequencer. This is a Gibber [Pattern][pattern] object.
* _offset_: Time. A delay before the sequencer begins running. You can use this to schedule events that occur on off beats; for example, to get a note on beats two and four: `b = Seq({ note:0, durations:1/2, offset:1/4 })`
 
#### Methods

* _start_: If the sequencer is stopped, start it.
* _stop_: If the sequencer is running, stop it.
* _kill_: Remove the sequencer from the audio graph.

[mul]: javascript:Gibber.Environment.Docs.openFile('math','mul')
[pattern]: javascript:Gibber.Environment.Docs.openFile('seq','pattern')