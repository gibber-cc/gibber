/* __--__--__--__--__--__--__--____

advanced concepts: temporal recursions

A temporal recursion is a function that
calls itself over time. For a more
complex take on what is possible with
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
  console.log( time )
  return 1/4
}, 'test', { k } )

// if you open your js console you can see that the time
// (number of seconds since gibber started) printed. we
// can use that time value to manipulate amplitude or
// the scheduling of our recursion.

k = Kick() 
tr( function() { 
  k.trigger(.5 + sin(time) * .5 )
 
  return time % 1 > .75 ? 1/16 : 1/8
}, 'test', { k } )

// in practice, it turns out writing these types of functions
// needs some basic math operations, which we've made global.
// these include sin,cos,min,max,round,floor,ceil, and random.
// note that you can access any of the standard javascript
// Math functions and constants through the global Math object
// (e.g. Math.PI). IMPORTANT: in the main thread, these
// functions have the same names but *very* different
// capabilities. In the main thread they're used to create
// signals (see the arpeggios and signals tutorial), while
// in the audio thread their used for standard math operations.
// It's confusing, but it's what we've got for now.

// also note that { k } is a JS shortcut for creating
// the object { 'k':k }, where 'k' is the name of
// an object property (aka key) and k is the value assigned to 
// the property. You can use the keys to refer to the objects
// you pass to the tr() function. We can also rename objects:

kick = Kick() 
tr( function() { 
  blahblahblah.trigger(.5 + sin(time) * .5 )
 
  return time % 1 > .75 ? 1/16 : 1/8
}, 'test', { blahblahblah: kick } )

// ...but in general using that object creation shortcut
// is quicker / more convenient. it's not important if
// this doesn't make sense to you, but for the functional 
// programming folks who are curious, when the function 
// is passed to the audio thread these variables become upvalues 
// to it.

// the recursive function is *also* passed each of the instruments
// as a parameter. We can easily group these into an array
// and then use our time (or any other method) to index them.

k = Kick()
c = Clave()
h = Hat()
 
tr( function(...args) { 
  const idx = abs( sin( time*4 ) ) * 3
  args[ floor(idx) ].trigger( .5 + random() / 2 )
  return random() > .5 ? 1/8 : 1/16
}, 'test', { k,c,h } )

// play around with the above function... remember you can
// redefine it and the previous recursion will be replaced
// by your new one. 

// we can access any variables stored in the audio
// thread from within our temporal recursion. 
d = EDrums()
 
run( ()=> global.durs = [1/16,1/8,1/16,1/8,1/4] )
 
tr( function( d ) {
  const idx = (time*2.5) % 6
  d.play( idx )
  return global.durs[ time*2 % 5 | 0 ]
}, 'drums', { d })


// of course we can have more than one
// recursion at once... all we have to do is
// make sure we name them differently so the
// second one doesn't replace the first.
f = Freesound[5]({ query:'amen +break', max:.35 }).spread(.9)
 
tr( function( f ) {
  f.pick( time*20 % 10 | 0 )
  f.trigger(1)
  return 1/16
}, 'freesound', { f })
 
f2 = Freesound[4]({ query:'kick', max:.2 }).spread(.5)
 
tr( function( f2 ) {
  f2.pick( time*7 % 13 | 0 )
  f2.trigger(1)
  return 1/8
}, 'freesound2', { f2 })

// in addition to passing instruments, you can also
// pass objects containing (relatively simple) state
// to use in your recursion. any state object is 
// converted to a string and passed to the audio thread
// where it is parsed, so make sure your state only contains
// simple numbers, strings, or arrays of numbers and strings.
// in the example below (originally by eris and remixed by
// charlie)  we use the _ character to store state. the
// state is then used to determine when samples are switched
// in a Freesound instrument.
verb = Reverb('space').bus()
 
f = Freesound({ query:'snare', max:.35 }).connect( verb, .35)
 
tr( function( f, _ ) {
  f.pick( _.num )
  if( _.i++ >= 32 ) {
    _.num = ++_.num % 15
    _.i = 0
  }
 
  f.trigger( 1 )    
  f.start = Math.sin(time*3)*0.2+0.21
  f.rate = Math.cos(time*1.1)*0.5+1
  f.pan = .5 + Math.sin(time) / 3
 
  return Math.sin(time)*0.05+0.07
}, 'freesound', { f, _:{ i:0, num:0 } })
