
/*--md
# Creating & using audiovisual objects
   
this tutorial looks at how to make
audio and visual objects, and store
them so we can change their properties
and tell them to do tasks.
    
In Gibber, we usually create new objects
by calling a *constructor*. Constructors
are functions that can be identified by
the capitalization of their first letter.
(there are some exceptions to this in 
Gibber). Run the code below, making
sure your console is open first.
--*/

Synth()


/*--md
By placing parenthesis after the name of
the constructor, we call it and tell it
to make a new object. In many cases, we
want to store that object so that we can
use it later. We can do that by assigning
it to a variable.
--*/

syn = Synth()


/*--md
Now that we have a variable holding our
synth, we can use tell our synth to play a note:
--*/

syn.note( 0 )


/*--md
In this case, the synth plays the first
note in Gibber's default scale (learn 
more in the theory tutorial). We can
also change properties of our synth:
--*/

syn.octave = -2
syn.note( 0 )


/*--md
In the code above, we assign a value to
our synth's octave property, and then
tell it to play a note, which is now 
two octaves lower.

The same ideas (constructors, properties, 
and methods) also apply to graphics:
--*/

sphere = Sphere()
sphere.radius = 2
sphere.render()


/*--md
Press `Ctrl+Period` to clear the current
scene. When we create new audiovisual
objects, there are two types of info
we can pass to the constructors. The
first is the name of a "preset", which
is just a collection of values that
are assigned to an object's properties.
--*/

syn = Synth( 'acidBass2' )
syn.note( 0 )


/*--md
Note that the synth has a very different
sound and is in a lower octave by default;
this is due to the information stored in
the preset. Preset names must be passed
inside of quotation marks; in programming
we call this information "strings". You
can see a list of all presets related to
an instrument by calling the `.list()`
method (e.g. `Synth.list()` or `FM.list()`).

We can also pass custom property values to 
constructors. For example:
--*/

syn = Synth({ octave:-2, Q:.9, decay:1 })
syn.note( 0 )

// the above is just a shorthand for:
syn = Synth()
syn.octave = -2
syn.Q = .9
syn.decay = 1
syn.note( 0 )


// We can also pass a preset first, and then 
// pass a set of properties to a constructor:

syn = Synth( 'bleep', { waveform:'saw', shape:'exponential' })
syn.note( 0 )


/*--md
after you create new object, you can get a list
of the tasks it can do and the properties it 
has by just typing the name of the variable you
stored the object in and hitting the period key.
This is the easiest way to get a sense of the
options available for each object. Once this list
is displayed you can use the arrow keys to scroll
through it and read about each property/function.
Try type `syn.` below to see its list:
--*/


