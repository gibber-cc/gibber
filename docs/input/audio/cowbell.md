##Cowbell

Classic 808 cowbell with two square waves feeding a bandpass filter and an exponential decay envelope.

Inherits from Ugen.

Example:
```javascript
// use random tunings for each Tom hit  
a = Cowbell().play( Rndf(5500, 44100), 1/2 )  
```
#### Properties

* _pitch_ : Int. The pitch of the first square wave in Hz. TODO: this should be a single float where 1 gives yields the classic 565 / 845 frequencies.
* _decay_ : Int. The length, in samples, of the cowbell decay.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _note_( Int:decay )
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.
