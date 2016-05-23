###PWM

An anti-aliased pulsewave modulation oscillator built from FM feedback.

Inherits from Ugen.

#### Properties

* _frequency_ : Hz. default range { 50, 3200 }. default value 440.
* _amp_ : Float. default range { 0, 1 }. default value: .25.
* _pulsewidth_ : Float. default range { 0, 1 }. default value: .5

#### Methods

* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. 
