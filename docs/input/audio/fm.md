##FM

Simple frequency modulation synthesis via two sine oscillators feeding an Attack/Decay envelope. The cmRatio property determines the ratio between the carrier and modulator frequencies. The index determines the amplitude of the modulator. The AD envelope modulates the amplitude of the overall output as well as the index property. For basic info on FM synthesis see the FM tutorial. 

Inherits from Ugen.

Example:
```javascriptjavascript
a = FM({ maxVoices:4, index:10, cmRatio:1.0333 })

a.chord( ['c2', 'eb2', 'g2', 'b2'] )
```

#### Properties

* _frequency_ : Hz. default range { 50, 3200 }. default value 440. For synths this is usually only accessed to modulate frequency; pitch of notes is generally set using the note() method, which also triggers the AD envelope.
* _amp_ : Float. default range { 0, 1 }. default value: .25.
* _index_ : Float. Default range {.1, 50}. Default value: 5. The amplitude of the modulator.
* _cmRatio_ : Float. Default range {.1, 50}. Default value: The ratio between the carrier and modulator frequencies. This ratio is maintained as different frequency values are passed to the note() method.
* _attack_ : Int. Default range { 23, 44100 }. default value: 22050
* _decay_ : Int. Default range { 23, 44100 }. default value: 22050
* _maxVoices_: Int. Default value: 1. The maximum number of frequencies the synthesizer can play simultaneously. This value can *only be set during initialization*.
* _glide_: Float. Default range { 0, 1 }. Default value: .15. This property creates glissandi as the synthesizer moves from one note to the next. The closer the value is to one the longer the glissandi will be. 
* _pan_: Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum of the Synth output.
* _waveform_ : String. The name of an oscillator for the synth to use.

#### Methods

* _chord_( Array:frequencies, Float:amp(optional) ) : Playback multiple notes at a provided amplitude. The maxVoices property have been set to a value higher than 1 during intialization for this function to work.
* _note_( Float:frequency, Float:amp(optional) ) : This method tells the synthesizer to play a single note at a particular volume.
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator. The generated sequencer is subsequently held in the .seq property of the synth.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. 
