/* __--__--__--__--__--__--__--____

using hydra in gibber
   
hydra is an amazing system for (mostly)
2D graphics, primarily inspired by analog
video synthesizers, and created by 
Olivia Jack. You can play with it at:

https://hydra.ojack.xyz

we can "inject" hydra into gibber using
the use() function, which will then 
download hydra and run it inside of gibber.
this tutorial gives the details on how to
do that and some tricks for "listening" to
gibber's musical instruments. For more info
on hydra itself, see the hydra website.

** __--__--__--__--__--__--__--__*/

// to load hydra up we need to tell gibber
// use the external file. the use() function
// returns a JavaScript promise that yields
// the hydra constructor. You don't really
// need to care about what thae means... just
// run the following line of code to start hydra
// in gibber:

use( 'hydra' ).then( init => init() )

// it might take a second or two to download
// hydra, but once that's done we can run
// hydra commands just like in the hydra
// website:

osc().out()

// you'll notice that gibber puts a black
// background behind the code so that it
// remains (at least somewhat) legible. you
// might want to also hit the little upward
// arrow in the upper right corner, which will
// hide the gibber menu bar so the graphics can
// be viewed better.

// in hydra, any function argument can itself
// be a function, which will be evaluated once
// per frame of video. the following code
// will create a random number that will 
// determine that horizontal frequency of
// our oscillator:

osc( ()=> Math.random() * 50 ).out()

// clearing gibber (with ctrl+period) will
// stop hydra. You can also call hush() to
// do this

hush()

// now that we know we can pass a function
// as any hydra parameter, all that we need
// to do is pass functions that provide the
// output of gibber instruments to get a/v
// synchronization. The __out property of
// instruments will give their current value.

k = Kick('long').trigger.seq( [.125,.5,2], 1/2 )
 
osc(100,.1,1)
  .kaleid( ()=> 2 + k.__out * 25 )
  .out()

// in order to make these types of mapping
// simpler, gibber adds a function .out()
// to every instrument that in turn returns
// a function giving it's value. You can
// also pass a argument to scale the output
// and to offset it. This means the code
// above can be shortened to:

k = Kick('long').trigger.seq( [.125,.5,2], 1/4 )
 
osc(100,.1,1)
  .kaleid( k.out(25,2) )
  .out()

// try it out using multiple instruments
// mapped to different hydra functions!