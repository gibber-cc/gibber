/* __--__--__--__--__--__--__--____
 *
 * tutorial #3: basic sequencing
 *    
 *    This tutorial will provide an introdution to 
 *    sequencing in gibber. Gibber lets you sequence 
 *    calls to most methods of audiovisual objects 
 *    as well as changes to any of their
 *    properties, just by adding .seq to the method
 *    or property name.
 *
 *    ** __--__--__--__--__--__--__--__*/

// send note message with value 0
syn = Synth( 'bleep' )
syn.note( 0 )

// now sequence it to send the value every quarter note
syn.note.seq( 0, 1/4 )

// You can stop all sequences in gibber with the Ctrl+. keyboard shortcut
// (Ctrl + period) or by executing the command Gibber.clear(), but
// this also deletes instruments. For this tutorial, we'll instead use the .stop()
// command to stop sequences on a specific instrument:
syn.stop()

// Most sequences in gibber contain values (0 in the example above) 
// and timings (1/4 above). To sequence multiple values we simply pass an array:
syn.note.seq( [0,1,2], 1/4 )

// ... and we can do the same thing with multiple timings:
syn.note.seq( [0,1,2], [1/4,1/8] )

// We can also sequence the loudness of our synth 
// and the decay of our synth's envelope. Note that
// in the example below, we're sequencing a function (note)
// as well as two properties (loudness and decay).
syn.stop()
syn.note.seq( 0, 1/2 )
syn.loudness.seq( [.1,.5,1], 1/2 )
syn.decay.seq( [1/16,1/4,1/2], 1/2 )

// All of the above ideas in this tutorial work identically 
// for visual objects. In the example below, we'll sequence
// the fold property of the Julia fractal, and the scale property
// of the fractal's texture.
fractal = Julia().scale(2).texture('dots', { scale:50 }).render()
fractal.fold.seq( [1,2,3,5], 1/2 )
fractal.texture.scale.seq( [2,20,50,100], 1/4 )

// stop the fractal sequences and clear all graphics from screen
fractal.stop()
Graphics.clear()

// If you experimented with running multiple variations of the note 
// sequences you might have noticed that only one runs at a time. For example,
// if you run these two lines:

syn.stop()
syn.note.seq( 7, 1/4 )
syn.note.seq( 0, 1/4 )

// ...you'll notice only the second one actually triggers. By default, Gibber
// will replace an existing sequence with a new one. To stop this, you can pass an ID number 
// as a third argument to calls to .seq(). In the examples of sequencing we've seen so far,
// no ID has been given, which means gibber assumees a default ID of 0 for each
// sequence. When you launch a sequence on a channel that has the same ID as another running 
// sequence, the older sequence is stopped. If the sequences have different IDs they run 
// concurrently. This makes it easy to create polyrhythms.

// create a PolySynth that can play multiple notes at a time

syn = PolyConga()
syn.note.seq( 0, 1 ) // assumes ID of 0
syn.note.seq( 2, 1/2, 1 ) 
syn.note.seq( 3, 1/3, 2 ) 
syn.note.seq( 5, 1/7, 3 )

// We can also sequence calls to midichord. You might remember from the first tutorial
// that we pass midichord an array of values, where each value represents one note. This
// means we need to pass an array of arrays in order to move between different chords.

syn.stop()
syn.chord.seq( [[0,2,4], [1,5,7]], 1/2 )

// Even we're only sequencing a single chord, we still need to pass a 2D array. 
