AudioContext = require('web-audio-api').AudioContext
Gibber = require('../../build/gibber.audio.lib.js')
Gibber.init()

// By default, any value passed to `note()` that is below the value of
// Gibber.minNoteFrequency() (44 by default) will be considered a scale
// position; the frequency to be played will then be determined using the
// appropriate scale and scale position. First Gibber will check to see if the
// synth has a scale object assigned to it. If not, it will use the
// `Gibber.scale` object, as in the example below.

// Synths that take advantage of this scale system include `Synth`, `Synth2`,
// `Mono,` `FM` and `Pluck`.
s = Synth({attack:ms(10),
           decay:ms(50)}
          ).note.seq([0, 1, 5, 3, 0, 6, 7, -5], 1/16)
ss = Synth({attack:ms(10),
            decay:ms(50)}
           ).note.seq([0, 4, 3, 6, 4, 5, 9, -3], 1/16)

// Route strings to shared bus with reverb
q = Bus().fx.add(Reverb())
s.send(q, 0.5)
ss.send(q, 0.5)

// Change the mode of the global scale
Gibber.scale.mode = 'Lydian'

// Change the root of the global scale
Gibber.scale.root = 'c5'

// Assign a scale particular to one synth
s.scale = Scale('c4','Limit5')

// Remove synth scale so that it uses global
s.scale = null

// Change the octave of synths, relative to the octave of the global scale
s.octave = 1
ss.octave = -1

// Sequence changing between modes each measure
Gibber.scale.mode.seq(['Phrygian', 'Mixolydian'], 1)

// Sequence changing roots each 1/2 measure
Gibber.scale.root.seq(['c4', 'c#4'], 1/2)
s.octave = ss.octave = 0

// Go through all built-in modes
modes = ['Ionian',
         'Dorian',
         'Phrygian',
         'Lydian',
         'Mixolydian',
         'Aeolian',
         'Locrian',
         'MajorPentatonic',
         'MinorPentatonic',
         'Chromatic',
         'Adams',
         'Just',
         'HalfWhole',
         'WholeHalf',
         'Equal5Tone',
         'Equal7Tone',
         'Mess3',
         'Mess4',
         'Mess5',
         'Mess6',
         'Mess7',
         'Pythagorean'
         ]
Gibber.scale.mode.seq(modes, 1)

// Stop changing global scale root
Gibber.scale.root.seq.stop()

// Change `s` and `ss` to play first 8 notes in mode
s.note.seq([0, 1, 2, 3, 4, 5, 6, 7], 1/16)
ss.note.seq([3, 4, 5, 6, 7, 1, 2, 3], 1/16)

// Stop scale sequencer from changing mode
Gibber.scale.seq.stop()

// Define a custom scale in terms of a root frequency and frequency ratios for
// one octave. The octave can contain as many or as few notes as you wish.
Gibber.scale = Gibber.Theory.CustomScale('c4',
                                          [1,
                                           1.13,
                                           1.24,
                                           1.3321,
                                           1.421,
                                           1.578,
                                           1.6111,
                                           1.7235,
                                           1.8,
                                           1.95
                                           ]
                                          )

Gibber.clear()

// Next up: Chords & Arpeggios
