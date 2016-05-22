##Synth

A selectable oscillator attached to an Attack / Decay envelope. The attack decay envelope modulates the amplitude of the oscillator.
Inherits from Ugen.

Example:
```javascript
a = Synth({ maxVoices:4, waveform:'PWM', attack:ms(1), decay:ms(1000) })

a.play( [440, 880, 1320], 1/4 )
```

#### Properties

* _frequency_ : Hz. default range { 50, 3200 }. default value 440.
* _amp_ : Float. default range { 0, 1 }. default value: .25.
* _pulsewidth_ : Float. default range { 0, 1 }. default value: .5
* _attack_ : Int. Default range { 23, 44100 }. default value: 22050. Measured in samples.
* _decay_ : Int. Default range { 23, 44100 }. default value: 22050. Measured in samples.
* _maxVoices_: Int. Default value: 1. The maximum number of frequencies the synthesizer can play simultaneously. This value can *only be set during initialization*.
* _glide_: Float. Default range { 0, 1 }. Default value: .15. This property creates glissandi as the synthesizer moves from one note to the next. The closer the value is to one the longer the glissandi will be. 
* _pan_: Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum of the Synth output.
* _waveform_ : String. The name of an oscillator for the synth to use.

#### Methods

* _chord_( Array:frequencies, Float:amp(optional) ) : Playback multiple notes at a provided amplitude. The maxVoices property have been set to a value higher than 1 during intialization for this function to work.
* _note_( Float:frequency, Float:amp(optional) ) : This method tells the synthesizer to play a single note at a particular volume.
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. 
