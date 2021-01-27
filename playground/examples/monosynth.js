/* __--__--__--__--__--__--__--____

sound design: the monosynth
   
having previously covered features that are common 
across most synths in gibber (oscillators,
envelopes, and filters) this tutorial will
discuss the features/properties that make the Monosynth
unique.
    
** __--__--__--__--__--__--__--__*/

// let's start with the Monosynth, which has
// perhaps the easiest extra properties to
// understand. The name "monosynth" takes its
// cue from classic analog synthesizers that
// created giant sounds by stacking oscillators,
// but only for a single note (think of almost
// every Moog from the 70s). In gibber, each
// Monosynth has three oscillators that can
// be detuned to create different effects.
//
// detune2 tunes the second oscillator, while
// detune3 tunes the third. The frequency of
// oscillators 2 & 3 are determined by the
// following formula:
//
// frequency = oscillator1.frequency + (oscillator1.frequency) * detuneValue)
//
// So if our main oscillator has a frequency of
// 220, our detune2 value is 1 and our detune3 value
// is -.5, we'll get oscillators running at frequencies
// of 110, 220, and 440. When you double the frequency
// of an oscillator you perceptually raise it by an octave,
// so these three frequencies are all separated by an octave.

m = Monosynth({ 
  detune2:-.75, detune3:1, antialias:true, octave:-1
}).note.seq( 0, 1/4 )

// perhaps counter-intuitively, if we change detune2 to
// be -.75 we wind up getting a two octave drop:

m = Monosynth({ 
  detune2:-.75, detune3:1, antialias:true, octave:-1
}).note.seq( 0, 1/4 )

// ... but if you do the math (220 + -.75 * 220) we
// see the final value is 55, which is half of 110,
// and thus an octave lower. While spacing oscillators
// an octave apart is nice, we can also use much smaller
// values to 'thicken' a sound.

m = Monosynth({ 
  detune2:-.005, detune3:.005, antialias:true, octave:-1
}).note.seq( 0, 1/4 )

// try changing the detune values above to 0 and re-executing
// to hear the effect. Oscillators that are slightly detuned
// from each other create a chorus-like, phased effect. We
// can couple this with our earlier octave detuning:

m = Monosynth({ 
  detune2:-.7525, detune3:-.5025, antialias:true, octave:-1, decay:1/8
}).note.seq( sine(btof(3.5),5) , Euclid(5,8)  )

// last but not least, we can use the detuning to play multiple
// notes at once. For example, the 'bass.stab' preset has a detune2
// value of 1.5 and a detune3 value of .5.

bass = Monosynth('bass.stab')
  .note.seq( 
    gen( beats(8) * 4 ), 
    Euclid(5,16) 
  )

// last but not least, it's important to mention that
// even though the name is 'monosynth', you can still
// make polyphonic versions of it. this enables creating
// thick chords of many oscillators, at the potential
// expense of some CPU... especially if you're using
// antialiased oscillators. the polyphonic version
// is named PolyMono, a tongue-in-cheek reference to
// the classic Korg MonoPoly analog synth.

verb = Bus2().fx.add( Freeverb() )
pad = PolyMono('lead').connect( verb, .15 )
pad.chord.seq( Rndi(-7,7,4), 1 )