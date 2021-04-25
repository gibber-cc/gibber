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
// assign second one to variable 'e'
kik = Kick()
kik.trigger.seq( 1,  Euclid(3,8) )
kik.trigger.seq( .5, e = Euclid(5,16), 1 )

// move timings pattern in second sequence
// one position to the right (try running this multiple times!)
e.rotate(1)

// reset timings pattern to original value
e.reset()

// now we'll sequence the pattern to shift each measure
e.rotate.seq( 1,1 )

// let's try this with some melodic content using
// the .transpose function on a values pattern. For
// all the subsequent examples, we'll create a pattern
// and assign it to the variable "notes"

Gibber.clear()
 
syn = Synth( 'bleep' )

syn.note.seq( notes = [0,1,4,5], 1/4 )
notes.transpose.seq( 1,1 )

// tell it to reset every 8 measures
notes.reset.seq( 1,8 )

Gibber.clear()

// below is a catalog of all the possible 
// pattern transformations.
b = Synth( 'bleep' ).note.seq( notes = [0,3,2,1,5,4,3,6], 1/8 )

// only play first four notes of pattern
notes.range(0,3)

// play all notes again
notes.range(0, 7)

// move pattern 1 slot to the right
notes.rotate( 1 ) 

// move pattern 1 slot to the left
notes.rotate( -1 )

// invert the pattern
notes.invert()

// reverse the pattern()
notes.reverse()

// store the pattern
notes.store()

// reset pattern to original value
notes.reset()

// switch to stored pattern
notes.switch( 1 )

// switch to original, which is always stored in slot 0
notes.switch( 0 )

// transpose by an octave
notes.transpose( -7 )

// scale intervals by a factor of 2
notes.scale( 2 )

// reset
notes.reset()

// sequence calls to parameter functions
notes.invert.seq( 1, [ 1,2,4 ] )
notes.reverse.seq( 1, [ 1,2,4 ] )
notes.rotate.seq( [-1,1], [1/2,1,2,4,8] )
notes.transpose.seq( [-1,1], [2,4,8] )

Gibber.clear()

// the set() method of pattern objects enables
// you to change manually set all the pattern
// values. Here's a simple example of changing a
// bass line every measure:

f = FM('bass').note.seq( notes = [0,7], 1/8 )

notes.set.seq([ [0,7],[0,5],[1,3],[2,4] ], 1 )

// although we think it's easiest to assign 
// patterns to variables and then manipulate
// them through that variable, you can also
// access patterns directly through the
// sequencers containing them. For example:

syn = PolySynth('square.perc')
syn.note.seq( [0,1,2,3], 1/4, 0 )
syn.note.seq( [7,8,9], Euclid(3,8), 1 )

// access the "values" of our 0 sequence
syn.note[0].values.transpose(1)

// access the "values" of our 1 sequence
syn.note[1].values.reverse(1)

// acecss the "timings" of our 1 sequence
syn.note[1].timings.rotate.seq( 1,1 )
