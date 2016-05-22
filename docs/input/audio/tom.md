##Tom

A synthesized tom with a built-in sequencer, generated using a resonant bandpass filter fed by an impulse combined with noise feeding into a lowpass filter.

Inherits from Ugen.

Example:
```javascript
// use random tunings for each Tom hit  
a = Tom().play( Rndf(80, 160), 1/8 )  
```
#### Properties

* _pitch_ : Float. The cutoff frequency of the resonant filter used to generate the Tom sound. This is also set by the note method.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _note_( Float:pitch, Float:amp )
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.
