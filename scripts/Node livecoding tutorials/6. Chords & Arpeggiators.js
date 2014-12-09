AudioContext = require('web-audio-api').AudioContext
Gibber = require('../../build/gibber.audio.lib.js')
Gibber.init()

// Chords & Arpeggiators

// For efficiency reasons, synths are created only being able to play one note
// at a time. To fix this, you must set the maxVoices property of a synth to a
// higher number.
a = FM({maxVoices:4})

// Once this is done, you can call the chord method on a synth.
// You can define chords in terms of Gibber's scale objects, or pass in
// strings like the following:
// "c3M7" - C major chord, dominant 7th, root is C3
// "c3m7" - C minor chord, dominant 7th, root is C3
// "cb4dim" - Db diminished chord, root is Db4
// "c#3Maj7" - A# major seventh chord
// "c3M9b5" - F major 9 flat 5 chord
// "c3aug"  - G augmented chord

// Describe a chord in terms of root, octave, and quality
a.chord('c4dim7')

// Use notes from Gibber's global scale, in this case the I, the III and
// the IV (zero-indexed). See the `Scales` tutorial for more information.
a.chord([0, 2, 4])

// Sequence chords, note the multidimensional array.
a.chord.seq([[0, 2, 4],
             [1, 3, 5]
             ],
            1/2
            )

// Change global scale
Gibber.scale.mode = 'Lydian'
Gibber.scale.mode = 'Phrygian'

Gibber.clear()

// We can also create randomized chords using `rndi()` and `Rndi()`. `Rndi()`
// will create a different chord everytime a sequencer calls it.
b = Pluck({maxVoices:4})

// Create a three-note chord with notes in between the root and an octave
// higher.
b.chord(rndi(0, 7, 3))

// Note the same chord gets played each time
b.chord.seq([rndi(0, 7, 3)], 1/2)

// A different chord each time
b.chord.seq(Rndi(0, 7, 3), 1/2)

Gibber.clear()

// The `Arp` allows us to arpeggiate chords over a number of octaves. There
// are different methods of playback:
// up - only play notes going up
// down - only play notes going down
// updown - play notes up and down, repeating top and bottom notes
// updown2 - play notes up and down but only play top and bottom notes once
//           per arpeggio.
c = Synth({maxVoices:10, attack:44})

// Chord, speed, pattern, number of octaves
d = Arp('c4maj7', 1/8,
        'updown', 4
        )
d.target = c

// Change speed of arpeggiator
d.speed = 1/32

// Change chord
d.chord('c4min7')

// Sequence chord changes
d.chord.seq(['c4maj7', 'c4min7'], 1)

// Shuffle notes. shuffling can be sequenced.
d.chord.seq.stop()
d.shuffle()

// Change pattern every 4 measures
d.shuffle.seq(null, 4)

// Reset note ordering
d.shuffle.seq.stop()
d.reset()

Gibber.clear()
