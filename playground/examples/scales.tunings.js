/* __--__--__--__--__--__--__--____

using scales / tunings
   
this tutorial looks at how to use
scales and microtonality in Gibber,
powered by the fantastic tune.js
library by Andrew Bernstein and Ben
Taylor.

http://abbernie.github.io/tune/
    
** __--__--__--__--__--__--__--__*/

// By default Gibber plays scales in A minor,
// starting in the 4th octave.

s = Synth('square.perc')
s.note.seq( [0,1,2,3,4,5,6,7,8,9,10,11,12], 1/16 )

// The global Theory object lets us change
// modes, root notes, and tunings. With
// the above code running, run the lines
// below one at a time

// currently uses #s only.
Theory.root = 'c4'

// aeolian, dorian, phyrigian, ionian, mixolydian, lydian etc.
Theory.mode = 'lydian'
Theory.mode = 'phrygian'

// We can easily create chord progressions by
// change the 'degree' property, which chooses
// what degree of the current scale to advance to.
// For example, given the following:

Theory.root = 'c4'
Theory.mode = 'ionian'
s = Synth('square.perc')
s.note.seq( [0,1,2,3,4,5,6,7], 1/16 )

// ... changing the degreee to IV will move to
// F major, or iv for F minor:

Theory.degree = 'IV'
Theory.degree = 'iv'

// we can also change the octaves by adding + or -
// symbols.

Theory.degree = '-IV'
Theory.degree = '--IV'
Theory.degree = '+IV'
Theory.degree = '++IV'

// and we can also change the modes with other
// traditional chord indicators:

// locrian
Theory.degree = 'ivo'
// mixolydian
Theory.degree = 'IV7'

// sequence them
Theory.tuning = 'ji_12'
// pythagorean tuning, 12-step
Theory.tuning = 'pyth_12'
// well-tempered tuning, 12-step
Theory.tuning = 'bach2'

// note that in many cases the tunings contain scales
// that are more or less than 12 notes in length. Such
// scales won't work the standard Western modes, so
// you probably want to change the mode to be null when
// using them.

Theory.tuning = 'slendro'
Theory.mode = null

// with all that that said, there are times when you 
// might want to bypass the music theory system in
// gibber altogether, and just provide direct frequncy
// values to instruments. you can do that using the
// .notef() method.

s = Synth('bleep').notef.seq( [100,200,300,400], 1/4 )

// by default, note() rounds any arguments you send to
// it so that they can be used to look up notes in 
// gibber's current scale. however, the notec method
// (for "note continuous") lets you interpolate betweeen
// scale indices for a full continuous range of pitches.

s = Synth('square.perc')
s.notec.seq( [0,.25,.5,.75,1,1.25,1.5,1.75,2], 1/8 )
