/* __--__--__--__--__--__--__--____

creating & using audiovisual objects
   
this tutorial looks at how to make
audio and visual objects, and store
them so we can change their properties
and tell them to do tasks.
    
** __--__--__--__--__--__--__--__*/

// In Gibber, we usually create new objects
// by calling a *constructor*. Constructors
// are functions that can be identified by
// the capitalization of their first letter.
// (there are some execeptions to this in 
// Gibber). Run the code below:

Synth()

// By placing parenthsis after the name of
// the constructor, we call it and tell it
// to make a new object. In many cases, we
// want to store that object so that we can
// use it later. We can do that by assigning
// it to a variable.

syn = Synth()

// Now that we have a variable holding our
// synth, we can use tell our synth to play
// a note:

syn.note( 0 )

// In this case, the synth plays the first
// note in Gibber's default scale (learn 
// more in the theory tutorial). We can
// also change properties of our synth:

syn.octave = -2
syn.note( 0 )

// In the code above, we assign a value to
// our synth's octave property, and then
// tell it to play a note, which is now 
// two octaves lower.

// The same ideas are true for graphics:

sphere = Sphere()
sphere.radius = 2
sphere.render()

// Press Ctrl+Period to clear the current
// scene. When we create new audiovisual
// objects, there are two types of info
// we can pass to the constructors. The
// first is the name of a "preset", which
// is just a collection of values that
// are assigned to an object's properties.

syn = Synth( 'acidBass2' )
syn.note( 0 )

// Note that the synth has a very different
// sound and is in a lower octave by default;
// this is due to the inforatmion stored in
// the preset. Preset names must be passed
// inside of quotation marks; in programming
// we call this information "strings".

// We can pass our own property values to 
// constructors. For example:

syn = Synth({ octave:-2, Q:.9, decay:1 })
syn.note( 0 )

// really, the above is just a shorthand for:
syn = Synth()
syn.octave = -2
syn.Q = .9
syn.decay = 1
syn.note( 0 )

// We can also pass a preset first, and then 
// pass a set of properties to a constructor:

syn = Synth( 'bleep', { waveform:'saw', shape:'exponential' })
syn.note( 0 )

// afer you create new object, you can get a list
// of the tasks it can do and the properties it 
// has by just typing the name of the variable you
// stored the object in and hitting the period key.
// This is the easiest way to get a sense of the
// options available for each object. Once this list
// is displayed you can use the arrow keys to scroll
// through it and read about each property/function.
// Try type syn. below to see its list:



