# Audio
## Oscillators
###Sine

A sinewave oscillator built from an interpolated wavetable.

Inherits from Ugen.

#### Properties

* _frequency_ : Hz. default range { 50, 3200 }. default value 440.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.

###Triangle

A triangle oscillator built from an interpolated wavetable.

Inherits from Ugen.

#### Properties

* _frequency_ : Hz. default range { 50, 3200 }. default value 440.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.

###Square

A squarewave oscillator using an interpolated wavetable.

Inherits from Ugen.

#### Properties

* _frequency_ : Hz. default range { 50, 3200 }. default value 440.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.

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

###Noise

A white noise oscillator. 

Inherits from Ugen.

#### Properties

* _amp_ : Float. default range { 0, 1 }. default value: 1.

#### Methods

* _kill_() : Disconnect the oscillator from whatever bus it is connected to. 

###Saw

A sawtooth oscillator built from an interpolated wavetable.

Inherits from Ugen.

#### Properties

* _frequency_ : Hz. default range { 50, 3200 }. default value 440.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.

## Synths
###Sampler

Record and playback audiofiles at variable speeds. Recordings made using the sampler can be rendered to .wav files by the browser using the _download_() method.

Inherits from Ugen.

Example:
```javascriptjavascript
a = XOX('x*o*x*o-')
b = Sampler.record( a, 2 ) // record for two measures

b.note( -2 ) // play in reverse at twice the recorded speed / pitch
```

#### Properties

* _pitch_ : Float. Default range: { 1, 4 }. Default value: 1. This property determines the speed of sample playback. Negative values play the sample in reverse. This value can also be set using the note() method.
* _amp_ : Float. Default range: { 0, 1 }. Default value: 1.
* _loops_ : Boolean. Default value: false. If true, sample playback loops back to the beginning after reach the end of a buffer, or vice-versa if the sample is playing in reverse.
* _start_ : Float. Default range { 0, 1 }. Default value: 0. Determines the starting position for sample playback as a normalized value where 0 equals the first sample and 1 represents the final sample in the buffer.
* _end_ : Float. Default range { 0, 1 }. Default value: 1. Determines the end position for sample playback as a normalized value where 0 equals the first sample and 1 represents the final sample in the buffer. 
* _pan_ : Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum for output.
 
#### Methods

* _note_( Float:pitch, Float:amp ): Begin playback at the position determined by the start property at a rate determine by the pitch argument and at a provided amplitude.
* _record_( Ugen:input, Float:time ): Record the output of a given unit generator for a provided amount of time.
* _download_(): Download the buffer used by the Sampler as a .wav file
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. 

###SoundFont

Sampled-based instruments that follow the SoundFont 2 specification. The samples for SoundFonts are loaded whenever they are first instantiated and then cached for other instances. E.g. the first time you run `a = SoundFont('piano')` all the acoustic piano samples will be downloaded; if `b = SoundFont('piano')` is subsequently run the samples will not have to be loaded again as the cached data will be used.

At the end of this reference is a list of General MIDI sounds for valid instruments that the SoundFont object supports. In addition, Gibber comes with shorthand for several soundbanks:

acoustic_grand_piano = piano  
electric_guitar_clean = guitar  
acoustic_bass = bass  
rock_organ = organ  
synth_brass_1 = brass  
synth_strings_1 = strings  
choir_aahs = choir  

Example:
```javascriptjavascript
a = SoundFont( 'piano' )
a.note.seq( [0,1,2,3],1/8 )

b = SoundFont( 'kalimba' )
b.note.seq( [14,15,16,17], 1/2 )
```

#### Properties

* _amp_ : Float. Default range: { 0, 1 }. Default value: 1.  

* _loudness_ : Float. Determines the amplitude of individual notes, while `amp` affects all output. For example:  
```javascript
a = SoundFont('piano')
  .note.seq( Rndi(0,14), 1/8 )
  .loudness.seq( Rndf() )
```
In the above example, each note will be played at a different loudness. The value of `loudness` represents a scalar with a linear output curve that the note output is multiplied by.  

* _pan_ : Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum for output.
 
#### Methods

* _note_( Float:pitch, Float:loudness ): Begin playback at the position determined by the start property at a rate determine by the pitch argument and at a provided loudness.  

* _kill_() : Disconnect the oscillator from whatever bus it is connected to. 

#### Complete Sound List
  
accordion  
acoustic_bass  
acoustic_grand_piano  
acoustic_guitar_nylon  
acoustic_guitar_steel  
agogo  
alto_sax  
applause  
bagpipe  
banjo  
baritone_sax  
bassoon  
bird_tweet  
blown_bottle  
brass_section  
breath_noise  
bright_acoustic_piano  
celesta  
cello  
choir_aahs  
church_organ  
clarinet  
clavinet  
contrabass  
distortion_guitar  
drawbar_organ  
dulcimer  
electric_bass_finger  
electric_bass_pick  
electric_grand_piano  
electric_guitar_clean  
electric_guitar_jazz  
electric_guitar_muted  
electric_piano_1  
electric_piano_2  
english_horn  
fiddle  
flute  
french_horn  
fretless_bass  
fx_1_rain  
fx_2_soundtrack  
fx_3_crystal  
fx_4_atmosphere  
fx_5_brightness  
fx_6_goblins  
fx_7_echoes  
fx_8_scifi  
glockenspiel  
guitar_fret_noise  
guitar_harmonics  
gunshot  
harmonica  
harpsichord  
helicopter  
honkytonk_piano  
kalimba  
koto  
lead_1_square  
lead_2_sawtooth  
lead_3_calliope  
lead_4_chiff  
lead_5_charang  
lead_6_voice  
lead_7_fifths  
lead_8_bass__lead  
marimba  
melodic_tom  
music_box  
muted_trumpet  
oboe  
ocarina  
orchestra_hit  
orchestral_harp  
overdriven_guitar  
pad_1_new_age  
pad_2_warm  
pad_3_polysynth  
pad_4_choir  
pad_5_bowed  
pad_6_metallic  
pad_7_halo  
pad_8_sweep  
pan_flute  
percussive_organ  
piccolo  
pizzicato_strings  
recorder  
reed_organ  
reverse_cymbal  
rock_organ  
seashore  
shakuhachi  
shamisen  
shanai  
sitar  
slap_bass_1  
slap_bass_2  
soprano_sax  
steel_drums  
string_ensemble_1  
string_ensemble_2  
synth_bass_1  
synth_bass_2  
synth_brass_1  
synth_brass_2  
synth_choir  
synth_drum  
synth_strings_1  
synth_strings_2  
taiko_drum  
tango_accordion  
telephone_ring  
tenor_sax  
timpani  
tinkle_bell  
tremolo_strings  
trombone  
trumpet  
tuba  
tubular_bells  
vibraphone  
viola  
violin  
voice_oohs  
whistle  
woodblock  
xylophone  

###Synth

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

###FM

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

## Drums & Percussion
###Drums

A sampled drum kit with an attached sequencer for quick beat construction. The first argument to the constructor allows you to easily define beats using the following syntax:

* x : kick drum hit
* o : snare drum hit
* \* : close hihat
* \- : open hihat
* . : rest

Drums objects are basically hybrid sequencers / unit generators; this means that you can call most unit generator methods, ( such as drums.fx.add() ) as well as most sequencer methods ( such as drums.stop() and drums.start() ). By default, the constructor assumes that you want each note in your sequence to have a duration equal to one divided by the number of notes you specify. For example, if you specify a four-note sequence the Drums sequencer will assume you want each note to be a quarter note in duration. You can also specify a duration explicitly as a second parameter to the constructor.

There are a few different drum kits that come with Gibber (with hopefully more to follow). The kits are electronic (the default), original and beatbox. The example below shows how to load a different than the default electronic one.

Finally, note that each individual sound is actually an instance of the Gibber [Sampler][sampler] object. This means you can add effects to the individual sounds in addition to the kit as a whole.

Example:
```javascript
a = Drums( 'xoxo' ) // each note is a quarter note in duration  
a.fx.add( Delay( 1/64) )  

b = Drums( '***-', 1/8 ) // each note is an eighth note  
b.hat.fx.add( Distortion() )  
b.pitch = 2  

c = Drums({  
  kit:'beatbox',  
  note:'Tfk8p'  
})  
```

#### Properties

* _pitch_ : Float. default range { .25, 4 }. default value 1. The speed of sample playback.
* _amp_ : Float. default range { 0, 1 }. default value: 1.
* _pan_: Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum of the Drums output.
* _kick_: Ugen. The kick drum sampler.
* _snare_: Ugen. The snare drum sampler.
* _hat_: Ugen. The hihat sampler.
* _seq_: Sequencer. The built-in Seq object.

#### Methods

* _note_( Float:frequency, Float:amp(optional) ) : This method tells the drum kit to play a single note.
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the Drums from whatever bus it is connected to. 

[sampler]: javascript:Gibber.Environment.Docs.openFile('audio','sampler')
###EDrums

A synthesized drum kit, carefully designed to simulate a Roland TR-808 drum machine, with an attached sequencer for quick beat construction. The first
argument to the constructor allows you to easily define beats using the following syntax:

* x : kick drum hit
* o : snare drum hit
* \* : close hihat
* \- : open hihat
* . : rest

EDrums are basically hybrid sequencers / unit generators; this means that you can call most unit generator methods,
( such as drums.fx.add() ) as well as some sequencer methods ( such as xox.stop() and xox.start() ). By default, the constructor
assumes that you want each note in your sequence to have a duration equal to one divided by the number of notes you specify. For example, if you
specify a four-note sequence the XOX sequencer will assume you want each note to be a quarter note in duration. You can also specify a duration
explicitly as a second parameter to the constructor.

Unlike the Drums object, each sound in the XOX object is a synthesis unit generator. The parameters for each ugen are different. Basically the XOX 
consists of a Bus object that the individual synthesizers are attached to, and a sequencer to control them.

Example:
```javascript
a = EDrums( 'xoxo' ) // each note is a quarter note in duration  
a.fx.add( Delay( 1/64) )  
a.snare.snappy = 1.5  
  
b = EDrums( '***-', 1/8 ) // each note is an eighth note
b.hat.fx.add( Distortion() )  
b.kick.decay = 1  
  
b.seq.note = 'xoxx**-o'  
```

#### Properties
* _amp_ : Float. default range { 0, 1 }. default value: 1.
* _pan_: Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum of the Synth output.
* _kick_: Ugen. The kick drum unit generator.
* _snare_: Ugen. The snare drum unit generator.
* _hat_: Ugen. The hihat unit generator.
* _seq_: Sequencer. The built-in Seq object.

#### Methods

* _note_( Float:frequency, Float:amp(optional) ) : This method tells the drum kit to play a single note.
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the Drums from whatever bus it is connected to. 

###Kick

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

###Hat

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

###Clave

A synthesized clave with a built-in sequencer, generated using a resonant bandpass filter fed by an impulse.

Inherits from Ugen.

Example:
```javascript
// use random tunings for each clave hit  
a = Clave().play( Rndf(1500, 5000), 1/16 )  
```
#### Properties

* _pitch_ : Float. The cutoff frequency of the resonant filter used to generate the clave sound. This is also set by the note method.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _note_( Float:pitch, Float:amp )
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.

###Cowbell

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

###Conga

Impulse feeding resonant bandpass filter. Similar to the synth Kick sound but without the additional lowpass filter.

Inherits from Ugen.

Example:
```javascript
// use random tunings for each Tom hit  
a = Conga().play( Rndf(160, 480), 1/8 )  
```
#### Properties

* _pitch_ : Float. The cutoff frequency of the resonant filter used to generate the Tom sound. This is also set by the note method.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _note_( Float:pitch, Float:amp )
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.

###Tom

A synthesized tom with a built-in sequencer, generated using a resonant bandpass filter fed by an impulse combined with noise feeding into a lowpass filter.

Inherits from Ugen.

Example:
```javascript
// use random tunings for each Tom hit  
a = Tom().play( Rndf(80, 160), 1/8 )  
```
#### Properties

* _pitch_ : Float. The cutoff frequency of the resonant filter used to generate the Tom sound. This is also set by the note method.
* _amp_ : Float. default range { 0, 1 }. default value: .25.

#### Methods

* _note_( Float:pitch, Float:amp )
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the oscillator from whatever bus it is connected to. Note that if the oscillator is reference by another unit generator it will continue to feed output to it.

## Effects
###Flanger

Flanging effect acheived through a modulated delay line.

Example:
```javascript
a = FM().play( Rndi(100,1000), 1/4 )

f = Flanger({ rate:Slider(), feedback:Slider() }) 

a.fx.add( f )
```

#### Properties

* _rate_ : Default range: { .01, 20 }. The speed in Hz that the delay tap position is modulated by.  
* _feedback_  : Default range: { 0, .99 }. The amount of output signal fed back into the input.
* _amount_ : Default range: { 25, 300 }. The size of the delay line.

#### Methods

None worth mentioning.

###HPF

A 24db per octave, high-pass resonant filter. 

Example:
```javascript
d = XOX( 'x*o*x*o-' )

h = HPF()
h.cutoff = Add( .4, Sine(.2, .3)._ )
h.resonance = 4

d.fx.add( h )
```

#### Properties

* _cutoff_ : Default range: { 0, 1 }. Float. The cutoff frequency for the filter measured from 0 to 1 where 1 is nyquist. In practice, values above .75 or so seem unstable.  
* _resonance_ : Default range: { 0, 5.5 }. The amount of emphasis placed on the frequencies surrounding the cutoff. This can cause the filter to blow up at values above 5.5, but can also introduce pleasing distortion at high values in certain situations. Be careful!

#### Methods

None worth mentioning.

###LPF

A 24db per octave resonant filter. 

Example:
```javascript
d = XOX( 'x*o*x*o-' )

l = LPF()
l.cutoff = Add( .4, Sine(.2, .3)._ )
l.resonance = 4

d.fx.add( d )
```

#### Properties

* _cutoff_ : Default range: { 0, 1 }. Float. The cutoff frequency for the filter measured from 0 to 1 where 1 is nyquist. In practice, values above .75 or so seem unstable.  
* _resonance_ : Default range: { 0, 5.5 }. The amount of emphasis placed on the frequencies surrounding the cutoff. This can cause the filter to blow up at values above 5.5, but can also introduce pleasing distortion at high values in certain situations. Be careful!

#### Methods

None worth mentioning.

###Tremolo

Basic amplitude modulation effect

Example:
```javascript
a = Synth({ attack:44, decay:44100 }).play( Rndi(100,1000), 1/2 )

r = Tremolo({ amp: 1, frequency:.5 })

a.fx.add( r )
```

#### Properties

* _frequency_ : Default range: { .05, 20 }. The frequency of the modulating oscillator. 
* _amp_  : Default range: { 0, 1 }. Amplitude of the modulating oscillator. 

#### Methods

None worth mentioning.

###Gain

Basic amplitude control for insertion in fx chains.

Example:
```javascript
a = Synth({ attack:44, decay:44100 }).play( Rndi(100,1000), 1/2 )

a.fx.add( Crush( 2, .1 ) )

b = Gain({ amp: .5 })

a.fx.add( b )
```

#### Properties

* _amount_  : Default range: { 0, 1 }. Constant to modulate input value by.

#### Methods

None worth mentioning.

###Reverb

Implementation of the Schroeder/Moorer model.

Inherits from Ugen.

Example:
```javascript
a = Pluck().play( Rndi(100,1000), 1/4 )

r = Reverb({ roomSize: Add( .75, Sine( .05, .245 )._ ) })

a.fx.add( r )
```

#### Properties

* _roomSize_ : Default range: { .5, .995 }. The size of the room that is simulated.
* _damping_  : Default range: { 0, 1 }. Attenuation of high frequencies.

#### Methods

None worth mentioning.

###Delay

Simple echo effect with variable delay time and feedback.

Example:
```javascript
a = Pluck().play( Rndi(100,1000), 1/4 )

d = Delay()

q = Seq({
  time: Rndi( ms(2), ms(500) ),
  durations:1/2,
  target: d 
})

a.fx.add( d )
```

#### Properties

* _time_ : Default range: { 50, 88200 }. The time between echoes, measured in samples. 
* _feedback_  : Default range: { 0, 1 }. How much output is fed back into the input of the delay. 

#### Methods

None worth mentioning.

###Crush

Digital distortion through bit-depth quantization and sample-rate reduction.

Example:
```javascript
a = FM().play( Rndi(100,1000), 1/4 )

c = Crush({ bitDepth:Slider(), sampleRate:Slider() })

a.fx.add( c )
```

#### Properties

* _bitDepth_ : Default range: { 1, 16 }. Float. The number of bits used in the output sample.  
* _sampleRate_ : Default range: { 0, 1 }. Float. The sample rate of the output signal. 

#### Methods

None worth mentioning.

###Chorus

Chorusing effect acheived through a modulated delay line. This is actually just a flanger with settings that make it resemble a chorus effect.

Example:
```javascript
a = FM().play( Rndi(100,1000), 1/4 )

c = Chorus({ rate:Slider(), feedback:Slider() }) 

a.fx.add( c )
```

#### Properties

* _rate_ : Default range: { .01, 20 }. Default value: 1. The speed in Hz that the delay tap position is modulated by.  
* _feedback_  : Default range: { 0, .99 }. Default: 0.The amount of output signal fed back into the input.
* _amount_ : Default range: { 25, 300 }. Default: ms(1). The size of the delay line in samples.

#### Methods

None worth mentioning.

###Vibrato

A simple frequency modulation effect acheived using a delay line.

Example:
```javascript
a = FM().play( Rndi(100,1000), 1/4 )

v = Vibrato({ rate:Slider() }) 

a.fx.add( x )
```

#### Properties

* _rate_ : Default range: { .01, 20 }. The speed in Hz that the delay tap position is modulated by.  
* _amount_ : Default range: { 25, 300 }. The size of the delay line; this effectively controls the depth of the vibrato.

#### Methods

None worth mentioning.

###Schizo

A buffer-shuffling / stuttering effect with reversing and pitch-shifting.

Example:
```javascript
d = XOX( 'x*o*x*o-' )

s = Schizo({ chance:.5, rate:ms(250), length:ms(1000) })

d.fx.add( s )

```


#### Properties

* _chance_ : Default range { 0, 1 }. The likelihood that stuttering will occur at given intervals.
* _rate_ : Default 11025. Measured in samples. How often Schizo randomly determines whether or not it should begin stuttering.
* _length_ : Default 22050. Measured in samples. The length of time that stuttered audio plays when stuttering is triggered.
* _reverseChance_ : Float { 0 , 1 }, default .5. The chance that a particular stutter will play in reverse.
* _pitchChance_ : Float { 0,1 }, default.5. The chance that a particular stutter will be repitched.
* _pitchMin_ : Float, default: .25. The lowest playback rate for repitched stuttering.
* _pitchMax_ : Float, default: 2. The highest playback rate for repitched stuttering.
* _wet_ : Float { 0,1 }, default 1. When shuffling, the amplitude of the stuttered audio.
* _dry_ : Float { 0,1 }, default 0. When shuffling, the amplitude of the un-stuttered audio.

#### Methods

None worth mentioning.

###RingMod

Ring modulation effect.

Example:
```javascript
a = Pluck().play( Rndi(100,1000), 1/4 )

r = RingMod({ amp: 1, frequency:440 })

a.fx.add( r )
```

#### Properties

* _frequency_ : Default range: { 20, 3000 }. The frequency of the modulating oscillator. 
* _amp_  : Default range: { 0, 1 }. Amplitude of the modulating oscillator. 

#### Methods

None worth mentioning.

## Math/Modulation
###Abs

Take the absolute value of a unit generator's output (or a number) on a per-sample basis.

In the example below, note that the frequency only travels above the default pitch of the sine oscillator (440 Hz).
```
sine = Sine()

mod = Sine( .5, 50 )._ // disconnect!

sine.frequency = Add( 440, Abs( mod ) )
```

#### Properties

* _0_ : Float or Ugen. The first operand passed to the constructor.
###Add

A simple unit generator to add multiple values together on a per-sample basis, primarily for use in modulation. `Add` has a constructor that accepts two values.

Example:
```javascript
drums = EDrums('x*o*x*o-')

mod = Sine( 12, .5 )._ 
add = Add( .5, mod )

drums.amp = add
```

#### Properties

* _0_ : Float or Ugen. The first operand passed to the constructor.
* _1_ : Float or Ugen. The second operand passed to the constructor.
###Clamp

Clamp the output of a ugen to a range of values.

In the example below, the `clamp` ugen acts as a half-wave rectifier.
```
sine = Sine()

mod = Sine( .5, 250 )._ // disconnect!

clamp = Clamp( mod, 0, mod.amp )

sine.frequency = Add( 440, clamp )
```

#### Properties

* _input_ : Ugen. The signal that will be clamped.
* _min_ : Float or Ugen. Define the minimum boundary for clamping.
* _max_ : Float or Ugen. Define the maximum boundary for clamping.

Note that math ugens do not automatically connect to the master graph as they are
typically used for modulation. You have to explicitly call `clamp.connect()` if you
want to connect the output directly to a bus.
###Div

A simple unit generator to divide a pair of values on a per-sample basis, primarily for use in modulation. `Div` has a constructor that accepts two values.

#### Properties

* _0_ : Float or Ugen. The first operand passed to the constructor.
* _1_ : Float or Ugen. The second operand passed to the constructor.
###Merge

`Merge` accepts a stereo input and converts it to mono so that it can be used with other math / binary operators. For example, the `Drums` ugen (and most other synths / samplers) outputs a stereo signal. If we want to use this signal for modulation we need to employ `Merge`.

```
drums = Drums( 'x*ox*xo-' )
mono = Merge( drums ) 

sine = Sine()
sine.frequency = Mul( mono, 400 )
```

#### Properties

* _0_ :  Ugen. The stereo generator output to be converted into a mono signal.

###Mod

A simple unit generator that calculates the modulus of a pair of values on a per-sample basis. `Mod` has a constructor that accepts two values.

#### Properties

* _0_ : Float or Ugen. The first operand passed to the constructor.
* _1_ : Float or Ugen. The second operand passed to the constructor.
###Mul

A simple unit generator to multiple multiple values together on a per-sample basis, primarily for use in modulation. `Mul` has a constructor that accepts two values.

Simple ring modulation:
```
sine = Sine()
sine.frequency.seq( Rndi(220,880), 1/4 )

mod = Sine( 220, 1 )._

mul = Mul( sine, mod )

mul.connect()
```

#### Properties

* _0_ : Float or Ugen. The first operand passed to the constructor.
* _1_ : Float or Ugen. The second operand passed to the constructor.
###Pow

Raise the first operand to the power of the second operand on a per-sample basis. `Pow` has a constructor that accepts two values.

```
sine = Sine()
sine.frequency.seq( Rndi(220,880), 1/4 )

mod = Sine( 220, 1 )._

mul = Mul( sine, mod )

mul.connect()
```

#### Properties

* _0_ : Float or Ugen. The first operand passed to the constructor.
* _1_ : Float or Ugen. The second operand passed to the constructor.
###Sqrt

Take the sqrt value of a unit generator's output (or a number) on a per-sample basis.

#### Properties

* _0_ : Float or Ugen. The operand to take the square root of.
###Sub

A simple unit generator to subtract values on a per-sample basis, primarily for use in modulation. `Sub` has a constructor that accepts two values.

Simple ring modulation:
```
sine = Sine()

mod = Sine( .5, 50 )._ // disconnect!

sine.frequency = Sub( 440, Abs( mod ) )
```

#### Properties

* _0_ : Float or Ugen. The first operand passed to the constructor.
* _1_ : Float or Ugen. The second operand passed to the constructor.
# Graphics
## Shaders
###Film

A shader recreating film grain / scanline effects

Example:
```javascript
a = Cube()
a.scale = 2
a.spin( .05 )

f = Film()
f.sCount = Slider()
f.sIntensity = Slider()
```

####Properties

* _sCount_ : Default range { 0,2048 }. The number of scanlines in the frame. 
* _sIntensity_ : Float. The strength of the scanline effect.
* _nIntensity_ : Float. The strength of the film grain noise.

###Dots

A post-processing shader recreating the halftone technique (http://en.wikipedia.org/wiki/Halftone) 

Example:
```javascript
a = Cube()
a.scale = 2
a.spin( .05 )
b = Dots({ scale:.25 })
```

####Properties

* _scale_ : Float. The size of the dots. Larger values result in smaller dots.
* _center_ : THREE.Vector2. Center position of dots
* _angle_ : Float. Angle of dots in radians

###Edge

Edge detection shader.

Example:
```javascript
a = Knot({ tube:3 })
a.scale = 2
a.spin( .005 )

e = Edge()
```

###Focus

A rough simulation of a depth of field effect.

Example:
```javascript
a = Knot({ tube:3 })
a.scale = 2
a.spin( .005 )

b = Drums('xxxx')

f = Focus()
f.sampleDistance = 2
f.waveFactor = b.out
```

####Properties

* _sampleDistance_ : Default range { 0,2 }. Distance to the point of focus.
* _waveFactor_ : Default range { 0, .05 }. Distortion introduced by the effect.
* _screenWidth_ : Default range { 0,1024 }.
* _screenHeight_ : Default range { 0,1024 }.

###Bleach

Lightens light areas and darkens other parts of the image
Example:
```javascript
a = Knot({ tube:3 })
a.scale = 2
a.spin( .005 )

b = Bleach()
```

###Kaleidoscope

Aptly named, this shader creates a kaleidoscope effect that can be rotated.

Example:
```javascript
a = Knot({ tube:3 })
a.scale = 2
a.spin( .05 )

k = Kaleidoscope()
k.sides = Slider()
k.update = function() {
  this.angle += .005
}
```

####Properties

* _sides_ : Default range { 2,36 }. The number of fragments comprising the kaleidoscope effect. 
* _angle_ : Default range { 0,2PI }. The rotation of the fragments.

###Pixellate

A shader that pixellates Gibber's graphical output.

Example:
```javascript
a = Knot({ tube:3 })
a.scale = 2
a.spin( .005 )

b = Drums('xxxx')

f = Pixellate()
f.amount = b.out
f.amount.max = .1
```

####Properties

* _amount_ : Default range { 0,.25 }. Amount of pixellation. A value of .25 means the screen will be pixellated into four quadrants; a value of .1 means 10 'pixels' a value of 0 means no pixellation occurs.
* _blend_ : Default range {0,1}. Blend the pixellated texture with the texture entering the shader.

###Stripes

A simple generative shader that creates a grid of lines.
Example:
```javascript
a = Drums('xxxx')

b = Stripes()
b.xCount = a.out
b.colorX.r = 1
b.colorX.g = 0
b.colorX.b = .5
```

####Properties

* _xCount_ : Default range { 1,100 }. The number of lines along the x-axis of the texture. 
* _yCount_ : Default range { 1,100 }. The number of lines along the y-axis of the texture. 
* _blend_ : Default range {0,1}. Blend the pixellated texture with the texture entering the shader.
* _colorX_: { r,g,b }. Each component is in the range of 0-1.
* _colorY_: { r,g,b }. Each component is in the range of 0-1.

## Misc
###3D Geometries

All 3d geometries share the methods and properties outlined below. In addition, each geometry has a set of properties that can only best (at least currently) on instantiation; they cannot be modified after a geometry has been created.

These constructors and their defaults are as follows:  

Cube:   { width:50, height:50, depth:50 },  
Sphere: { radius:50, segments:16, rings: 16 },  
Torus:  { radius:50, tube:10, radialSegments:8, tubularSegments:8, arc:Math.PI * 2 },  
TorusKnot: { radius: 50, tube:20, radialSegments:64, tubularSegments: 8, p:5, q:3, heightScale:1 },  
Plane: { width:1, height:1, segmentsWidth:1, segmentsHeight:1 },

Thus to make Sphere with 4 rings we would use:
```
a = Sphere({ rings:4 })
```

#### Properties

* _scale_ : This property can get/set the scale of the geometry on all three axis.
* _scale.x_ : Default 1. Get/set the scale of the geometry along the x-axis.
* _scale.y_ : Default 1. Get/set the scale of the geometry along the y-axis.
* _scale.z_ : Default 1. Get/set the scale of the geometry along the z-axis.  
+ _rotation_ : This property can get/set the rotation of the geometry on all three axis.
+ _rotation.x_ : Default 0. Get/set the rotation of the geometry along the x-axis.
+ _rotation.y_ : Default 0. Get/set the rotation of the geometry along the y-axis.
+ _rotation.z_ : Default 0. Get/set the rotation of the geometry along the z-axis.  
* _position_ : This property can get/set the position of the geometry on all three axis
* _position.x_ : Default 0. Get/set the position of the geometry along the x-axis
* _position.y_ : Default 0. Get/set the position of the geometry along the y-axis
* _position.z_ : Default 0. Get/set the position of the geometry along the z-axis  
* _material_ : The THREE.js material used by the geometry
* _geometry_ : The wrapped THREE.js geometry.
* _mesh_ : The THREE.js mesh.

#### Methods

* _remove_() : Removes the geometry from the 3d scene
* _update_() : This is user-defined function that is called once per frame of video. You can use it to update any property of the object (or carry out any other action) on a frame by frame basis. For example, to gradually increase the size of cube:

```
a = Cube()

a.update = function() {
  a.scale.x += .01
  if( a.scale.x > 3 ) a.scale.x = 1 
}
```
* _spin_( Float:x, Float:y, Float;z ) : This method spins the geometry an amount determined by the arguments passed to it. If a single value is passed, the geometry spins around all three axis at the same speed. If three values are passed, the geometry spins on each axis according to each particular argument. If 0 is passed the object ceases spinning.

### Canvas

The canvas object provides a 2d drawing surface for Gibber. There is only one
canvas allowed on the screen at a time (currently). The canvas object basically
wraps the 2d context of the HTML canvas tag. Any method or property that works
with the HTML canvas context should work with Gibbers canvas object.

Under the hood, the HTML canvas object is used to draw a texture which is then
rendered to a full-screen WebGL quad. This allows shaders to be used in
conjunction with 2d drawing, which is not typical of graphics programming
environments.

For a reference on the HTML canvas context methods and properties, see :  
http://blog.nihilogic.dk/2009/02/html5-canvas-cheat-sheet.html  

Gibber adds some sugar to the canvas object to make it a little more fluid to
use. These extra methods and properties are described below. You should also check out
the various 2d drawing tutorials / demos found by pressing the browse button in
the Gibber menu bar.

####Properties

* _alpha_. This is a slight shorthand for the globalAlpha property
built-in to the HTML canvas context. Not sure why they added the global prefix
but I thought it was confusing, since there is no other alpha that can be set.
* _left_. The lefthand boundary of the canvas; this is almost always 0.
* _right_. The righthand boundary of the canvas measured in pixels.
* _top_. The top of the canvas. This is almost always 0.
* _bottom_. The bottom of the canvas measured in pixels. This is equivalent to
the height of the canvas.
* _center_. Center is an object with { x,y } properties. It can be used to
easily draw a shape at the center of the canvas.
* _width_. The width of the canvas. Should always return the same value as
right.
* _height_. The height of the canvas. Should always return the same value as
bottom.
* _sprite_. The THREE.js Mesh object that the canvas textures.

####Methods

* _draw_(): A user defined method that is called once per frame. Use this to
create animations.
* _clear_(): Clears the canvas of all content.
* _fill_( CSS Color ): Fill a path with the argument color. In HTML you
typically use two steps to accomplish this: first set the fillStyle property of
the canvas object and then calling the fill method. Here we allow you to do both
in one step.
* _stroke_( CSS Color, lineWidth ): Stroke a path with a provided color and
provided lineWidth.
* _circle_( centerx, centery, radius ): Create a circle path with a provided radius
at the provided center coordinates. Call fill or stroke after calling this
method to see the results.
* _polygon_( centerx, centery, raidus, numberOfSides ): Create a polygon at the
provided center point with the provided number of sides. You must call fill or
stroke after this to see the results.
* _square_( x, y, size ): Draw a square with the provided size. The x and
y coordinates mark the top left corner; use a polygon with four sides if you
want a centered square. You must call fill or stroke after this to see results.
* _rotate_( radians ): Rotate the canvas by the provided number of radians. If
you call this method from within the canvas draw function it will only last for
the duration of that frame; otherwise it will affect all future drawing.
* _line_( x1,y1,x2,y2 ): Draw a line from one point to another. You must call
stroke after this to see the result.
* _show_(): Show the canvas.
* _hide()_: Hide the canvas.

# Sequencing
###Arp

The Arp object is an arpeggiator providing a variety of controls. See the Chords and Arpeggios tutorial for detailed information.

Example:
```javascript
a = Synth( 'bleep' )

// 1,4,6, and 7th scale degrees, 1/16 notes
// traveling up and down over 2 octaves
b = Arp( [0,3,5,6], 1/16, 'updown', 2)
b.target = a

c = Synth( 'bleep' )

// c-diminished-7 chord in the third octave, quarter notes, 
// traveling up over 4 octaves
d = Arp( 'c3dim7', 1/4, 'up', 4 )
d.target = c
```

#### Properties

* _speed_ : Float. Default value 1/4. Controls how fast the arpeggiator outputs notes.
* _pattern_ : String. Default value is 'up'. Controls the direction of notes. Possible values are 'up', 'down', 'updown' and 'updown2'. For 'updown2', the top and bottom notes of the arpeggio won't be repeated as it changes directions.
* _mult_ : Number. Default is 1. The number of octaves that the arpeggio will span.
* _notes_: A Gibber Pattern object that holds all the notes the arpeggiator sequences, as determined by the chord passed to it, the `mult` property and the arpeggiation `pattern` used. 
* _target_: The Synth that the arpeggiator will send note messages to.
 
#### Methods

* _chord_( String or Array:chordValue ): This method determines what pitches are sequenced by the arpeggiator. If you set this value to be an array, the values will be interpreted as scale degrees. If you set this to be a string, Gibber will attempt to interpret a chord, e.g. 'c4min7'. See the Chords and Arpeggios tutorial for more information on the types of chords that can be identified via strings.
* _shuffle_: A shorthand for `arp.notes.shuffle()`
* _reverse_: A shorthand for `arp.notes.reverse()`



###Pattern

Patterns are functions that output values from an internal list that is typically passed as an argument when the pattern is first created. These lists can be manipulated in various ways, influencing the output of the patterns. Alternatively, `filters` placed on the pattern (each filter is simply a function expected to return an array of values) can also change the output of the pattern dynamically, without affecting its underlying list.

Whenever you sequence any method or property in Gibber, Pattern(s) are created behind the scenes to handle sequencer output. All methods of the pattern object can be additionally sequenced; you can also sequence the `start`, `end`, and `stepSize` properties.

Example:
```javascript
a = Synth( 'bleep' )

// two patterns are created when notes are sequences. 
// The `values` pattern determines the output,
// while the `durations` pattern determines timing.

a.note.seq( [0,1,2,3], [1/4,1/8] )

a.note.values.reverse()
// a.note.values now equals [3,2,1,0]

a.note.values.scale( 2 )
// a.note.values now equals [6,4,2,0]

// You can also pass Patterns directly to sequencing calls

p = Pattern( 4,5,6,7 )
a.note.seq( p, 1/4 )

p.rotate.seq( 1,1 )
```

#### Properties

* _start_ : Int. The first index of the underlying list that will be used for output. For examples, if a pattern has values `[0,1,2]` and the `start` property is 1 then the pattern will output 1,2,1,2,1,2,1,2... skipping the 0-index item in the list.
* _end_ : Int. The last index of the underlying list that will be used for output. For examples, if a pattern has values `[0,1,2]` and the `end` property is 1 then the pattern will output 0,1,0,1,0,1... skipping the 2-index item in the list.
* _phase_ : Int. This is the next index in the underlying list that the pattern will output.
* _values_ : Array. The underlying list used by the pattern to determine output.
* _original_ : Array. A copy of the original values used to instantiate the pattern. These values can be used to restore the pattern to its original state after any transformations have been made using the `pattern.reset()` method.
* _storage_ : Array. The current permutation of a pattern can be stored at any time with a call to the `pattern.store()` method. Every stored pattern is placed in the `pattern.storage` array. The `pattern.switch` method can be used to switch between stored permutations.
* _stepSize_ : Float. Default 1. The amount that the phase is increased / decreased by each time the pattern outputs. For example, a `pattern.stepSize` of -1 means that the pattern will play in reverse. A `stepSize` of .5 means that each value in the list will be repeated before advancing to the next index.
* _integersOnly_ : Boolean. Default false. In certain cases (for example, scale degrees) we can ensure that any transformations applied to the pattern only result in integer values by setting this property to be true. For example, if a pattern has the original values of [2,3,4,5] and `pattern.scale(.5)` is applied, the values would normally then become [1,1.5,2,2.5]. By setting the value of `pattern.integersOnly` to be true, the values instead become [1,2,2,3] as the floats are rounded up.

 
#### Methods

* _reverse_: Reverse the current ordering of the pattern's `values` array.
* _range_( Array, or Int,Int ): Set both the start and end properties with a single method call. `pattern.range` can be called in two forms. In the first, both the start and the end values are passed as separate arguments. In the second, a single array is passed containing the start and the end values. This allows the range to be easily sequenced with calls to Rndi, for example: `pattern.range.seq( Rndi( 0,5,2 ), 1/2 )`. Note that if the value for start is lower than the value for end, this method will automatically switch the values.
* _set_( Array or list of values): Replace the current `pattern.values` array with new members.
* _repeat_( List of values ): Repeat certain values (not indices) in an array a certain number of times. When passing arguments, the even numbered arguments are the values you want to have repeated, while the odd values represent how many times each one should be played. For example, given the pattern [0,2,4] and the line `pattern.repeat( 0,2,4,2)` the pattern output would be 0,0,2,4,4 through one cycle (both 0 and 4 repeated ). This is particularly useful to line up odd time values; for example, if a pattern has 1/6 notes you can specify a repeat of 3 to make sure it lines up with a 1/2 note grid.
* _reset_: Return values to their original state at pattern creation.
* _store_: Push the current permutation of the pattern to the `pattern.storage` array.
* _switch_( Int ): Switch the values outputted by the pattern to a stored index in the `pattern.storage` array
* _transpose_ ( Number ): Add argument to all numerical values in the pattern. If a pattern consists of an array of chords, each member of each chord will be modified. For example [[0,2,4], [1,3,5]] transposed by 1 becomes [[1,3,5], [2,4,6]]
* _scale_ ( Number ): Multiply all numerical values in the pattern by argument. If a pattern consists of an array of chords, each member of each chord will be modified. For example [[0,2,4], [1,3,5]] scaled by 2 becomes [[0,4,8], [2,6,10]]
* _shuffle_: Randomize the order of values found in the `pattern.values` array.
* _flip_: Change the positions of pattern members so that the position of the highest member becomes the position of the lowest member, the position of the second highest becomes the position of the second lowest etc.
* _invert: Similar to the technique from serialist compositions. Assume that the zero-index member of the pattern is our axis. Flip all other pattern members to the other side of the access. Thus, a member that is two higher than the zero-index member now becomes two lower.
* _rotate_( Int ): Shift the positions of all pattern members by the argument. For example, a pattern of `[0,1,2,3]` that is rotated by 1 becomes `[3,0,1,2]`.



###Seq

The Seq object is a standalone sequencer that can schedule calls to methods and properties on a target object. Alternatively, it can be used to quickly sequence repeated calls to an anonymous function. Scheduling occurs at audio-rate and may be modulated by audio sources.

Sequencers can work in one of two ways. In the first, anonymous functions can easily be scheduled to execute repeatedly. To create a `Seq` that accomplishes this, simply pass the constructor two values: the function to be executing and an array of time values to use for scheduling. In the second mode, a JS object is passed with keys for (at minimum) `durations` and `target`. The `durations` value is an array of times that determine when the sequencer fires. The `target` value is an object that the sequencer can alter properties of and call methods on. Any additional key passed to the JS object becomes a property or method that is sequenced on the target object.

In the below example, the `b` `Seq` object uses the second mode, sequencing calls to the `note` method on the `a` ugen. The `c` `Seq` uses the first constructor type, passing an anonymous function to be executed and a timing to be used for scheduling. 

```
a = Synth( 'bleep' )

b = Seq({
  note: [0,1,2,3],
  durations: 1/4,
  target: a,
})

c = Seq( function() {
  b.rate[ 1 ] *= 2
}, 2 )
```

#### Properties

* _rate_ : A Gibber [Mul][mul] object. By default this ugen takes Gibber's master clock (stored in `seq.rate[0]` and multiplies it by 1 (stored in `seq.rate[1]`. To cut the time in half, run `seq.rate[1] *= .5`.
* _target_ : Object. When the Seq object has a target, it can be used to change properties and call methods on that `target` object.
* _durations_: Array, Function, or Number. The scheduling used by the sequencer. This is a Gibber [Pattern][pattern] object.
* _offset_: Time. A delay before the sequencer begins running. You can use this to schedule events that occur on off beats; for example, to get a note on beats two and four: `b = Seq({ note:0, durations:1/2, offset:1/4 })`
 
#### Methods

* _start_: If the sequencer is stopped, start it.
* _stop_: If the sequencer is running, stop it.
* _kill_: Remove the sequencer from the audio graph.

[mul]: javascript:Gibber.Environment.Docs.openFile('math','mul')
[pattern]: javascript:Gibber.Environment.Docs.openFile('seq','pattern')
# Interface
###Mouse

This object presents signals derived from the position of the mouse cursor in the browser window.

Example:
```javascript
a = Mono().play( Rndi(0,12), 1/4 )

a.cutoff = Mouse.X
a.resonance = Mouse.Y
```

#### Properties

* _x_ : Float. A value between 0 and 1 representing the x position of the mouse in the browser window.
* _y_ : Float. A value between 0 and 1 representing the y position of the mouse in the browser window.

#### Methods
* _on_ : Begin polling mouse position data.
* _off_ : Stop polling mouse position data.


###Slider

A vertical or horizontal slider. Sliders are a type of [Widget][widget] and inherit its methods and properties.

Example:
```javascript
a = Slider()
a.setValue( .5 )

a.isVertical = false
```

#### Properties

* _isVertical_ : Boolean. Default : true. Whether the slider is horizontal or vertical.
* _value_  : Float. Default range: { 0, 1 }. Default: 0.

#### Methods

See the [Widget][widget] prototype for relevant methods.


###Widget

Most interactive elements in Gibber (but not all) have a [Widget](javascript:Gibber.Environment.Docs.openFile("graphics", "geometry")) as their object prototype. You never create a widget directly, but other elements that you create will use its methods and properties.

#### Properties

* _background_ : CSS color. Default : '###000'. The background color for the widget. If a background color is not assigned to the widget, the widget will
use the background of its containing panel.
* _fill_  : CSS color. Default: '###999'. If a fill color is not assigned to the widget, the widget will
use the fill of its parent panel.
* _stroke_  : CSS color. Default: '###ccc'. If a stroke color is not assigned to the widget, the widget will
use the stroke of its containing panel.
* _x_ : Float. The x-coordinate for the upper-lefthand corner of the widget, expressed as a multiple of the parent panel's width. For example, a x value of .5 will place the left edge of the widget at the horizontal center of the panel.
* _y_ : Float. The y-coordinate for the upper-lefthand corner of the widget, expressed as a multiple of the parent panel's height. For example, a x value of .5 will place the top edge of the widget at the vertical center of the panel.
* _width_ : Float. The width of a widget is expressed as a percentage of the parent panel's width. For example, a widget value of .5 means the widget will be half the width of the panel.
* _height_ : Float. The height of a widget is expressed as a percentage of the parent panel's height. For example, a widget value of .5 means the widget will be half the height of the panel.
* _bounds_ : Array. A shorthand for assigning x,y,width and height simultaneously. For example, Button({ bounds:[0,0,1,1] }) creates a button that
fills the entire panel.
* _min_ : Float. Default value: 0. The minimum value the widget outputs. Note that if you use Gibber's 
automatic mapping system (such as in the example), changing this will have no effect. See the Interface Tutorial
under Browse > Miscellaneous for more information.
* _max_ : Float. Default value: 1. The maximum value the widget outputs.

#### Methods
* _onmousedown_ :  An event handler for handling mousedown events. This only works with trackpads and mice, see ontouchmousedown for a version that works with touch as well. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _onmousemove_ : Occurs whenever the mouse moves over a widget if the widget already has focus. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _onmouseup_   : Occurs whenever a user releases the mouse after it has been used to provide a particular widget focus. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchstart_ :  An event handler for handling mousedown events. This only works with trackpads and mice, see ontouchmousedown for a version that works with touch as well. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchmove_ : Occurs whenever the mouse moves over a widget if the widget already has focus. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchend_   : Occurs whenever a user releases the mouse after it has been used to provide a particular widget focus. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchmousedown_ : Function. An event handler that handles both mousedown and touchstart events. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchmousemove_ :  Event handler for both ontouchmove and onmousemove events.  An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchmouseup_   :  Event handler for both ontouchend and onmouseup events. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _\_x_ : Returns the x-position of the widget, always in pixels, as an offset from the parent panel's left edge. Note that even if relative layouts are being used, using this method will return a value in pixels. Access the property value directly to obtain the value relative to the panel's dimensions.
* _\_y_ : Returns the y-position of the widget, always in pixels, as an offset from the parent panel's top edge. See \_x() for more information.
* _\_width_ : Returns the width of the widget in pixels.
* _\_height_ : Returns the width of the widget in pixels.
* _setValue_ : Change the current value displayed by the widget.

###Button

A button with variable modes. Buttons are a type of [Widget][widget] and inherit its methods and properties.

Example:
```javascript
a = Button()
a.setValue( 1 )

a = Button({ mode:'momentary' })
```

#### Properties

* _mode_ : String. Default : 'toggle'. The three modes for buttons are:
  * __toggle__ - Pressing the button once outputs its max value, pressing it again outputs its min
  * __momentary__ - Pressing the button outputs its max value, releasing it sets it outputs its min
  * __contact__ - Pressing the button sends outputs its max value; its min value is never outputted
* _value_  : Float. Default range: { 0, 1 }. Default: 0.

#### Methods

See the [Widget][widget] prototype for relevant methods.

[widget]: javascript:jump('interface-widget')
###Knob

A virtual knob with a couple of different interaction modalities. Knobs are a type of [Widget][widget] and inherit its methods and properties.

Example:
```javascript
a = Knob({ centerZero: true })

b = Knob({ usesRotation:true })
```

#### Properties

* _centerZero_ : Boolean. Default : false. When true the knob functions like a pan knob typically found on an audio mixer, where the zero value is at the 12 o'clock position and the knob can be turned to the right or left. The graphics show the offset from the knobs 0 value.
* _useRotation_  : Boolean. Default : false. When true, the knob changes values as users drag around its perimeter. When false, the knob changes value based on vertical user movements.

#### Methods

See the [Widget][widget] prototype for relevant methods.


###Crossfader

A horizontal crossfader. Crossfader are a type of [Widget][widget] and inherit its methods and properties.

Example:
```javascript
// crossfade between two drum loops

loop1 = Drums( 'x*o*x*o-' )
loop2 = Drums( 'x*ox*xo-' ).pitch( 2 )

// map amplitudes of both loops to crossfader
loop1.amp = loop2.amp = Crossfader()

// invert mapping on one loop
loop2.Amp.invert()
```

#### Properties
See the [Widget][widget] prototype for many other relevant properties.

* _value_  : Float. Default range: { 0, 1 }. Default: 0.

#### Methods
See the [Widget][widget] prototype for relevant methods.


###XY
A multitouch XY controller with optional built-in physics. The XY widget acts as an
array of children, each one representing a X and a Y position. Thus to access the X
property of the first child (using a zero-index array), we use my\_xy\_widget[0].x.

Example:
```javascript
// map pitch and amplitude of two sine waves to XY control.

xy = XY({ numChildren:2 })
sine1 = Sine( xy[ 0 ].X, xy[ 0 ].Y )
sine2 = Sine( xy[ 1 ].X, xy[ 1 ].Y )
```

#### Properties
See the [Widget][widget] prototype for many other relevant properties.

* _value_  : Float. Default range: { 0, 1 }. Default: 0.

* _childWidth_ : Float. The size of the children, currently in pixels. TODO: use relative values when the panel is using relative sizes and positions.

* _usePhysics_ : Boolean. Default false. Whether or not the physics engine should be turned on.

* _friction_ : Float. Default .9. The amount of friction in the physics system. High values mean children will decelerate quicker.

* _maxVelocity_ Float. Default 10. The maximum velocity for each child.

* _detectCollisions_ : Boolean. Default false. When false, children bounce off one another.

#### Methods
See the [Widget][widget] prototype for relevant methods.

###Keyboard

A piano-style keyboard that is a collection of buttons. Keyboard is a type of [Widget][widget] and inherits its methods and properties.

Example:
```javascript
fm = FM( 'brass' )
keys = Keyboard({ startoctave:4, endoctave:5 })

keys.target = fm
```

#### Properties
See the [Widget][widget] prototype for many other relevant properties.

* _target_  : Ugen. When assigned, the keyboard will send noteon / off messages to its target ugen.
* _startoctave_ : Int, constructor property only. Determines the starting octave of the keyboard's range. TODO: make dynamic.
* _endoctave_ : Int, constructor property only. Determines the ending octave of the keyboard's range. TODO: make dynamic.

#### Methods

See the [Widget][widget] prototype for relevant methods.


###Accelerometer
When used with sketches running on mobile devices, this widget will use the acceleration of the device as a signal.

Example:
```javascript
// map pitch and amplitude of two sine waves to XY control.

pwm = PWM()
a = Accelerometer()
pwm.frequency = a.X
pwm.amp = a.Y
pwm.pulsewidth = a.Z

```

#### Properties
See the [Widget][widget] prototype for many other relevant properties.

* _x_  : Float. Acceleration of the device along the x-axis.
* _y_  : Float. Acceleration of the device along the y-axis.
* _z_  : Float. Acceleration of the device along the z-axis.

#### Methods
* _start_ : Begin querying sensors for acceleration data. Note: this is called automatically when Accelerometer is used with Gibber's
mapping abstractions.

* _stop_ : End querying sensors for acceleration data.

See the [Widget][widget] prototype for relevant methods.

###Orientation
When used in sketches running on mobile devices, this widget will use the orientation of the device as a signal.

Example:
```javascript
pwm = PWM()
o = Orientation()

pwm.frequency = o.X
pwm.amp = o.Y
pwm.pulsewidth = o.Z

```

#### Properties
* _x_  : Float. Rotation of the device along the x-axis.
* _y_  : Float. Rotation of the device along the y-axis.
* _z_  : Float. Rotation of the device along the z-axis.

#### Methods
* _start_ : Begin querying sensors for orientation data. Note: this is called automatically when Orientation is used with Gibber's
mapping abstractions.

* _stop_ : End querying sensors for orientation data.

See the [Widget][widget] prototype for relevant methods.


###Patchbay

A simple widget for establishing virtual connections. After creating connections via drag and drop,
users can delete them by clicking on the connection and hitting delete. TODO: how to delete for touch devices?

Example:
```javascript
a = Mono()
b = Drums('xoxo')

c = Patchbay( a.Cutoff, a.Resonance, b.Pitch, b.Amp, b.Out )
```

In the above example, connecting the patch point for b.Out to the patch point for a.Cutoff would be the equivalent
of executing the following line of code:

```
a.cutoff = b.Out
```

#### Properties
* _connections_ : Array. A list of connections that have been established.

#### Methods
* _onconnection_ : Function( start, end ). The two objects that have been connected.
* _ondisconnection_ : Function( start, end ). The two objects that are no longer connected.


# Singletons
###Gibber.Clock

The clock controls Gibber's master tempo and meter.

Example:
```javascript
drums = EDrums('x*o*x*o-')

// half tempo
Clock.rate = .5

// gradually speed up to original tempo
Clock.rate = Line( .5,1,8 )

// change time signature
Clock.timeSignature = '3/4'
```

#### Properties

* _maxMeasures_ : Float. Default value is 44. When using any indicator of time in Gibber, a number below this value is measured in terms of measures; higher numbers are measured in samples. For example, if Gibber.Clock.maxMeasures is 20 and the attack parameter of a synth is set to 2, that synth will have a two measure attack. If it's set to 50 it will have a 50 sample attack.
* _rate_ : Float. Default value 1. Controls the rate at which time advances. Doubling this value means all events occur twice as quickly. All sequencers in Gibber use this value as a base point for determining their individual rates, hence, changing this will affect all sequencers relative to their individual `rate` property values.
* _timeSignature_ : String. Use this to change Gibber's time signature, which defaults to `4/4`. 
 
#### Methods

* _time_( Float:timeValue ): This method returns a duration measured in sampled. If the arguments is less than `Gibber.Clock.maxMeasures`, it returns the argument * the number of samples per measure. If the argument is greater, it simply returns the argument.
* _Time_( Float:timeValue ): Returns a function that returns a time value using the provided argument. This is primarily used in sequencing. 
* _beat_( Float:timeValue ): Returns the argument number of beats as a duration measured in samples.
* _Beat_( Float:timeValue ): Returns a function returning the argument number of beats as a duration measured in samples.
###Gibber

The main object of the library. 

Example:
```javascript
Gibber.init({ globalize: false })

sine = Gibber.Oscillators.Sine()

// half speed
Gibber.Clock.rate = .5
```

#### Properties

* _Clock_ : Object. Controls time and meter. See Gibber.Clock for details.
* _Audio_ : Object. The main synthesis library for Gibber is named *Gibberish*; this property wraps that library.
* _Master_ : Object. The master output bus for Gibber. Any FX placed on this bus will affect all sound coming out of Gibber. See the Bus reference for more detail.
* _Scale_ : Object. This determines the default root and mode used by Gibber's synthesis objects when sequencing. It can be overridden on individual ugen's by assigning them their own unique scale objects. See the Scale reference for details.
 
#### Methods

* _clear_(): This method removes all unit generators from the audio graph. It also resets the tempo to 120 BPM and the amplitude of the Master bus to 1.
* _log_( String: msg ): Print a message to Gibber's console.
* _init_( Object: options ): Start Gibber. The most important option is `globalize`. When `globalize` is set to false (as in the example at the top of this page) the constructors for Gibber's unit generators will not be placed in the global namespace. The default value for globalize is `true`.
