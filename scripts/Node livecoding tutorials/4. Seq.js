AudioContext = require('web-audio-api').AudioContext
Gibber = require('../../build/gibber.audio.lib.js')
Gibber.init()


// The `Seq` object is one of the basic building blocks of Gibber. It is
// designed to be completely generic; it can sequence calls to methods,
// changes to properties or calls to anonymous functions.

// You can sequence as many parameters as you want from a single `Seq` object.
// The two unifying factors for all of these parameters are the "durations"
// (when the parameters will change) and the "target" (which object will they
// be changed on). For `ScaleSeq` objects, "mode" and "root" are also used by
// the `ScaleSeq` object and not directly used to control slaves.

// In addition to creating extra sequencers, each Gibber object (synths, fx,
// etc.) comes with its own built-in sequencer, that you can use to quickly
// create sequences.

// When you create a `Seq` you give a bunch of arrays for properties you want
// to sequence. For example, if we want to sequence notes and change the
// amplitude and panning for each note:
a = Synth({attack: ms(1)})
b = Seq({note: ['A4', 'Bb4', 'C5', 'G4'],
        amp: [0.2 , 0.4, 0.6, 0.05 ],
        pan: [-0.5, 0.5 ],
        durations: 1/4,
        target: a})

// The above `Seq` object targets one synth and advances through the various
// sequences it contains every 1/4 note. The arrays holding the values are
// stored as properties of the `Seq` object. So, to access the array of
// amplitudes in the above sequence you would use `b.amp`.

Gibber.clear()

// Alternatively to the above notation, we could also do the following using
// the synth's built-in `Seq` object.
a = Synth({attack: ms(1)}
          ).note.seq(['A4', 'Bb4', 'C5', 'G4'], 1/4
          ).amp.seq([0.2, 0.4, 0.6, 0.05 ], 1/4
          ).pan.seq([-0.5, 0.5], 1/4)

// Note that the above syntax is a little terser, and also allows you to
// specify different durations for each property or method you are sequencing.

Gibber.clear()

// You can also sequence anonymous functions:
mynum = 0
z = Seq(function() {
            console.log(mynum++)
        }, 1/4)
z.stop()

// Simple note sequencing can be done using the `play()` method, which accepts
// a list of note names (as strings) or frequencies and a list of durations.
s = Synth().fx.add(Reverb())
s.play(['c2'], [1/4])
s.play(['c2', 'c3', 'c4', 'c5', 'c6'], [1/4, 1/8])

// You can access the synth's built-in sequencer using the `seq` property.
// Stop the synth's built-in sequencer using the `stop()` method
s.seq.stop()

// Restart synth built-in sequencer using previously defined frequencies and
// durations
s.seq.start()

// The shuffle method randomizes the order of playback
s.seq.shuffle()

// Reset changes the sequence back to its original order
s.seq.reset()

Gibber.clear()

// For more complex sequencing you can make a dedicated sequencer object
t = Synth({attack: 44}
          ).fx.add(
                Vibrato(),
                Reverb()
               )
u = Seq({note: ['c4', 'c5'].random(),
        durations: [1/4, 1/8].random(),
        target: t}
        )

// Assign new values to the note sequence
u.note = ["A5", "A#5", "C#5", "B5"].random()

// Assign new durations. If a 1/16th note is selected, play it twice.
// If a 1/6th note is selected, play it three times.
u.durations = [1/8, 1/16, 1/6].random(1/16, 2, 1/6, 3)

Gibber.clear()

// Next up: Scales
