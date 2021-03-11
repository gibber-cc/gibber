/* __--__--__--__--__--__--__--____

advanced concepts: multithreaded programming

gibber runs audio + interaction in
two separate threads. When you
create an audio object in the main
thread (the same thread where the 
code editor and gui are running) a
corresponding audio object is 
created in the audio thread. When
you change a value on an audio 
object in the main thraed, that
change is forwarded to the 
counterpart in the audio thread.
Since sequencing is performed in
the audio thread (not super common
in music programming languages) in
many cases changes to objects that
happen due to sequencing are similarly
conveyed back to the counterparts
in the main thread.

sometimes you want to create
variables, functions, and objects
to use in the audio thread. the 
primary use for these would be
sequencing (you can see one 
example of this in the pattern
filter tutorial). this tutorial
will walk through the various
options for passing information
from the main thread to the audio
thread.

** __--__--__--__--__--__--__--__*/

// to run a function in the main thread
// we use the run() function, which accepts
// a single arrow function as an argument.
// make sure you have your javascript console
// open and run the line below.

run( ()=> console.log(this) )

// you should see an AudioWorkletProcessor
// printed to the console. In JS, workers 
// and worklets are objects that manage
// threads and interthread communication.
// congrats... you've just run a function
// in the audio thread, run by the 
// AudioWorkletProcessor that was printed
// to the console.

// there's a "global" object in the audio
// thread you can use to store data. 
// while you probably won't need to do this, but
// you can also run functions in the
// main thread from the audio thread 
// by calling global.main().

run( ()=> {
  global.main( ()=> {
    console.log( 'this is the main thread and will report the window object:', this )
    alert('main thread')
  })
})

// ok, so let's do something with this. if
// you did the pattern filter tutorial you
// know we can use filters to transform
// the output of our sequences. Since these
// filters run in the audio thread, if we'd like
// to control them we need to use data that is
// also stored in the audio thread. Here's an
// example that use the same simple filter
// across three instruments, all referencing
// a global offset variable.

// we'll use this as the filter for each
// of our patternss
filter = args => {
  args[0] += global.offset
  return args
}

// initialize offset variable
run( ()=> global.offset = 0 )

s = Synth('bleep').note.seq( p1 = [0,1,2,3], 1/4 )
p = Pluck({ octave:1 }).note.seq( p2 = [0,1,2,3], 1/3 )
m = Monosynth('bassPad').note.seq( p3 = [0,1,2,3], 1 )

p1.addFilter( filter )
p2.addFilter( filter )
p3.addFilter( filter )

// now we can changee the offset
// try running this next line with
// different values to hear how it affects
// all three sequences.
run( ()=> global.offset = 1 )

// what about if we want to sequence the
// offset value? we can use a standalone
// sequencer object to do this, and pass
// it a function to execute. the sequencer
// below will increase the offset by 1 every
// two measures

Seq({
  values:fn( ()=>{ global.offset++ }),
  timings:2
}).start()

// we can also wrap values in the main thread
// and pass them to functions in the audio thread by calling
// fn(). In the example below, we'll create a 
// phase and a seq variable, and use them to 
// make a simple sequential pattern.

bass = Synth('bass.hollow')
phase = 0
seq = [7,0,3,0]

// our custom function needs to accept
// arguments corresponding to the names
// of the variables we passs to fn()
test = (phase,seq) => { 
  return seq[ phase++ % seq.length ]
}

// because gibber extracts the function body and
// sends it to the audio thread as a string, the
// function must explicitly use the return keyword
// (normmaly single line arrow functions don't require
// this). now that we have our function, we pass it
// to fn(), along with a dictionary containing
// any extra info the function requires to execute.
// in this case that extra info includes our phase
// and the array containing our sequence.
bass.note.seq (fn( test, { phase, seq }), 1/8 )

