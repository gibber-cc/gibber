##Hat

A synthesized hihat drum sound with a built-in sequencer. Consists of six detuned sequencers feeding split into separate bandpass and hipass filters.

Inherits from Ugen.

Example:
```javascript
// use random decays for each hihat hit  
a = Hat().play( Rndi(1000, 11025), 1/8 )	
```
#### Properties

* _decay_ : Int. The length of the decay in samples. IMPORTANT NOTE: At some point this will change to a value between {0,1}, but for now you specify this in samples.
* _pitch_ : Int. The base frequency for the square wave oscillators used to generate the hihat sound. Default is 325 Hz.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator. 
* _note_( Int:decay ) : The decay of the hihat hit. 
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.
