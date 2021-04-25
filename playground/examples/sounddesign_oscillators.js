/* __--__--__--__--__--__--__--____

sound design: oscillators
   
the sound design tutorials look at how to create
your own sounds, or "presets", in gibber. This
first tutorial covers oscillators, the raw materials
for all non-sampled-based instruments in gibber.
    
** __--__--__--__--__--__--__--__*/

// the most basic instrument in gibber is the Synth.
// if you run the line below, and then type s.
// (s followed by a period) you should see a list of all
// the various properties/functions associated with the synth.
// Try this now.

s = Synth()

// quite a list! hopefully after this tutorial series we'll understand
// what each of these is responsible for. instruments/presets 
// are basically a collection of settings for these properties. 
// For example, the default Synth in gibber comes with a low-pass
// filter enabled, a sawtooth oscillator, and a half-second
// envelope among other characteristics. You can hear what
// that sounds like:

Synth().note(0)

// here's a very different synth with a sine oscillator, a 
// much shorter envelope, and a delay effect applied:

Gibber.clear()
Synth('bleep.echo').note(0)

// In the above example, 'bleep.echo' is the name of a preset.
// The Synth object has a preset named 'blank' that we'll use
// as a starting point for our experiments. This preset has
// no filter applied and uses a sine oscillator.

Synth('blank').note(0)
// The first property
// to understand is the "waveform" property. There are five
// possible options here: 'sine', 'saw', 'triangle', 'square',
// and 'pwm'.

s = Synth('blank').note.seq(0, 1)

// try running these one at a time
s.waveform = 'triangle'
s.waveform = 'square'
s.waveform = 'saw'

// you'll notice that each of these sounds progressively brighter. The
// smoothness of the waveform determines the brightness (the presence of
// harmonics) in the oscillator. Sine waves are the smoothest, followed
// by triangle waves. Square waves have completely smooth (flat) sections
// followed by abrupt drops/rises. Sawtooth waves gradually rise and then
// abruptly drop. In subtractive synthesis, which is what most instruments in
// Gibber use, typically you start with a "brighter" waveform (like saw or square)
// and then filter (subtract) frequencies from it to create different
// character.

// there's one other type of waveform that unfortunately can't be assigned
// after creating a synth (due to a bug): pwm, which stands for "pulsewidth modulation". 
// It might be easiest to think of this is a high value (the pulse) followed by 
// a low value. The pulsewidth property determines the relationship
// (width) of the high vs low signal. A value of .5 would generate a square
// wave.
 
Gibber.clear()
s = Synth('blank', { waveform:'pwm' }).note.seq( 0, 1 )

s.pulsewidth = .05
s.pulsewidth = .1
s.pulsewidth = .2
s.pulsewidth = .3
s.pulsewidth = .5

s.decay = 1
s.pulsewidth = gen( .25 + cycle(.25) * .24 )

  // you can hear that  pulsewidth oscillator can create a wide variety of sounds.
// fun to experiment with!

// one last important aspect of oscillators... whether or not they are
// "anti-aliased". A full description of anti-aliasing is beyond the scope
// of this tutorial; if you're interested I highly recommend checking out
// this interactive essay by Jack Shaedler: 
// https://jackschaedler.github.io/circles-sines-signals/index.html

// tldr: due to digital audio limitations, basic oscillators will introduce
// distortion that will become especially noticable when using higher notes.
// let's compare:

s = Synth('blank', { waveform:'saw' }).note.seq( 14, 1 )

// sounds pretty gnarly right? now try this:
s.antialias = true

// The default for Gibber is to use antialised oscillators, but
// for certain types of music (like chiptune / 8-bit styles) you
// might want to turn this off in your presets. Note that for lower
// notes the effect is much less noticeable:

s = Synth('blank', { waveform:'saw' }).note.seq( -14, 1 )

// it really just sounds a bit softer after doing this:
s.antialias = true

// this is because in most waveform overtones get progressively
// softer in relation to their fundamental frequency. When you
// trigger low notes, by the time overtones reach frequencies where
// aliasing occurs the high frequencies are so quiet that the
// effect can be hard to hear.

// Next up, we'll talk about envelopes, which not only shape
// the volume of gibber instruments, but also control filter settings,
// FM settings and more.