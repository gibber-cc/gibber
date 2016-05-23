###Synth2

A selectable oscillator attached to an Attack / Decay envelope and a filter. The attack decay envelope modulates the amplitude of the oscillator and the cutoff frequency of the filter. The filterMult property determines how much the envelope raises the base cutoff for the filter over the course of the envelope. For example, if a synth2 has a base cutoff of .1 and a filterMult of .2, the modulated filter cutoff will be .3 when the envelope is at its peak. 

Inherits from Ugen.

Example:
```javascript
a = Synth2({ maxVoices:4, waveform:'PWM', filterMult:0, resonance:4 })

a.play( [440, 880, 1320], 1/4 )

a.cutoff = Add( .2, Sine(.1, .15)._ )
```

#### Properties

* _frequency_ : Hz. default range { 50, 3200 }. default value 440.
* _amp_ : Float. default range { 0, 1 }. default value: .25.
* _pulsewidth_ : Float. default range { 0, 1 }. default value: .5
* _attack_ : Int. Default range { 23, 44100 }. default value: 22050
* _decay_ : Int. Default range { 23, 44100 }. default value: 22050
* _maxVoices_: Int. Default value: 1. The maximum number of frequencies the synthesizer can play simultaneously. This value can *only be set during initialization*.
* _glide_: Float. Default range { 0, 1 }. Default value: .15. This property creates glissandi as the synthesizer moves from one note to the next. The closer the value is to one the longer the glissandi will be. 
* _pan_: Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum of the Synth output.
* _waveform_ : String. The name of an oscillator for the synth to use.
* _cutoff_ : Float. Default range {0, .7}. The cutoff of the filter in normalized frequency values. The particular filter algorithm used is not particularly stable past .7.
* _resonance_ : Float. Default range {0, 5.5}. Resonance values higher than 5 will likely blow up to some extent depending on the source material. Be careful!
* _filterMult_ : Float. This property determines the amount the envelope will modulate the cutoff frequency by, normalized between {0,1}.

#### Methods

* _chord_( Array:frequencies, Float:amp(optional) ) : Playback multiple notes at a provided amplitude. The maxVoices property have been set to a value higher than 1 during intialization for this function to work.
* _note_( Float:frequency, Float:amp(optional) ) : This method tells the synthesizer to play a single note at a particular volume.
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. 
