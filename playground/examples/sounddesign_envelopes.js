/* __--__--__--__--__--__--__--____

sound design: envelopes, gain, and loudness
   
this tutorial looks at how enveloping
works in gibber. The use of envelopes in
gibber is opinionated... they affect
everything from amplitude of instruments
to how FM modulation and feedback is
applied. The goal is for this envelope to affect
the *perceptual* loudness of the instrument, as
opposed to only affecting the amplitude.
So, while many other systems only
attach a primary envelope to amplitude,
in gibber this single envelope is attached
all over the place. This helps sounds in
gibber have greater timbral changes over
the course of each individual note, at the
expense of some loss of control; for example,
other systems might enable you to attach
different envelopes to control the amplitude
vs. the filter cutoff frequency. In gibber
these are all controlled by a single envelope.
    
** __--__--__--__--__--__--__--__*/

// In the sound design:oscillators tutorial we
// saw how our basic synth has an envelope attached
// to it.

s = Synth().note(0)

// by default, most instruments in gibber use
// a simple two-stage envelop with attack / decay
// properties. We can adjust these:

s.note.seq( 0, 1 )

// try each of these in order:
s.attack = 1/2
s.decay = 1/512
s.decay = 1/32; s.attack = 1/32
s.attack = 1/512

// While we'll save in depth discussion of filters
// for another tutorial, we'll note here that this
// envelope is controlling both the final amplitude
// of the signal as well as the filter cutoff. The
// amount that the filter cutoff is affected is determined
// by the filterMult property.

Gibber.clear()

s = Synth({ decay:1 }).note.seq( 0, 1 )

// no affect on cutoff
s.filterMult = 0

// lots of affect
s.filterMult = 2

// When filterMult is set to 2, at the peak of the
// envelope the cutoff frequency of the filter is doubled. 
// The envelope affects the index and feedback values of FM
// synths (covered in a later tutorial) in a similar way.

// While envelopes are (usually) two-stages by default, you
// can optionally specify to use a four-stage ADSR envelope.

s = Synth({ useADSR:true }).note.seq( 0, 1 )

// With an ADSR envelope, there are three new properties
// to play with in addition to attack/decay: sustain, sustainLevel,
// and release.

s.sustainLevel = .25
s.sustainLevel = .5
s.sustainLevel = .15

s.sustain = 1/8

s.sustainLevel = .5
s.release = 1/2

// .sustainLevel determines the "steady state" of the envelope,
// while .sustain determines how long the envelope remains at
// that value. .release determines how long it takes for the
// envelope to fade to 0 after the sustained portion is complete.

// By default in gibber envelopes are "linear"; they advance
// at a uniform rate throughout each stage. Or think of is more
// simply as each stage of the envelope is a straight line. However,
// sound is typically perceived logarithmically, not linearly, so
// changing  the .shape property from "linear" to "exponential" can 
// create sounds that might be more interesting. "exponential" is 
// specially nice for short percussive attacks/decays. Compare:

s = Synth().note.seq( 0, 1/2 )

s = Synth({ shape:'exponential' }).note.seq( 0,1/2 )

// all of the presets in gibber that contain '.perc' use an 
// exponential envelope; some other sounds do as well.

s = Synth('square.perc').note.seq( Rndi(-7,7), 1/8 )

// OK, that's it for envelope properties! Just two more related properties
// to get through. the .loudness property affects the overall strength of the
// envelope on all relevant aspects of the instrument (filter cutoff,
// "volume" etc.)

Gibber.clear()
s = Synth().note.seq(0,1)

s.loudness = .5
s.loudness = 1
s.loudness = 2

// hopefully you can hear that the final sound is much brighter
// in addition to being "louder"; this is due to how the increased
// envelope strength interacts with the filter cutoff frequency.
// we can then adjust the overall output of the instrument (the final
// "volume" if you will) using the .gain property. The gain of 
// the instrument will NOT affect the cutoff frequency of the filter
// or any other aspect of the sound besides the final signal strength.

// sounds the same, just less sound
s.gain = .25

// more sound, no change in sonic character
s.gain = .65

// typically you want to use .gain to fade sounds in and out, so
// that you don't change the character of the sound, only the
// output amount. However, it can also be interesting to fade
// the .loudness property of a sound... this will start a sound
// with a low filter cutoff and gradually get brighter as it 
// also increases in output strength. Compare the two below:

s = Synth().note.seq( 0, 1/4 )
s.gain.fade( 0, null, 4 )

// vs:
s = Synth().note.seq( 0, 1/4 )
s.loudness.fade( 0, null, 4 )

// by the end of the fade the two examples are identical,
// but in the second example the sound gradually gets brighter
// as the fade advances.

// OK, you should hopefully have a pretty good understanding how
// enveloping works in gibber, and how you can use the loudness and
// gain properties to control perceptual loudness vs the output strength
// of an instrument. Next up is an in depth discussion of filters.