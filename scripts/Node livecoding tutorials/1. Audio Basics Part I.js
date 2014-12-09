// The following three lines are *always* required.
AudioContext = require('web-audio-api').AudioContext
Gibber = require('../../build/gibber.audio.lib.js')
Gibber.init()

// Audio Basics Part 1

// Create a Sine Oscillator.
Sine()

// You'll notice that, by default, Gibber automatically connects sound
// generators to the master output. To terminate all Gibber audio, enter:
Gibber.clear()

// If we store the `Sine` in a variable, we can selectively terminate just it.
// Run the line of code below.
a = Sine()

// The next line of code will disconnect it.
a.disconnect()

// As a shorthand, you can use the underscore property to remove any audio
// element. Try it by running the next two lines one at time, in order.
b = Sine()
b._

// Most basic oscillators have two properties that we can manipulate:
// frequency and amplitude. Try running the code below mulitple times while
// substituting different values for frequency and amplitude.
c = Sine()
c.frequency = 660
c.amp = 0.1

// We can create the same results as above with a single line:
d = Sine(330, 0.1)

Gibber.clear()

// You might notice that if you run above line multiple times with different
// values you'll always only hear one oscillator. Whenever you store a Gibber
// object in a variable named with a single letter, Gibber will delete any
// Gibber objects stored in the variable when you place a new object inside of
// it. See the code below:
cc = Sine(440)
cc = Sine(1320) // plays both pitches; the first Sine isn't replaced

Gibber.clear()

c = Sine(880)
c = Sine(1100) // only plays one pitch

Gibber.clear()

// Next we'll create a `Synth` to play some notes. In addition to an
// oscillator, synths also have an amplitude envelope that is triggered by the
// `note()` method. Try each line one at a time.
d = Synth()
d.note('c4')
d.note('eb4')

// Synths have a couple of other properties we can manipulate: the attack and
// decay of the envelope.
d.attack = ms(1) // one millisecond attack time
d.decay = 1/2     // a half-note decay time
d.note('g#4')

// We can also tell Synths to play sequences of notes with different
// durations.
d.play(['c2', 'c5', 'c4'], 1/2) // each note lasts a 1/2 note
// Try running the above line multiple times with different notes.

// We can also create rhythms to loop through.
d.play(['c2', 'c5', 'c4'], [1/2, 1/2, 1])

// Adding .random() to the end of our arrays (lists) will randomize which
// notes get played or durations get chosen.
d.decay = 1/8
d.play(['c2', 'c3', 'c1'].random() , [1/4, 1/8].random())

// Time for some effects. Let's add a delay. Each synth / oscillator stores fx
// in an array. The add method allows us to plug synths into fx.
delay = Delay(1/16, .5) // delay time and feedback
d.fx.add(delay)

// We can always add more fx...
d.fx.add(Chorus())

// ...and we can remove them
d.fx.remove()

Gibber.clear()

// OK! You're ready for Audio Basics Part 2.
