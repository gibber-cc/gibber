// **NOTE**
// This functionality is not currently available in standalone gibber.audio.lib!!
// **NOTE**

AudioContext = require('web-audio-api').AudioContext
Gibber = require('../../build/gibber.audio.lib.js')
Gibber.init()

// Audio Input, Sampling and Looping
// Note that audio input currently only works in Chrome.

// Before diving into using live input, let's look at using
// the Sampler object to live sample any sound source in
// Gibber.
a = EDrums('x*ox*xo-')
b = Sampler().record(a, 2).note.seq([0.5, 2, 4, -0.5, -1, -2, -4].rnd(), 1)

// In the above example, the drum loop is recorded and
// then triggered at a random speed every measure. You can
// also sample the Master output to reample an entire
// Gibber performance. Now let's open an audio input to
// sample (Chrome and Firefox only).
Gibber.clear()
a = Input()

// now you can apply fx to the input like any
// other synth and monitor them live
a.fx.add(Delay(1/4), Schizo('paranoid'))

// to sample it we create a Sampler and tell it to record
// the input for a number of measures
b = Sampler().record(a, 2)

// you can disconnect the input from the output bus at any time
a._

// to playback the recording, trigger a note message on the
// sampler. Pass a playback speed as an option to the method;
// negative speeds will play in reverse
b.note(2)
b.note(-1)

// and of course we can sequence it...
b.note.seq([0.5, 1, 2, 4], 1/2)

// you can also apply fx to the sampler. We can also create a
// Looper to overdub parts. The syntax is:
// l = Looper(audioToLoop, howLongPerLoop, howManyLoops)
// ... and give it the loop() command to start looping. So to
// record 4 overdubs of our mic input for one measure each:

Gibber.clear()
d = Input()
e = Looper(d, 1, 4).loop()
d._ // disconnect input

// Looper has start and stop methods and you can attach fx to it.
// The loops are each a Sampler object; all loops are stored in a
// children array. Thus, to add fx to a particular loop in a looper:
e.children[1].fx.add(Delay(1/8), Schizo('paranoid'))

// Change the pitch of the looper:
e.pitch = Add(1, Sine(4, .1)._)
e.pitch = -1
