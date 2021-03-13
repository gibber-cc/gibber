/* __--__--__--__--__--__--__--____

advanced concepts: temporal recursions

A temporal recursion is a function that
calls itself over time. For a more
complex take on what is possibble with
them, see Andrew Sorensen's essay on
the subject: 

http://extempore.moso.com.au/temporal_recursion.html

In gibber they enable us to sequence
instruments in a completely different
style than the gibber's typical 
sequence/pattern-based approach. The
basic workflow is to pass instruments
to functions, trigger those instruments
from within the function, and specify
when the function should be called
next.

Please go through the multithreaded
programming tutorial before reading
this one.

** __--__--__--__--__--__--__--__*/

// tr() is the temporal recursion function. the
// function you pass to it will run in the audio
// thread, so we need to also pass a dictionary of
// objects we'd like to sequence (similar to calling
// the future() function). You must return the 
// amount of time you want to wait before the function
// is called again; one measure will be used as a default
// if you don't return anything. You should also
// pass a name for the recursion... if you create
// a new recursion with the same name it will then replace
// the previous one. 

// make an instrument
k = Kick()
 
// create the temporal recursion
tr( function(...args) { 
  k.trigger(.5)
  console.log( Gibberish.time )
  return 1/4
}, 'test', { k } )

// if you open your js console you can see that the time
// (number of seconds since gibber started) printed. we
// can use that time value to manipulate amplitude or
// the scheduling of our recursion.

k = Kick() 
tr( function() { 
  k.trigger(.5 + Math.sin(Gibberish.time) * .5 )
 
  return Gibberish.time % 1 > .75 ? 1/16 : 1/8
}, 'test', { k } )

// also note that { k } is a JS shortcut for creating
// the object { 'k':k }, where 'k' is the name of
// an object property (aka key) and k is the value assigned to 
// the property. You can use the keys to refer to the objects
// you pass to the tr() function. We can also rename objects:

kick = Kick() 
tr( function() { 
  blahblahblah.trigger(.5 + Math.sin(Gibberish.time) * .5 )
 
  return Gibberish.time % 1 > .75 ? 1/16 : 1/8
}, 'test', { blahblahblah: kick } )

// ...but in general using that object creation shortcut
// is quicker / more convenient. it's not important if
// this doesn't make sense to you, but for the functional 
// programmming folks who are cuirious, when the function 
// is passed to the audio thread these variables become upvalues 
// to it.

// the recursive function is *also* passed each of the instruments
// as a parameter. We can easily group these into an array
// and then use our time (or any other method) to index them.

k = Kick()
c = Clave()
h = Hat()

tr( function(...args) { 
  const idx = Math.abs( Math.sin( Gibberish.time*4 ) ) * 3
  args[ Math.floor(idx) ].trigger( .5 +  Math.random() / 2 )
  return Math.random() > .5 ? 1/8 : 1/16
}, 'test', { k,c,h } )

// play around with the above function... remember you can
// redefine it and the previous recursion will be replaced
// by your new one. 

// we can access any variables stored in the audio
// thread from within our temporal recursion. 
d = EDrums()

run( ()=> global.durs = [1/16,1/8,1/16,1/8,1/4] )

tr( function( d ) {
  const idx = (Gibberish.time*2.5) % 6
  d.play( idx )
  return global.durs[ Gibberish.time*2 % 5 | 0 ]
}, 'drums', { d })


// of course we can have more than one
// recursion at once...
f = Freesound[5]({ query:'amen +break', max:.35 }).spread(.9)
 
tr( function( f ) {
  f.pick( (Gibberish.time*20 % 10) | 0 )
  f.trigger(1)
  f.end = Gibberish.time*10 % 1
  return 1/16
}, 'freesound', { f })
 
f2 = Freesound[4]({ query:'kick', max:.2 }).spread(.5)
 
tr( function( f2 ) {
  f2.pick( (Gibberish.time*7 % 13) | 0 )
  f2.trigger(1)
  return 1/8
}, 'freesound2', { f2 })
