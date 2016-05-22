##Sampler

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
