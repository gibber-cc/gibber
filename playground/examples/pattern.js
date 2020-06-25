/* __--__--__--__--__--__--__--____

tutorial #4: patterns

Please do the sequencer tutorial 
before this one.

Any time you use a call to .seq, the 
underlying data is converted into two 
*patterns*. One pattern stores *values* 
that the sequence outputs. The other pattern
stores *timings* that determine when 
these values are outputted. You can 
perform various operations on these 
patterns, such as inverting them, 
rotating them, reversing them, storing 
them and recalling them. These actions 
can be sequenced.

** __--__--__--__--__--__--__--__*/

// create two kick drum patterns
kik = Kick()
kik.trigger.seq( 1, Euclid(3,8) )
kik.trigger.seq( .5, Euclid(5,16), 1 )

// move timings pattern in second sequence
// one position to the right (try running this multiple times!)
kik.trigger[1].timings.rotate(1)

// reset timings pattern to original value
kik.trigger[1].timings.reset()

// now we'll sequence tthe pattern to shift each measure
kik.trigger[1].timings.rotate.seq( 1,1 )

// let's try this with some melodic content using
// the .transpose functtion on a values pattern

Gibber.clear()
 
syn = Synth( 'bleep' )
syn.note.seq( [0,2,4,5], 1/4 )
syn.note[0].values.transpose.seq( 1,1 )

// tell it to reset every 8 measures
syn.note[0].values.reset.seq( 1,8 )

Gibber.clear()

// below is a catalog of all the possible 
// pattern transformations.
b = Synth( 'bleep' ).note.seq( [0,3,2,1,5,4,3,6], 1/8 )

// only play first four notes of pattern
b.note[0].values.range(0,3)

// play all notes again
b.note[0].values.range(0, 7)

// move pattern 1 slot to the right
b.note[0].values.rotate( 1 ) 

// move pattern 1 slot to the left
b.note[0].values.rotate( -1 )

// invert the pattern
b.note[0].values.invert()

// reverse the pattern()
b.note[0].values.reverse()

// store the pattern
b.note[0].values.store()

// reset pattern to original value
b.note[0].values.reset()

// switch to stored pattern
b.note[0].values.switch( 1 )

// switch to original, which is always stored in slot 0
b.note[0].values.switch( 0 )

// transpose by an octave
b.note[0].values.transpose( -7 )

// scale intervals by a factor of 2
b.note[0].values.scale( 2 )

// reset
b.note[0].values.reset()

// sequence calls to parameter functions
b.note[0].values.invert.seq( 1, [ 1,2,4 ] )
b.note[0].values.reverse.seq( 1, [ 1,2,4 ] )
b.note[0].values.rotate.seq( [-1,1], [1/2,1,2,4,8] )
b.note[0].values.transpose.seq( [-1,1], [2,4,8] )

Gibber.clear()

// the set() method of pattern objects enables
// you to change manually set all the pattern
// values. Here's a simple example of changing a
// bass line every measure:

f = FM('bass').note.seq( [0,7], 1/8 )

f.note[0].values.set.seq([ [0,7],[0,5],[1,3],[2,4] ], 1 )

