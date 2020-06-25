# Gibber

# Prototypes
## Audio
ugen
----
The ugen prototype contains the base behavior for connecting / disconnecting audio processes from each other.


#### Methods ####
### ugen.connect(  *target?* ) ###
**target** *ugen* (optional) - The target ugen to connect to. If this argument is undefined, a connection will be made to Gibber's main bus.

### ugen.disconnect(  *target?* ) ###
**target** *ugen* (optional) - The target ugen to disconnect from. If this argument is undefined, all connections will be disconnected.

instrument
----
*Prototype: [ugen](#prototypes-ugen)*



#### Methods ####
### instrument.note(  *scaleIndex* ) ###
**scaleIndex** *int* (required) - The arguent scale index is converted to Hz according to the currently selected tuning and mode.

### instrument.trigger(  *loudness* ) ###
**loudness** *float* (required) - This sets the loudness for a single triggering of the instrument. You can also directly set the overall loudness of the instrument using the `.loudness` property, or scale the overall signal using `.gain`.

effect
----
*Prototype: [ugen](#prototypes-ugen)*



#### Properties ####
### effect.input ###
*ugen* default: 0.  The input property provides the signal to be processed. This is automatically set when adding the effect to an effect chain on an instrument, or when calling instrument.connect( effect ).
## Graphics
operation
----
The majority of 3D objects in gibber include methods found in this prototype.


#### Methods ####
### operation.translate(  *x*,  *y?*,  *z?* ) ###
**x** *float* (required) - Translation on the X axis. If the x argument is the only one provided, it will also be applied to the Y and Z axes.

**y** *float* (optional) - Translation on the Y axis.

**z** *float* (optional) - Translation on the Z axis.

### operation.rotate(  *angle*,  *x?*,  *y?*,  *z?* ) ###
**angle** *float* (required) - The ammount of rotation to be applied along the argument axis, measured in degrees.

**x** *float* (optional) - X component of rotation axis. If no axis is passed to this function the operation will rotate around the last defined axis.

**y** *float* (optional) - Y component of rotation axis. If no axis is passed to this function the operation will rotate around the last defined axis.

**z** *float* (optional) - Z component of rotation axis. If no axis is passed to this function the operation will rotate around the last defined axis.

### operation.scale(  *x*,  *y?*,  *z?* ) ###
**x** *float* (required) - Scale on the X axis. If the x argument is the only one provided, it will also be applied to the Y and Z axes.

**y** *float* (optional) - Scale on the Y axis.

**z** *float* (optional) - Scale on the Z axis.

### operation.render(  *quality?*,  *shouldAnimate?* ) ###
**quality** *int* (optional) - The quality of the rendering performed, measured from 1–10. Numbers above 2 or 3 should only be used with simple scenes and/or high-powered graphics cards (GPUs).

**shouldAnimate** *boolean* (optional) - Controls whether or not the geometry is rendered on a per-frame basis (true) or is only rendered a single time (false).

geometry
----
*Prototype: [operation](#prototypes-operation)*

Any 3D geometry in gibber includes methods from this prototype.


#### Methods ####
### geometry.material(  *initializer*,  *modifiers?* ) ###
**initializer** *presetName|material* (required) - This is an overloaded argument that can either be an existing material object or the name of a material preset

**modifiers** *object* (optional) - This optzonal object contains key/value pairs that modify the preset/material passed as the first argument.

### geometry.texture(  *initializer*,  *modifiers?* ) ###
**initializer** *presetName|texture* (required) - This is an overloaded argument that can either be an existing texture object or the name of a texture preset

**modifiers** *object* (optional) - This optional object contains key/value pairs that modify the preset/texture passed as the first argument.


# Instruments
FM
----
*Prototype: [instrument](#prototypes-instrument)*

The FM object pairs two oscillators (with one modulating the frequency of the other) with an envelope and a filter. The envelope controls the amplitude of the modulator (also known as the modulation index) , the overall gain of the synth (volume), and the cutoff frequency of the filter, making its sound perceptually brighter when the envelope is fully open. The synth's envelope also controls the amount that the modulator's output affects its own frequency (feedback).


#### Properties ####
### FM.cmRatio ###
*number(sequencable)* default: 2, range: 0.01-20.  This controls the ratio between the carrier and modulation frequencies. When a note is trigger on this synth the frequency is assigned to the carrier oscillator; the frequency is then multiplied by this property and assigned ot the modulator.
### FM.index ###
*number(sequencable)* default: 5, range: 0.01-20.  This property value, multiplied by the frequency of the carrier oscillator, determines the amplitude of the modulating oscillator.
### FM.feedback ###
*number(sequencable)* default: 0, range: 0-1.  The modulating oscillator can direct its output to modulate its own frequency, resulting in chaotic and noisy sounds.
### FM.carrierWaveform ###
*string* default: saw.  Controls the waveform of the carrier oscillator. Options include 'saw', 'triangle', 'pwm', 'sine', and 'square'.
### FM.modulatorWaveform ###
*string* default: saw.  Controls the waveform of the carrier oscillator. Options include 'saw', 'triangle', 'pwm', 'sine', and 'square'.
### FM.antialias ###
*boolean* default: true.  When set to true, the synth's oscillators will use higher-quality (but more CPU expensive) anti-aliasing oscillators.
### FM.frequency ###
*number(sequencable)* default: 220, range: 40-8000.  This is the frequency that will be used when the .trigger() method is called, or if you call .note() and pass no argument. Calls to .note() (assuming you pass an argument) will set the value of this property.
### FM.loudness ###
*number(sequencable)* default: 1, range: 0-1.  Loudness linearly controls the output of the signal. In addition, in the FM instrument it also affects the cutoff frequency of the instrument's filter (assuming a filter is active), the amplitude of the modulator, and the amount of feedback applied to the modulator. All these effects correspond to much more complex timbres as the instrument gets louder.
### FM.attack ###
*duration*  The attack property controls the duration it takes for the synth to reach full volume after triggering. The duration is written in measures. A value of 1/4 means one quarter of a measure, a value of 1 means 1 measure.
### FM.decay ###
*duration*  The decay property controls the length of time it takes for the synth to decay to silence after reaching full volume during its attack phase. The duration is written in measures e.g. a value of 1/4 means one quarter of a measure, a value of 1 means 1 measure.
### FM.sustain ###
*duration*  The sustain property controls the length of time the synths envelope stays at steady state after the attack and decay of the envelope have completed. The duration is written in measures e.g. a value of 1/4 means one quarter of a measure, a value of 1 means 1 measure.
### FM.release ###
*duration*  The release determines the amount of time the envelope takes to fade to zero after the sustain portion is complete. The duration is written in measures e.g. a value of 1/4 means one quarter of a measure, a value of 1 means 1 measurei.
### FM.shape ###
*string* default: linear.  Controls the shape of the synth's envelope stages. Choosee between 'linear' and 'exponential'.
### FM.useADSR ###
*boolean* default: false.  When false, the synth uses a two-stage envelope where durations are determined by the attack and decay properties. When true, the synth uses a four-stage envelope.
### FM.cutoff ###
*number__sequencable* default: 0.5, range: 0-1.  The cutoff property provides a base for determining the cutoff frequency of the filter. The frequency is additionally affected by the envelope of the synth, multiplied by the filterMult property.
### FM.Q ###
*number__sequencable*  The Q property (also commonly known as resonance) determines the sharpness of the filter. This is canonically accompanied by a boost around the cutoff frequency; if the Q property is high enough this boost can turn into self-oscillation.
### FM.filterMult ###
*number__sequencable* default: 2, range: 0-10.  The filterMult property determines how much the cutoff frequency is affected by each synth's envelope. The default value of 2 means that a cutoff frequency would move between .25 and .5 over the course of the envelope.
### FM.filterType ###
*number* default: 1.  The filterType property determines what filter modeling algorithm is used. 0 means no filter is applied to the synth, 1 uses a Moog Ladder Filter, 2 uses  a TB303-style diode filter, 3 uses a state variable filter, and 4 uses a biquad filter design.
### FM.filterMode ###
*number* default: 0.  The filterMode property determines the type of filtering employed, however, some filter types do not support highpass or bandpass filtering. 0 = lowpass, 1 = highpass, 2 = bandpass.
### FM.saturation ###
*number__sequencable* default: 0.5, range: 0.5-20.  Saturation is a waveshaping distortion that is part of the TB303 diode filter model (filterType 2). This property will have no effect for any other value of filterType.
### FM.gain ###
*number(sequencable)* default: 0.5, range: 0-1.  This linearly controls the overall output (sometimes known as volume) of the instrument.
### FM.panVoices ###
*boolean* default: true.  When set to true the instrument can be panned through the stereo sound image, adding a slight amount of computational expense.
### FM.pan ###
*number__sequencable* default: 0.5, range: 0-1.  Controls the position of the sound between the left / right speakers or headphones. A value of 0 means the sound is panned to the left, a value of 1 meanns the sound is panned to the right, while .5 is centered.
### FM.glide ###
*number(sequencable)* default: 1, range: 1-4000.  The glide property controls a single-pole lowpass filter on the frequency, causing notes to slide from one to the next (portamento). The filter equation is: y (n) = y (n-1) + ((x (n) - y (n-1))/glide). A value of 1 generates no glide, a value of 1500 generates a substantial glide.
Pluck
----
*Prototype: [instrument](#prototypes-instrument)*

A physically modeled string instrument, using the Karplus-Strong model.


#### Properties ####
### Pluck.blend ###
*number(sequencable)* default: 1, range: 0-1.  A feature of the model used for this instrument is that it is easy to randomly add noise to the signal. Values slightly less than 1 will produce notes that sound almost errant, while values closer to .5 will produce bursts of noise and can be a useful percussive texture.
### Pluck.decay ###
*number(sequencable)* default: 0.97, range: 0-1.  Controls the time it takes for each note to fade to silence.
### Pluck.damping ###
*number(sequencable)* default: 0.2, range: 0-1.  Controls the amount of high frequency damping, or brightness, of the sound.
### Pluck.frequency ###
*number(sequencable)* default: 220, range: 40-8000.  This is the frequency that will be used when the .trigger() method is called, or if you call .note() and pass no argument. Calls to .note() (assuming you pass an argument) will set the value of this property.
### Pluck.loudness ###
*number(sequencable)* default: 1, range: 0-1.  Loudness linearly controls the output of the signal. In this instrument, there is no difference between loudness and gain.
### Pluck.gain ###
*number(sequencable)* default: 0.5, range: 0-1.  This linearly controls the overall output (sometimes known as volume) of the instrument.
### Pluck.panVoices ###
*boolean* default: true.  When set to true the instrument can be panned through the stereo sound image, adding a slight amount of computational expense.
### Pluck.pan ###
*number__sequencable* default: 0.5, range: 0-1.  Controls the position of the sound between the left / right speakers or headphones. A value of 0 means the sound is panned to the left, a value of 1 meanns the sound is panned to the right, while .5 is centered.
### Pluck.glide ###
*number(sequencable)* default: 1, range: 1-4000.  The glide property controls a single-pole lowpass filter on the frequency, causing notes to slide from one to the next (portamento). The filter equation is: y (n) = y (n-1) + ((x (n) - y (n-1))/glide). A value of 1 generates no glide, a value of 1500 generates a substantial glide.
Monosynth
----
*Prototype: [instrument](#prototypes-instrument)*

The Monosynth object pairs three oscillators, an envelope, and a filter. The envelope controls both the gain of the synth (volume) and the cutoff frequency of the filter, make it's sound brighter when the envelope is fully open. Oscillators can be detuned from each other creating a fuller sound than a single oscillator alone.


#### Properties ####
### Monosynth.antialias ###
*boolean* default: true.  When set to true, the synth's oscillators will use higher-quality (but more CPU expensive) anti-aliasing oscillators.
### Monosynth.detune2 ###
*number(sequencable)* default: 0.005, range: -1-1.  The frequency for oscillator #2 will be determined by taking the value of the .frequency property (which controls the frequency of oscillator #1) and offsetting it by the the value of this property multiplied by the base frequency. So, if the base .frqeuency property was 1000 Hz, oscillator #2 would run at a frequency of 1005 Hz using the default value of .005
### Monosynth.detune3 ###
*number(sequencable)* default: -0.005, range: -1-1.  The frequency for oscillator #3 will be determined by taking the value of the .frequency property (which controls the frequency of oscillator #1) and offsetting it by the the value of this property multiplied by the base frequency. So, if the base .frqeuency property was 1000 Hz, oscillator #2 would run at a frequency of 1005 Hz using the default value of .005
### Monosynth.frequency ###
*number(sequencable)* default: 220, range: 40-8000.  This is the frequency that will be used when the .trigger() method is called, or if you call .note() and pass no argument. Calls to .note() (assuming you pass an argument) will set the value of this property.
### Monosynth.loudness ###
*number(sequencable)* default: 1, range: 0-1.  Loudness linearly controls the output of the signal. In addition, in the Synth instrument it also affects the cutoff frequency of the instrument's filter (assuming a filter is active), so that louder sounds also sound brighter.
### Monosynth.waveform ###
*string* default: saw.  The waveform used by the synth's oscillator. Options include 'saw','sine','triangle','square', and 'pwm'.
### Monosynth.attack ###
*duration*  The attack property controls the duration it takes for the synth to reach full volume after triggering. The duration is written in measures. A value of 1/4 means one quarter of a measure, a value of 1 means 1 measure.
### Monosynth.decay ###
*duration*  The decay property controls the length of time it takes for the synth to decay to silence after reaching full volume during its attack phase. The duration is written in measures e.g. a value of 1/4 means one quarter of a measure, a value of 1 means 1 measure.
### Monosynth.sustain ###
*duration*  The sustain property controls the length of time the synths envelope stays at steady state after the attack and decay of the envelope have completed. The duration is written in measures e.g. a value of 1/4 means one quarter of a measure, a value of 1 means 1 measure.
### Monosynth.release ###
*duration*  The release determines the amount of time the envelope takes to fade to zero after the sustain portion is complete. The duration is written in measures e.g. a value of 1/4 means one quarter of a measure, a value of 1 means 1 measurei.
### Monosynth.shape ###
*string* default: linear.  Controls the shape of the synth's envelope stages. Choosee between 'linear' and 'exponential'.
### Monosynth.useADSR ###
*boolean* default: false.  When false, the synth uses a two-stage envelope where durations are determined by the attack and decay properties. When true, the synth uses a four-stage envelope.
### Monosynth.cutoff ###
*number__sequencable* default: 0.5, range: 0-1.  The cutoff property provides a base for determining the cutoff frequency of the filter. The frequency is additionally affected by the envelope of the synth, multiplied by the filterMult property.
### Monosynth.Q ###
*number__sequencable*  The Q property (also commonly known as resonance) determines the sharpness of the filter. This is canonically accompanied by a boost around the cutoff frequency; if the Q property is high enough this boost can turn into self-oscillation.
### Monosynth.filterMult ###
*number__sequencable* default: 2, range: 0-10.  The filterMult property determines how much the cutoff frequency is affected by each synth's envelope. The default value of 2 means that a cutoff frequency would move between .25 and .5 over the course of the envelope.
### Monosynth.filterType ###
*number* default: 1.  The filterType property determines what filter modeling algorithm is used. 0 means no filter is applied to the synth, 1 uses a Moog Ladder Filter, 2 uses  a TB303-style diode filter, 3 uses a state variable filter, and 4 uses a biquad filter design.
### Monosynth.filterMode ###
*number* default: 0.  The filterMode property determines the type of filtering employed, however, some filter types do not support highpass or bandpass filtering. 0 = lowpass, 1 = highpass, 2 = bandpass.
### Monosynth.saturation ###
*number__sequencable* default: 0.5, range: 0.5-20.  Saturation is a waveshaping distortion that is part of the TB303 diode filter model (filterType 2). This property will have no effect for any other value of filterType.
### Monosynth.gain ###
*number(sequencable)* default: 0.5, range: 0-1.  This linearly controls the overall output (sometimes known as volume) of the instrument.
### Monosynth.panVoices ###
*boolean* default: true.  When set to true the instrument can be panned through the stereo sound image, adding a slight amount of computational expense.
### Monosynth.pan ###
*number__sequencable* default: 0.5, range: 0-1.  Controls the position of the sound between the left / right speakers or headphones. A value of 0 means the sound is panned to the left, a value of 1 meanns the sound is panned to the right, while .5 is centered.
### Monosynth.glide ###
*number(sequencable)* default: 1, range: 1-4000.  The glide property controls a single-pole lowpass filter on the frequency, causing notes to slide from one to the next (portamento). The filter equation is: y (n) = y (n-1) + ((x (n) - y (n-1))/glide). A value of 1 generates no glide, a value of 1500 generates a substantial glide.
Synth
----
*Prototype: [instrument](#prototypes-instrument)*

The Synth object pairs a single oscillator, an envelope, and a filter. The envelope controls both the gain of the synth (volume) and the cutoff frequency of the filter, making its sound brighter when the envelope is fully open.


#### Properties ####
### Synth.antialias ###
*boolean* default: true.  When set to true, the synth's oscillators will use higher-quality (but more CPU expensive) anti-aliasing oscillators.
### Synth.frequency ###
*float* default: 220, range: 40-8000.  This is the frequency that will be used when the .trigger() method is called, or if you call .note() and pass no argument. Calls to .note() (assuming you pass an argument) will set the value of this property.
### Synth.loudness ###
*float* default: 1, range: 0-1.  Loudness linearly controls the output of the signal. In addition, in the Synth instrument it also affects the cutoff frequency of the instrument's filter (assuming a filter is active), so that louder sounds also sound brighter.
### Synth.waveform ###
*string* default: saw.  The waveform used by the synth's oscillator. Options include 'saw','sine','triangle','square', and 'pwm'.
### Synth.attack ###
*duration*  The attack property controls the duration it takes for the synth to reach full volume after triggering. The duration is written in measures. A value of 1/4 means one quarter of a measure, a value of 1 means 1 measure.
### Synth.decay ###
*duration*  The decay property controls the length of time it takes for the synth to decay to silence after reaching full volume during its attack phase. The duration is written in measures e.g. a value of 1/4 means one quarter of a measure, a value of 1 means 1 measure.
### Synth.sustain ###
*duration*  The sustain property controls the length of time the synths envelope stays at steady state after the attack and decay of the envelope have completed. The duration is written in measures e.g. a value of 1/4 means one quarter of a measure, a value of 1 means 1 measure.
### Synth.release ###
*duration*  The release determines the amount of time the envelope takes to fade to zero after the sustain portion is complete. The duration is written in measures e.g. a value of 1/4 means one quarter of a measure, a value of 1 means 1 measurei.
### Synth.shape ###
*string* default: linear.  Controls the shape of the synth's envelope stages. Choosee between 'linear' and 'exponential'.
### Synth.useADSR ###
*boolean* default: false.  When false, the synth uses a two-stage envelope where durations are determined by the attack and decay properties. When true, the synth uses a four-stage envelope.
### Synth.cutoff ###
*number__sequencable* default: 0.5, range: 0-1.  The cutoff property provides a base for determining the cutoff frequency of the filter. The frequency is additionally affected by the envelope of the synth, multiplied by the filterMult property.
### Synth.Q ###
*number__sequencable*  The Q property (also commonly known as resonance) determines the sharpness of the filter. This is canonically accompanied by a boost around the cutoff frequency; if the Q property is high enough this boost can turn into self-oscillation.
### Synth.filterMult ###
*number__sequencable* default: 2, range: 0-10.  The filterMult property determines how much the cutoff frequency is affected by each synth's envelope. The default value of 2 means that a cutoff frequency would move between .25 and .5 over the course of the envelope.
### Synth.filterType ###
*number* default: 1.  The filterType property determines what filter modeling algorithm is used. 0 means no filter is applied to the synth, 1 uses a Moog Ladder Filter, 2 uses  a TB303-style diode filter, 3 uses a state variable filter, and 4 uses a biquad filter design.
### Synth.filterMode ###
*number* default: 0.  The filterMode property determines the type of filtering employed, however, some filter types do not support highpass or bandpass filtering. 0 = lowpass, 1 = highpass, 2 = bandpass.
### Synth.saturation ###
*number__sequencable* default: 0.5, range: 0.5-20.  Saturation is a waveshaping distortion that is part of the TB303 diode filter model (filterType 2). This property will have no effect for any other value of filterType.
### Synth.gain ###
*number(sequencable)* default: 0.5, range: 0-1.  This linearly controls the overall output (sometimes known as volume) of the instrument.
### Synth.panVoices ###
*boolean* default: true.  When set to true the instrument can be panned through the stereo sound image, adding a slight amount of computational expense.
### Synth.pan ###
*number__sequencable* default: 0.5, range: 0-1.  Controls the position of the sound between the left / right speakers or headphones. A value of 0 means the sound is panned to the left, a value of 1 meanns the sound is panned to the right, while .5 is centered.
### Synth.glide ###
*number(sequencable)* default: 1, range: 1-4000.  The glide property controls a single-pole lowpass filter on the frequency, causing notes to slide from one to the next (portamento). The filter equation is: y (n) = y (n-1) + ((x (n) - y (n-1))/glide). A value of 1 generates no glide, a value of 1500 generates a substantial glide.
Clap
----
*Prototype: [instrument](#prototypes-instrument)*

The Clap instrument poorly emulates the clap found on the Roland TR-808 drum machine, with three enveloped and filtered noise bursts slightly offset from each other in time. Currently it doesn't really sound that close to a TR-808... but it still sounds nice.


#### Properties ####
### Clap.decay ###
*float* default: 0.2, range: 0-1.  Controls the length of each clap.
### Clap.loudness ###
*float* default: 1, range: 0-1.  Loudness linearly controls the overall volume. For this instrument, it's really no different from the gain property.
### Clap.spacing ###
*float* default: 100, range: 1-1000.  The spacing, in Hz, between each noise envelope.
### Clap.gain ###
*number(sequencable)* default: 0.5, range: 0-1.  This linearly controls the overall output (sometimes known as volume) of the instrument.
Cowbell
----
*Prototype: [instrument](#prototypes-instrument)*

The Cowbell instrument emulates the iconic cowbell found on the Roland TR-808 drum machine, with two enveloped and filtered square waves.


#### Properties ####
### Cowbell.decay ###
*float* default: 0.5, range: 0.001-1.  Controls the length of each cowbell hit.
### Cowbell.loudness ###
*float* default: 1, range: 0-1.  Loudness linearly controls the overall volume. For this instrument, it's really no different from the gain property.
### Cowbell.gain ###
*number(sequencable)* default: 0.5, range: 0-1.  This linearly controls the overall output (sometimes known as volume) of the instrument.
Kick
----
*Prototype: [instrument](#prototypes-instrument)*

The Kick unit generator emulates the kick sound found on the Roland TR-808 drum machine, a classic in hip-hop. It consists of an impulse feeding resonant bandpass and hipass filters scaled by an exponential decay.


#### Properties ####
### Kick.decay ###
*float* default: 0.9, range: 0.001-1.  Controls the length of each kick drum. Very high values (~.975 and above) result in long, booming sub-bass sounds.
### Kick.frequency ###
*number(sequencable)* default: 85, range: 40-500.  This is the frequency that will be used when the .trigger() method is called, or if you call .note() and pass no argument. Calls to .note() (assuming you pass an argument) will set the value of this property.
### Kick.loudness ###
*float* default: 1, range: 0-1.  Loudness linearly controls the signal pre-filter.
### Kick.tone ###
*float* default: 0.25, range: 0-1.  Controls the amount of a high-frequency click at the start of each kick.
### Kick.gain ###
*number(sequencable)* default: 0.5, range: 0-1.  This linearly controls the overall output (sometimes known as volume) of the instrument.
Snare
----
*Prototype: [instrument](#prototypes-instrument)*

The Snare instrument emulates the snare found on the Roland TR-808 drum machine. It consists of an two resonant bandpass filters mixed with high-passed noise, all scaled by an exponential decay.


#### Properties ####
### Snare.tune ###
*float*  default: 0, range -4–4. The pitch of the snare drum.
### Snare.decay ###
*float* default: 0.1, range: 0-1.  Controls the length of each snare drum hit.
### Snare.snappy ###
*float* default: 1, range: 0-1.  Controls the amount of high-frequency noise in the instrument sound
### Snare.loudness ###
*float* default: 1, range: 0-1.  Loudness linearly controls the output of signal, and also affects the ratio of tuned sound to noise. Higher values will result in more noise in the overall signal, making it perceptually brighter.
### Snare.gain ###
*number(sequencable)* default: 0.5, range: 0-1.  This linearly controls the overall output (sometimes known as volume) of the instrument.
Hat
----
*Prototype: [instrument](#prototypes-instrument)*

The Hat instrument emulates the hihat found on the Roland TR-808 drum machine. It consists of six tuned square waves feeding bandpass and highpass filters scaled by an exponential decay.


#### Properties ####
### Hat.tune ###
*float* default: 0.6, range: 0-0.8.  Controls the tuning of the oscillators in the hihat.
### Hat.decay ###
*float* default: 0.1, range: 0-1.  Controls the length of each hihat hit.
### Hat.loudness ###
*float* default: 1, range: 0-1.  Loudness linearly controls the overall volume. For this instrument, it's really no different from the gain property.
### Hat.gain ###
*number(sequencable)* default: 0.5, range: 0-1.  This linearly controls the overall output (sometimes known as volume) of the instrument.
Drums
----
*Prototype: [instrument](#prototypes-instrument)*

The Drums object is four samplers grouped together into a single output. You can sequence the different samplers by referring to them with the kd (kick drum), sd (snare drum), ch (closed hat), and oh (open hat) shorthands. You can also access each sampler individually to change gain, panning, pitch, and other properties.


#### Properties ####
### Drums.rate ###
*float* default: 1, range: -100-100.  Global control of each sampler's playback rate.
### Drums.start ###
*float* default: 0, range: 0-1.  Global control of the each sampler's starting position.
### Drums.end ###
*float* default: 0, range: 0-1.  Global control of the each sampler's end position.
### Drums.kick ###
*sampler*  Sampler that is loaded with a kick drum sample.
### Drums.snare ###
*sampler*  Sampler that is loaded with a snare drum sample.
### Drums.closedHat ###
*sampler*  Sampler that is loaded with a closed hihat sample.
### Drums.openHat ###
*sampler*  Sampler that is loaded with a open hihat sample.
### Drums.loudness ###
*float* default: 1, range: 0-1.  Loudness linearly controls the output of signal, and also affects the ratio of tuned sound to noise. Higher values will result in more noise in the overall signal, making it perceptually brighter.
### Drums.pan ###
*number__sequencable* default: 0.5, range: 0-1.  Controls the position of the drus between the left / right speakers or headphones. A value of 0 means the sound is panned to the left, a value of 1 meanns the sound is panned to the right, while .5 is centered.
### Drums.gain ###
*number(sequencable)* default: 0.5, range: 0-1.  This linearly controls the overall output (sometimes known as volume) of the instrument.
EDrums
----
*Prototype: [instrument](#prototypes-instrument)*

The EDrums object is many of the synthetic drums sounds inspired by the 808 grouped together into a single output. You can sequence the different instruments by referring to them with the kd (kick drum), sd (snare drum), ch (closed hat), cp (clap), cb (cowbell), and oh (open hat) shorthands. You can also access each instrument individually to change gain, panning, and other properties.


#### Properties ####
### EDrums.kick ###
*kick*  Kick instrument.
### EDrums.snare ###
*snare*  Snare instrument.
### EDrums.closedHat ###
*hat*  Hat instrument with short decay time.
### EDrums.openHat ###
*hat*  Hat instrument with longer decay time.
### EDrums.clap ###
*clap*  Clap instrument.
### EDrums.cowbell ###
*cowbell*  Cowbell instrument.
### EDrums.pan ###
*number__sequencable* default: 0.5, range: 0-1.  Controls the position of the drus between the left / right speakers or headphones. A value of 0 means the sound is panned to the left, a value of 1 meanns the sound is panned to the right, while .5 is centered.
### EDrums.gain ###
*number(sequencable)* default: 0.5, range: 0-1.  This linearly controls the overall output (sometimes known as volume) of the instrument.

# Audio Effects
BitCrusher
----
*Prototype: [effect](#prototypes-effect)*

A sample-rate / bit-rate reduction effect.


#### Properties ####
### BitCrusher.bitDepth ###
*float* default: 0.5, range: 0.01-1.  This controls the number of bits in each processed sample. A value of 1 corresponds to 16-bits.
### BitCrusher.sampleRate ###
*float* default: 0.5, range: 0-1.  This controls the sampling rate of the input signal. A value of 1 equals whatever the sampling rate of the current session is.
Delay
----
*Prototype: [effect](#prototypes-effect)*

A feedback delay (echo) effect.


#### Properties ####
### Delay.feedback ###
*float* default: 0.5, range: 0-1.  This controls the amount of feedback, which determines how long the echoes carry on for. Note that values over 1 can produce an interesting effect, but will eventually blow up your speakers and potentially your ears... be careful!
### Delay.time ###
*duration* default: 1/8, range: 1/512-1.  This controls the amount of time betweeen echoes, or, if no feedback is applied, the amount of time between the original signal and the delayed signal.
Distortion
----
*Prototype: [effect](#prototypes-effect)*

A waveshaping distortion taken from Csound, which calls it a 'modified hyperbolic tangent distortion'.


#### Properties ####
### Distortion.pregain ###
*float* default: 2, range: 0-10.  This the boost that is applied to the input signal; applying more of a boost will create more distortion.
### Distortion.postgain ###
*float* default: 1, range: 0-1.  This property can be used to decrease the volume of the signal after it has gone through the wavefolder.
Flanger
----
*Prototype: [effect](#prototypes-effect)*

The classic flanging effect featuring a modulated delay line with feedback.


#### Properties ####
### Flanger.feedback ###
*float* default: 0.85, range: 0-1.  This controls the amount of feedback, which determines how long the echoes carry on for. Note that values over 1 can produce an interesting effect, but will eventually blow up your speakers and potentially your ears... be careful!
### Flanger.frequency ###
*float* default: 1, range: 0.0001-40.  This controls the frequnecy of the sine oscillator that is modulating the lookup in the delay line.
### Flanger.offset ###
*float* default: 0.125, range: 0.01-1.  This controls how far back the delay line is reading from. Larger values yield more dramatic results. A value of 1 === 500 samples in the past.
Freeverb
----
*Prototype: [effect](#prototypes-effect)*

This is a reverberation model that uses four allpass filters in series and then eight comb filters in parallel. It is the same as the generic Reverb effect in Gibber.


#### Properties ####
### Freeverb.roomSize ###
*float* default: 0.925, range: 0-0.999.  This controls the amount of feedback in the comb filters, which has the effect of shortening or lengthening the reverb tail.
### Freeverb.damping ###
*float* default: 0.5, range: 0-1.  This limits the high frequency content in the reverberated signal.
### Freeverb.dry ###
*float* default: 0.5, range: 0-1.  The amount of dry signal in the output. Set to 0 if you're using this on a bus, or to higher values if it is in an effects chain.
### Freeverb.wet1 ###
*float* default: 1, range: 0-1.  Using different values for this and .wet2 will affect the stereo output by sending some of the left output to the right channel and vice versa. With a value of 1 for this property and 0 for .wet2 each output will only go to one channel.
### Freeverb.wet2 ###
*float* default: 0, range: 0-1.  Using different values for this and .wet1 will affect the stereo output by sending some of the left output to the right channel and vice versa. With a value of 0 for this property and 1 for .wet1 each output will only go to one channel.
Vibrato
----
*Prototype: [effect](#prototypes-effect)*

An effect that modulates the pitch of an incoming signal over time... think opera singers.


#### Properties ####
### Vibrato.feedback ###
*float* default: 0.01, range: 0-1.  Although not used for traditional vibrato, increasing feedback can introduce interesting distortions.
### Vibrato.frequency ###
*float* default: 4, range: 0.0001-40.  This controls the frequnecy of the modulating oscillator.
### Vibrato.amount ###
*float* default: 0.5, range: 0.01-1.  Controls the width of the vibrato, or how much the pitch fluctuates.
Tremolo
----
*Prototype: [effect](#prototypes-effect)*

An effect that modulates the volume of an incoming signal over time.


#### Properties ####
### Tremolo.amount ###
*float* default: 1, range: 0.01-1.  Controls the width of the vibrato, or how much the pitch fluctuates.
### Tremolo.frequency ###
*float* default: 2, range: 0.0001-40.  This controls the frequnecy of the modulating oscillator.
### Tremolo.shape ###
*string* default: sine.  Controls the type of oscillation; options are 'sine', 'square', and 'saw'.
Wavefolder
----
*Prototype: [effect](#prototypes-effect)*

A wavefolding effect, where a signal is 'folded' repeatedly when it exceeds a certain threshold, adding spectral complexity and creating distortion.


#### Properties ####
### Wavefolder.gain ###
*float* default: 2, range: 0-10.  This the boost that is applied to the input signal; applying more of a boost will create more distortion.
### Wavefolder.postgain ###
*float* default: 1, range: 0-1.  This property can be used to decrease the volume of the signal after it has gone through the wavefolder.

# Geometries
Box
----
*Prototype: [geometry](#prototypes-geometry)*

A box.


#### Properties ####
### Box.size ###
*vec3* default: (1,1,1).  The size of the box in three dimensions.
Capsule
----
*Prototype: [geometry](#prototypes-geometry)*

A capsule, which is cylinder with a half sphere on each end (like a pill).


#### Properties ####
### Capsule.start ###
*vec3* default: (0,0,0).  The posititon of one end of the capsule.
### Capsule.end ###
*vec3* default: (1,1,1).  The posititon of one end of the capsule.
### Capsule.radius ###
*float* default: 1, range: 0.01-5.  The radius of the capsule.
Cone
----
*Prototype: [geometry](#prototypes-geometry)*

A cone.


#### Properties ####
### Cone.size ###
*vec3* default: (1,1,1).  The size of the box in three dimensions... kinda. Play with the values to get a sense for how they work.
Cylinder
----
*Prototype: [geometry](#prototypes-geometry)*

A cylinder.


#### Properties ####
### Cylinder.dimensions ###
*vec2* default: (1,1).  The radius and height of the cylinder.
HexPrism
----
*Prototype: [geometry](#prototypes-geometry)*

A six-sided prism.


#### Properties ####
### HexPrism.dimensions ###
*vec2* default: (1,1).  The radius and height of the prism.
Julia
----
*Prototype: [geometry](#prototypes-geometry)*

A three-dimensional rendering of the Julia set of a quaternion function.


#### Properties ####
### Julia.fold ###
*float* default: 2, range: 0.01-5.  Controls a coefficient in the equation for the Julia set.
Mandelbulb
----
*Prototype: [geometry](#prototypes-geometry)*



#### Properties ####
### Mandelbulb.c0 ###
*float* default: 8, range: 0.5-20.  A coefficient that affects variouus exponents in the Mandulbulb equation. Higher values yield the appearance of greater recursion / complexity.
Mandelbox
----
*Prototype: [geometry](#prototypes-geometry)*



#### Properties ####
### Mandelbox.fold ###
*float* default: 0.1, range: 2-0.01.  A coefficient that controls the amount of spherical folding in the mandelbox.
### Mandelbox.scale ###
*float* default: 3, range: 1-20.  A coefficient that controls the scaling in the mandelbox.
### Mandelbox.iterations ###
*int* default: 5, range: 1-0.1.  The number of times the mandelbox equation is run per frame. This number greatly influences the complexity of the final output, but higher values are computationally expensive.
Plane
----
*Prototype: [geometry](#prototypes-geometry)*

A flat rectangle, facing any direction.


#### Properties ####
### Plane.normal ###
*vec3* default: (0,1,0).  The direction the plane is facing. By default it faces upward along the y axis.
### Plane.distance ###
*vec3* default: (1,1,1).  The distance of the plane from the origin.
Sphere
----
*Prototype: [geometry](#prototypes-geometry)*

A sphere. All outer points are equidistant from the center.


#### Properties ####
### Sphere.radius ###
*float* default: 1, range: 0.01-5.  The radius of the sphere.
Torus
----
*Prototype: [geometry](#prototypes-geometry)*

A 3D ring.


#### Properties ####
### Torus.radii ###
*vec2* default: (.5,.1).  This vector determines the outer and inner radius of the ring.
Torus82
----
*Prototype: [geometry](#prototypes-geometry)*

A 3D ring that is flat on one axis.


#### Properties ####
### Torus82.radii ###
*vec2* default: (.5,.1).  This vector determines the outer and inner radius of the ring.
Torus88
----
*Prototype: [geometry](#prototypes-geometry)*

A 3D ring that is squared and flattened on one axis.


#### Properties ####
### Torus88.radii ###
*vec2* default: (.5,.1).  This vector determines the outer and inner radius of the ring.

# Graphics Misc
Vec2
----
A two-item vector.


#### Properties ####
### Vec2.x ###
*float* default: 0.  The x mmember of the vector.
### Vec2.y ###
*float* default: 0.  The y mmember of the vector.
Vec3
----
A three-item vector.


#### Properties ####
### Vec3.x ###
*float* default: 0.  The x mmember of the vector.
### Vec3.y ###
*float* default: 0.  The y mmember of the vector.
### Vec3.z ###
*float* default: 0.  The z mmember of the vector.
Vec4
----
A four-item vector.


#### Properties ####
### Vec4.x ###
*float* default: 0.  The x mmember of the vector.
### Vec4.y ###
*float* default: 0.  The y mmember of the vector.
### Vec4.z ###
*float* default: 0.  The z member of the vector.
### Vec4.w ###
*float* default: 0.  The w member of the vector.
Material
----
This determines aspects of a geometry such as color and reflectance.


#### Properties ####
### Material.mode ###
*string* default: global.  The lighting model employed by the material. Possible options include 'global', 'phong', 'orenn', and 'normal'.
### Material.ambient ###
*vec3* default: (.1,.1,.1).  This color is applied to every pixel in the geometry equally, regardless of how light strikes the geometry.
### Material.diffuse ###
*vec3* default: (0,0,1).  This color is applied to every pixel in proportion to how much light is striking each pixel.
### Material.specular ###
*vec3* default: (1,1,1).  This color is applied to the geometry in spots where light reflects directly off the geometry into the camera, creating a glare.
### Material.shininess ###
*float* default: 0.  This determines how soft or hard the edges of specular highlights are. More 'shiny' surfaces will have harder edges and are indicated by higher values.
### Material.fresnel ###
*vec3* default: (0,1,2).  he Fresnel effect changes the color of a geometry based upon the angle it is viewed at. This vector contains three values: x is bias, or an offset for the effect; y is scale, or a multiplier for the effect; z an coefficient that exponentially controls the effect of reflectance.
Texture
----
A texture can be applied to a geometry in order to pattern its surface; it can also be used as a lookup table for bump mapping. Unlike materials, every texture has a relatively unique set of properties depending on the algorithm used for the texture. However, the majority of texture will have a 'scale' property which determines the resolution of the texture; many will also have a 'strength' property that scales the effect of the texture on the final color of the geometry (lighting and material also affect this).


#### Properties ####
### Texture.scale ###
*float* default: 1.  The scale property determines the size, or resolution, of the texture. For example, when 'dots' texture is assigned to a cube with a scale of 10 there will be 10x10 dots on each side of the cube. A scale value of 1 will yiled a single dot centered on each side.
