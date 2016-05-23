###Pluck

Simple physical model of a plucked string using Karplus-Strong.

Inherits from Ugen.

Example:
```javascriptjavascript
a = Pluck()

a.play( Rndi(220, 880), 1/16 )

a.blend = Add( .5, Sine(.05, .5)._ )
```

#### Properties

* _amp_ : Float. default range { 0, 1 }. default value: .25.
* _blend_ : Float. Default range { 0, 1 }. Default value: 1. In the Karplus-Strong model, the blend parameter determines the likelihood that the sign of a given sample will be flipped; this introduces noise into the model. A value of 1 means the sign will always be positive; a value of 0 means the sign will be random per sample. A value of 1 yields the typical plucked string sound.
* _damping_ : Default range { 0, 1 }. Simulates damping of the string, which is also affected by frequency.
* _maxVoices_: Int. Default value: 1. The maximum number of frequencies the synthesizer can play simultaneously. This value can *only be set during initialization*.
* _pan_: Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum of the Synth output.

#### Methods

* _chord_( Array:frequencies, Float:amp(optional) ) : Playback multiple notes at a provided amplitude. The maxVoices property have been set to a value higher than 1 during intialization for this function to work.
* _note_( Float:frequency, Float:amp(optional) ) : This method tells the synthesizer to play a single note at a particular volume.
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. 
