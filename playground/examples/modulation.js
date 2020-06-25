/* __--__--__--__--__--__--__--____

tutorial #6: modulation
   
This looks at ways to perform
modulation on both audio and visual
parameters. It begins by using the
lfo() function, and then discusses
using lower-level gen() functions
as well.

** __--__--__--__--__--__--__--__*/

// Modulation typically implies
// continuously changing a value
// over time. In the worlds of both
// audio and visual synthesis, a 
// common synthesis technique is to
// use a "low-frequency oscillator",
// that is, an oscillator with a 
// frequency that is below audio rate.

// In Gibber the lfo function takes the
// form: waveform, frequency, gain, bias

// For example, here is a sine wave applied
// to the size of a box:

b = Box().render()
b.size = lfo( 'sine', .5, .5, 1 )

// In the above code, there is a 
// bias of 1 and a gain of .5...
// this means the box size will oscillate
// between values of .5–1.5. The frequency
// of .5 Hz means it will complete half
// a cycle in a second, or a full cycle in
// two seconds.

// we can use other waveforms: 
// sine, noise, square, and saw
b.size = lfo( 'noise', .5, .05, 1 )
b.size = lfo( 'saw', .5, .5, 1 )
b.size = lfo( 'square', 2, .5, 1 )

// In a similar vein, we can apply these
// lfos to audio properties.

s = Sine({ gain:.1 }).connect()
s.frequency = lfo( 'square', 4, 10, 220 )
s.frequency = lfo( 'square', 10, 40, 220 )
s.frequency = lfo( 'sine', 4, 20, 220 )

// In this case, we are effectively *replacing*
// the numeric frequency value with another
// waveform. However, sometimes we don't want
// to replace, we want to modulate an existing
// value. For example, if we have a synth and
// want to create vibrato, we still want to be
// able to sequence notes and use those notes
// as the base frequency value for our synth.
// Our modulation should affect the frequency
// that is derived from the current note being
// played. We can do this by *connecting* a lfo
// to a parameter.

syn = Monosynth( 'easyfx' )
syn.note.seq( [0,7], 2 )
 
// here we set the bias to 0, as we want our
// our modulator to instead use the base 
// frequency of our synth as its center point.
mod = lfo( 'sine', 4, 40, 0 )
  
// .connect() enables us to create this type of
// modulation:
mod.connect( syn.frequency )

// ... and we can sequence these properties
// using .seq or .tidal, or .fade them.
mod.frequency.seq( [2,4,8,16], 1 )

// although lfo() is convenient, you can also
// define custom modulations using the gen()
// function. for example, here's a modulation
// where its frequency increases over 8  beats:

Gibber.clear()
s2 = Synth({ gain:.1 }).connect()
mod2 = gen( cycle( beats(8)*20 )* 20 )
mod2.connect( s2.frequency )
 
s2.note.seq( [0,2,4,5], 1/4 )

// learning more about genish will be helpful if
// you want to create these types of custom modulations.
