###Mono

A three-oscillator monosynth feeding an Attack / Decay envelope and a 24db ladder-style filter. The attack decay envelope modulates the amplitude of the oscillator and the cutoff frequency of the filter. The filterMult property determines how much the envelope raises the base cutoff for the filter over the course of the envelope. For example, if a synth2 has a base cutoff of .1 and a filterMult of .2, the modulated filter cutoff will be .3 when the envelope is at its peak. 

The second and third oscillators can be detuned from the first using the detune2 and detune3 properties, which are measured in octaves. Thus, a detune2 value of -1 means the second oscillator will be an octave beneath the first. These properties can be modulated.

Inherits from Ugen.

Example:
```javascriptjavascript
a = Mono({ waveform:'Saw', filterMult:0, resonance:4, detune2:.05, detune3:-.05 })

a.play( [440, 880, 1320], 1/4 )
```

#### Properties

* _frequency_ : Hz. default range { 50, 3200 }. default value 440.
* _amp_ : Float. default range { 0, 1 }. default value: .25.
* _pulsewidth_ : Float. default range { 0, 1 }. default value: .5. This property only applies if the synth is using the PWM waveform.
*_detune2_ : Float. Default range {0, .15 }. The amount that the second oscillator is detuned from the first, measured in octaves.
*_detune3_ : Float. Default range {0, .15 }. The amount that the third oscillator is detuned from the first, measured in octaves.
* _attack_ : Int. Default range { 23, 44100 }. default value: 22050. This is measured in samples.
* _decay_ : Int. Default range { 23, 44100 }. default value: 22050. Measured in samples.
* _glide_: Float. Default range { 0, 1 }. Default value: .15. This property creates glissandi as the synthesizer moves from one note to the next. The closer the value is to one the longer the glissandi will be. 
* _pan_: Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum of the Synth output.
* _waveform_ : String. The name of an oscillator for the synth to use.
* _cutoff_ : Float. Default range {0, .7}. The cutoff of the filter in normalized frequency values. The particular filter algorithm used is not particularly stable past .7.
* _resonance_ : Float. Default range {0, 5.5}. Resonance values higher than 5 will likely blow up to some extent depending on the source material. Be careful!
* _filterMult_ : Float. This property determines the amount the envelope will modulate the cutoff frequency by, normalized between {0,1}.

#### Methods

* _note_( Float:frequency, Float:amp(optional) ) : This method tells the synthesizer to play a single note at a particular volume.
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. 
