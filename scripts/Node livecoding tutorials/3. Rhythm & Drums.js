AudioContext = require('web-audio-api').AudioContext
Gibber = require('../../build/gibber.audio.lib.js')
Gibber.init()


// Rhythm + Drums

// `Gibber` is geared towards rhythmic music. In order to sync to the global
// Gibber clock,
Gibber.Clock.bpm.value  // print the global tempo
// we use numbers such as 1, 1/2, 1/4, and 1/8. These variables represent a
// whole-note, half-note, quarter-note and eighth-note respectively. Any
// subdivision is possible, thus, 1/63 is a 63rd note.


// The `EDrums` object is a quick way to enter beats; it uses a `Seq` object
// behind the scenes. See the `Seq` tutorial for more information.

// `x` = kick
// `o` = snare
// `*` = closed hihat
// `-` = open hihat

// By default hits are triggered according to how long your sequence is. In a
// four-note sequence each hit will have a quarter note duration.
d = EDrums('xoxo')

// change speed of pattern
d.seq.durations = 1/2

// A second argument after the sequence defines how long each note is. This
// makes it easy to create polyrhythms and syncopations.
e = EDrums('xoxo', 1/5)
f = EDrums('***-', 1/6)

// change the master tempo.
Clock.bpm = 100

// The rate the clock advances at (default 1) can be modulated at audio rate
Clock.rate = Add(1, Sine(0.1, 0.5)._)

// Individual sequencer rates can also be changed relative to the master clock
f.seq.rate = Add(1, Sine(0.1, 0.75)._)

Gibber.clear()

// Time signatures can also be changed; unlike durations, time signatures must
// be indicated using strings.
Clock.timeSignature = '6/8'
d = EDrums('xxox*-', 1/8)

Gibber.clear()

// It's possible to sequence kick, snare and hat with separate sequences so
// they can play simultaneously. See the `Seq` tutorial for more details

// By default the `EDrums` constructor splits the sequence string into an array
// containing the individual notes. Here we use the `split()` method to do the
// same thing. We also randomize the pitch of the drums in one sequence.
z = EDrums()
k = Seq({note: 'x...x..xx..xx...'.split(''), durations: 1/16, target: z})
h = Seq({note: '*.*.*-***.*-*.**'.split(''), durations: 1/16, target: z})
s = Seq({note: '.o'.split(''), durations: 1/4, target: z})

Gibber.clear()

// Because that's a lot of notes, there's a shorthand for this.
// Each sequence is separate by the pipe (|) character. You can place as many
// as you want in a single string. If you use a comma, Gibber assumes the next
// value is the duration you want each note to last in the current sequence.
// The drum beat below is equivalent to the one created with the three
// sequencers above. Spaces at the end of sequences are ignored; they can
// improve legibility.
x = EDrums('x...x..xx..xx... |*.*.*-***.*-*.** |.o, 1/4')

Gibber.clear()

// Next up: Chords & Arpeggiators
