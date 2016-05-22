##Kick

A synthesized kick drum generator with a built-in sequencer.

Inherits from Ugen.

Example:
```javascript
a = Kick().play( 55, 1/4 )  
a.decay = .75
```
#### Properties

* _decay_ : Float. default range { 0, 1 }. The length of the kick drum decay.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _note_( Float:frequency ) : Triggers the kick drum envelope using the provided frequency.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.
