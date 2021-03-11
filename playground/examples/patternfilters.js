/* __--__--__--__--__--__--__--____

advanced concepts: pattern filters

Please do the pattern and sequecning
tutorials before this one.

gibber lets you defined "filters" that
you can apply to patterns to transform
their output in various ways. We can use
filters to repeat values in patterns,
scale them, and create other effects.

** __--__--__--__--__--__--__--__*/

syn = Synth('square.perc')
  
syn.note.seq( ptrn = [0,1,2,3], 1/2 )
 
// run a bit later to hear effect
// make sure to have the console open to see
// the filter in action.
ptrn.addFilter( args => {
  args[0] *= 2
  console.log( args[0], args[1], args[2] )
  return args
})

// every filter is passed an array of 
// three parameters. the first is the
// current output value of the pattern; 
// in the example above this is either
// 0,1,2 or 3. The second paramter is how
// much the phase of the pattern should
// be incremented, and the last parameter
// is the current phase of the pattern.
// every filter should return this array
// of parameters, but you can modify the
// the output and the phase increment; 
// modifying the phase currently has no
// effect, except to provide information
// for annotations, which we'll see soon.
// in the example above we simply double
// the output values of the pattern.

// here's an example where we change 
// the phase increment to .25, so that
// every value in the pattern should
// repeat four times.

syn = Synth('square.perc')
  
syn.note.seq( ptrn = [0,1,2,3], 1/16 )
 
// run a bit later to hear repetition
// effect
ptrn.addFilter( args => {
  args[1] = .25
  return args
})

// ... and here's an example
// where we randomize the output of
// the pattern. filters
// are also passed references to the patterns
// they modify, we'll use this to get the
// length of the values in the pattern in
// order to determine the range of random values
// we'll output.

syn = Synth('square.perc')
  
syn.note.seq( ptrn = [0,1,2,3], 1/16 )
 
// run a bit later to hear randomization
ptrn.addFilter( (args, __ptrn) => {
  // get a random index
  const idx = Math.floor( Math.random() * __ptrn.values.length )
  
  // use the idx to return a random valuee
  args[0] = __ptrn.values[ idx ]
  
  return args
})

// you'll notice in the above example that 
// even though you're hearing random output
// the annotations are showing sequential output.
// if we assign our chosen index to the arguments
// array we'll get correct annotations.

syn = Synth('square.perc')
  
syn.note.seq( ptrn = [0,1,2,3], 1/4 )
 
// run a bit later to hear randomization
// annotations should now show correct output
ptrn.addFilter( (args, __ptrn) => {
  args[2] = Math.floor( Math.random() * __ptrn.values.length )
  args[0] = __ptrn.values[ args[2] ]
  
  return args
})

// one final point to note: these filters are
// run in the audio thread, so they don't have
// automatic acceess to variables you create. 
// check out the tutorial on multithreaded
// for more information, but for now, know that
// the following will NOT work.

syn = Synth('square.perc')
  
syn.note.seq( ptrn = [0,1,2,3], 1/4 )
 
// the phase variable below is only accessible in
// the main thread...
phase = 0

// ... so this filter fails.
ptrn.addFilter( (args, __ptrn) => {
  args[0] = __ptrn.values[ phase++ % __ptrn.values.length ]
  
  return args
})

// however, this would work (see the tutorial on
// multithreaded programming for more information):
syn = Synth('square.perc')
  
syn.note.seq( ptrn = [0,1,2,3], 1/4 )
 
// run the following function in the audio
// thread, creating a global phase variable.
run( ()=> global.phase = 0 )

// ... so this filter fails.
ptrn.addFilter( (args, __ptrn) => {
  args[0] = __ptrn.values[ global.phase++ % __ptrn.values.length ]
  
  return args
})
