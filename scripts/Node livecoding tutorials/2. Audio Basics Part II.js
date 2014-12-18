AudioContext = require('web-audio-api').AudioContext
Gibber = require('../../build/gibber.audio.lib.js')
Gibber.init()


// Audio Basics Part II.

// Make sure you've completed Part I before starting this. This tutorial will
// primarily cover modulation.

// Modulation is fairly easy in Gibber. Unfortunately, JavaScript doesn't
// support operator overloading, so we need to create modulations using
// functions like Add(), Div() and Mul() instead of using operators. Not a big
// deal.
a = Sine()
a.frequency = Add(220, 320)

// Not very exciting, as it's just adding two constants. Let's try it with
// some time varying input.
a._  // Shorthand for `a.disconnect()`
a = Sine()
a.frequency = Add(220,
                  Sine(0.1, 110
                       )._
                  )


// In the above example, we've used a second sinewave to modulate the
// frequency of the first. Since the second sine wave has an amplitude of 110
// if we add / subtract this from 220 we get a final range of 110 - 330 that
// the sine wave moves between.

// IMPORTANT: Note the underscore `_` after the second Sine oscillator. We
// don't want this sine connected to our master output (this amp goes way
// above 11), so we disconnect it.

// Let's try something more complex.
a = Sine()
a.frequency = Add(440,
                  Sine(4, Sine(0.1, 100
                               )._
                       )._
                  )
// Note the two underscores to disconnect the modulating oscillators!

// Here we get a gradually wider and wider vibrato that eventually will be
// 100Hz in depth, but always fluctuating at 4 Hz.

Gibber.clear()

// We aren't limited to using sines, of course
b = PWM()
b.frequency = Add(440,
                  Saw(0.5, 220
                      )._
                  )

Gibber.clear()

// We can also use a stereo UGen as an input if we bounce it down to mono
// using the `Merge` function.
c = Sine()
d = EDrums('xoxo')
dMerge = Merge(d)
c.frequency = Add(220,
                  Mul(dMerge, 110
                      )
                  )

Gibber.clear()

// Finally, Gibber has a shorthand for assigning the properties of one object
// to control properties of another object over time. If we refer to the
// property name with a capital letter, we get a continuous output instead of
// an instantaneous one.
c = Sine()
d = EDrums('x*o*x*o-')
c.frequency = d.Out
// Note the capitalization of the `O` in `Out`.

Gibber.clear()

// OK, now you're ready to learn more about those EDrums we just created. Go
// check out the Rhythm tutorial!
