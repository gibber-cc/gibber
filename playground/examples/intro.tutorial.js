/* __--__--__--__--__--__--__--____

executing / stopping code
   
we won't worry about what the code 
is doing yet, instaed we'll just 
look at how to run it and stop it. 
There's a bit more to this than you 
might assume...
    
** __--__--__--__--__--__--__--__*/

// To run a line of code, you can do the following:
// 1. Place your cursor in the line you'd like to execute
//    and hit Control+Enter.
// 2. Select the entire line of code with your mouse or
//    keyboard shortcuts and hit Control+Enter.
//
// Try it with the code below:

Box().render()

// To stop any currently running audiovisuals
// press Control+. (control + period)
// Do this now.

// You can also highlight multiple lines of code
// to run them all at once. Try this with the
// code below:

d = Difference(
  j = Julia().scale(2),
  Sphere(2).texture( 'truchet', {scale:50})
).render()
  
onframe = t => d.rotate(t*20,0,1,0)
j.fold = gen( 5 + cycle(.05) )

// You can use Ctrl+H to hide/reveal the editor.

// You can also execute "blocks" of code by
// placing your cursor inside a block and
// pressing Alt+Enter (option+enter in macOS).
// A block is a chunk of code with a blank
// line on either side of it. The above
// example is a block because the line
// above the onframe definition actually
// has a single space in it, to turn the
// whole chunk into a block. Clear the scene
// (Ctrl+Period) and then try executing the
// block by placing your cursor in the block
// and pressing Alt+Enter. Many tutorials
// and demos use these types of blocks, so
// get used to pressing Alt+Enter, which is
// much quicker than selecting text and hitting
// Ctrl+Enter (although functionally the same).

// By default Gibber waits until the start of the
// next musical measure to execute code. Try running
// the code below:

Clock.bpm = 140
drums = EDrums()
drums.tidal( 'kd <sd cp> kd*3 <oh [sd kd]>')

// Now run the line below:
bass = Monosynth('bass')
bass.note.seq( [0,7], 1/4 )

// Notice how the drums and bass sequences line up
// on a rhythmic grid. If you execute code by
// selecting it and hitting Shift+Enter, that code
// will run immediately, and probably be out of time
// with other running sequences.

hat = Hat()
hat.trigger.seq( .5, 1/4 )
