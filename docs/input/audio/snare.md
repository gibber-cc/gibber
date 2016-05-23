###Snare

A synthesized snare drum generator with a built-in sequencer.

Inherits from Ugen.

Example:
```javascript
// use random tunings for each snare hit  
a = Snare().play( Rndf(.5, 1.5), 1/2 )  
a.decay = 22050  
```
#### Properties

* _decay_ : Int. The length of noise decay in the snare sound in samples. IMPORTANT NOTE: At some point this will change to a value between {0,1}, but for now you specify this in samples.
* _snappy_ : Float. The amplitude of the noise level in the snare sound.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _note_( Float:tuning, Float:amp, Float:snappy ) : Tuning changes the frequency of various bandpass filters within the synthesis values. Numbers above one will have a higher pitch than the default; lower numbers will have a lower pitch.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.
