/* __--__--__--__--__--__--__--____

using p5.js in gibber
   
p5 is an extremely popular system for
2D graphics. You can learn about it at:

https://p5js.org

we can "inject" p5 into gibber using
the use() function, which will then 
download p5 and run it inside of gibber.
this tutorial gives the details on how to
do that and some tricks for "listening" to
gibber's musical instruments. Many of the
concepts here are similar to how use use
Hydra in gibber (see the associated
tutorial), but there's one or two
important differences to be aware of.

** __--__--__--__--__--__--__--__*/

// to load p5 we need to tell gibber
// use the external file. the use() function
// handles this for us.

use( 'p5' )

// it might take a second or two to download
// p5, but once that's done we can run
// p5 commands.

// set the background color to black
background(0)

// set the fill color to red
fill(255,0,0)

// draw a rectangle at the screen center
rect( width/2-50, height/2-50, 100,100 )

// draw a bunch of rectangles
for( let i = 0; i < 10; i++ ) {
  rect( 200 + i * 20, 200 + i * 20, 100,100 )
}

// you can always clear the screen by calling
// background again
background(0)

// you'll notice that gibber puts a black
// background behind the code so that it
// remains (at least somewhat) legible. you
// might want to also hit the little upward
// arrow in the upper right corner, which will
// hide the gibber menu bar so the graphics can
// be viewed better.

// to get animation with p5 we need to define
// a draw() function; this will be executed once
// per frame of video.

x = 0

draw = function() {
  background(0) // start fresh each frame
  fill(255,0,0)
  rect(x +=5, 100, 50,50)
  
  if( x > width ) x = 0
}

// note that you can re-evaluate the draw
// function at will, as long as the state
// (in this case the variable x) isn't reset
// the p5 sketch will just continue running
// using the new algorithm.

// let's look at using the amplitude of gibber
// instruments to drive p5 sketches. 

kick = Kick().trigger.seq( 1,1/4 )

bass = FM('deepbass').note.seq( sine(2,4), Euclid(3,8)  )


// first we'll just set the background using
// the kick drum
draw = function() {
  background( kick.out() )
}

// hard to see any effect, right? that's because
// the kick drum outputs from 0–1, and we need
// a number between 0–255. We can pass a multiplier
// as the first argument to kick.out()

draw = function() {
  background( kick.out(127) )
}

// you can add a second argument to .out()
// that will provide an offset... so if we
// wanted to start with gray instead of black:

draw = function() {
  background( kick.out(127,64) ) 
}

// the above is functionally identical to the
// following:

draw = function() {
  background( 64 + kick.out() * 127 ) 
}

// ok, lets do something with the bass:

fill( 0 )
draw = function() {
  background( 64 + kick.out() * 127 )
  translate( width/2, height/2 )
  const b = bass.out(1000)
  rect( b*-.5, b*-.5, b, b )
}

// you might notice that the rise / fall
// in size of the square is a little hectic.
// by default, gibber tracks each sound over
// a window of 1024 samples. if we increase
// that number, we'll get smoother animations.
// if we decrease it, we'll get a sharper response
// to transients. Try changing the smooth variable
// below to values between 64 and 8192 to see the
// difference it makes:

fill( 0 )
smooth = 8192
draw = function() {
  background( 64 + kick.out() * 127 )
  translate( width/2, height/2 )
  const b = bass.out(2000,0,smooth)
  rect( b*-.5, b*-.5, b, b )
}

// in my opinion, for this particular bass sound, 
// a window of 8192 samples works well.

// be sure to check out the p5.js website 
// for more information and a reference: https://p5js.org