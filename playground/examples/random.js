/* __--__--__--__--__--__--__--____

randomness

there's a few different ways to get
randomness in gibber, whether you're
working with sequences or signals.
    
** __--__--__--__--__--__--__--__*/

// first, you can randomly pick 
// elements of array-based patterns
// by adding .rnd() to the end of the
// array.

s = Synth('bleep').note.seq( [0,1,2,3].rnd(), 1/8 )

// ...and it works for timings as well:

s = Synth('bleep').note.seq( [0,1,2,3], [1/8, 1/16].rnd() )

// this kind of randomness can be easily used to
// weight certain values over others. In the example
// below, we weight towards picking 0 or -7:

s = FM('bass.electro').note.seq( [0,0,0,0,7,2,3,-7,-7,-7,-7].rnd(), 1/8 )

// we can also create random numbers. in
// the example below, run the second line
// repeatedly to get a sense of what is happening:

s = Synth('pwm.squeak').note.seq( 0, 1/4 )
s.pulsewidth = rndf()

// by default rndf() gives you a value between
// 0 and 1, but you can provide your own range

s = Synth('pwm.squeak').note.seq( 0, 1/4 )
s.gain = rndf( 0, .5 ) // only softer volumes

// rndi() has the same behavior but creates
// integers instead of floats. Both rndf and
// rndi accept a third parameter, which is 
// the number of random numbers to create.
// if you enter more than 1 an array will be
// returned. Run the example below repeatedly
// to hear the results:

s = Synth('pwm.squeak').note.seq( rndi(0,7,4), 1/8)

// you can also set the 4th argument to be true
// to allow repeated values in the generated array;
// the default is for each value to be unique.

// OK, now we start getting more fun. Rndf() and 
// Rndi() are similar to their lowercase version,
// but instead of returning numbers or arrays they
// return functions that output numbers and arrays.
// Everytime the functions are called they will 
// output different values, this makes them great
// to use inside sequences.

s = Monosynth('pluckEcho').note.seq( Rndi(0,15), [1/4,1/2,1].rnd() )
s.pan.seq( Rndf() )

// A couple of fun tricks:

// 1. The plucked string algorithm has a 'blend'
//    property that flips samples. you can use this
//    to make an interesting sounding hi hat

p = Pluck({ decay:.1}).note.seq( Rndi(-5,5), 1/16 )
p.blend.seq( Rndf() )

// 2. Pick random samples from Freesound!
s = Freesound({ query:'beat', count:50 })
s.trigger.seq( 1,1/16 )
s.pick.seq( Rndi(0,50) )

// You can also use Rndi to genereate chords:

s = Synth[4]('cry').chord.seq( Rndi(0,10,4), 2 )

// Last but not least, we can also use the noise()
// function inside of gen() to create noisy signals.
// this can have a variety of interesting purposes...

// simple random
s = Synth('square.perc')
s.note.seq( gen( noise() * 6 ), 1/16 )

// sample and hold random
// the last value in sah() controls how often the 
// random value will be chosen. closer to 1 === less often
s = Synth('square.perc')
s.note.seq( gen( sah( noise() * 10, noise(), .99995 )), 1/16 )
