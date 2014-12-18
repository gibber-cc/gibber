// The following three lines are *always* required.
AudioContext = require('web-audio-api').AudioContext
Gibber = require('../../build/gibber.audio.lib.js')
Gibber.init()


// Please do the `Seq` tutorial before this one.

// Any time you use a call to `seq()`, the underlying data is converted into a
// pattern. You can perform various operations on these patterns, such as
// inverting them rotating them, reversing them, storing them and recalling
// them. These actions can be sequenced. To start here's an example with two
// `EDrum` loops. The higher loop is sequenced so that the pattern shifts
// every measure one slot to the right. This easily creates a varying 8
// measure loop.
a = EDrums('x*ox*xo-')
b = EDrums('x*ox*xo-')

// Move one position to the right each measure
b.note.values.rotate.seq(1, 1)

// You can also perform operations on durations
c = FM('bass',
       {amp: 0.9}
       ).note.seq([0, 2, 3, 7], [1/8, 1/16, 1/16, 1/4])

c.note.durations.reverse.seq(null, 1)

Gibber.clear()

// You can access the pattern of any sequenced property by grabbing the values
// object out of it. You can also manipulate durations (timing) instead of the
// sequencer's output values. Below is a comprehensive demo of the operations
// you can perform on patterns.
b = Synth({attack: ms(1),
           decay: 1/32
           }
          ).note.seq([0, 1, 2, 4, 7, 6, 5, 3], 1/8)

a = EDrums('x*ox*xo-', 1/8)

// Only play first four notes of pattern
b.note.values.range(0, 3)

// Play last two and first two notes, pattern loops correctly
b.note.values.range(6, 1)

// Play all notes again
b.note.values.range(0, b.note.values.length - 1)

// Move pattern 1 slot to the right
b.note.values.rotate(1)

// Move pattern 1 slot to the left
b.note.values.rotate(-1)

// Shift the pattern in the drums
a.note.values.rotate(1)

// Invert the pattern
b.note.values.invert()

// Reverse the pattern()
b.note.values.reverse()

// Store the pattern
b.note.values.store()

// Reset pattern to original value
b.note.values.reset()
a.note.values.reset()

// Switch to stored pattern
b.note.values.switch(1)

// Switch to original, which is always stored in slot 0
b.note.values.switch(0)

// Transpose by an octave
b.note.values.transpose(-7)

// Scale intervals by a factor of 2
b.note.values.scale(2)

// Reset
b.note.values.reset()

// Sequence calls to parameter functions
b.note.values.invert.seq(null, [1, 2, 4 ].rnd())
b.note.values.reverse.seq(null, [1, 2, 4 ].rnd())
b.note.values.rotate.seq([-1, 1].rnd(), [1/2, 1, 2, 4,8].rnd())
b.note.values.transpose.seq([-1, 1].rnd(), [2, 4, 8].rnd())

Gibber.clear()

// Next up: Chords & Arpeggiators
