/* __--__--__--__--__--__--__--____

polyphony & voices
    
Most synths in Gibber can only play
one note at a time; they are 
monophonic. This tutorial describes
special features / considerations
for Gibber's polyphonic synths,
currently PolySynth, PolyFM, PolyComplex,
PolyConga, PolyMono, and the Multisampler.

** __--__--__--__--__--__--__--__*/

// Let's start by using the PolySynth
// from the opening demo, with some 
// minor modifications.
Clock.bpm = 140
  
verb = Bus2('spaceverb')
 
perc = PolySynth('square.perc').connect( verb, .5 )
 
perc.note.seq( 
  gen( cycle(2) * 7 ), 
  Hex(0x8036) 
)
perc.note.seq( 
  gen( 7 + cycle(2.25) * 4 ), 
  Hex(0x4541), 
  1 
)

// A polysynth consists of multiple regular
// instruments routed into a single audio bus;
// you can find these instruments in the polysynth's
// .voices property.  They also have a voice
// allocation algorithm that determines which 
// voice plays each note.

// By default, all voices are panned to the center,
// and routed to the bus. When you change the pan
// for the main bus, you change the relative panning
// for all voices:

perc.pan = 0 // pan to left
perc.pan = 1 // pan to right
perc.pan = .5 // pan to center

// ...but you can also pan (and more generally modify)
// the individual voices of the polysynth. In this
// case we'll pan each of the four voices of our poly
// synth across the stereo spectrum.

perc.voices.forEach( (v,i) => v.pan = i * .25 )

// let's also change other properties of our
// first voice.

perc.voices[0].cutoff = .35
perc.voices[0].Q = .75
perc.voices[0].glide = 500

// adsr times are measured in samples... the
// individuals voices don't have the abstractions
// that top-level Gibber instruments have for time.
// the Clock.btos method converts beats to samples.
perc.voices[0].decay = Clock.btos( 2 )

// reset our pan
perc.voices.forEach( v => v.pan = .5 )

// for convenience, polysynth's have a .spread()
// method that controls their panning.
perc.spread(1) // maximum stereo

// .25 of width clustered around .75
perc.spread(.25) // 1/4 width stereo
perc.pan = .75

// In addition to thinking about individual panning
// of voices, it's common to want to control 
// other voice parameters on a per-note basis. We
// can do this by adding a capital V to any property
// name. When we sequence properties in this way, 
// the value is applied to the voices subsequent
// notes are attached to.

// fresh start...
Gibber.clear()
verb = Bus2('spaceverb')
perc = PolySynth('square.perc').connect( verb, .5 )

perc.note.seq( 
  gen( cycle(2) * 7 ), 
  Hex(0x8036) 
)
perc.note.seq( 
  gen( 7 + cycle(2.25) * 4 ), 
  Hex(0x4541), 
  1 
)

// create per-note loudness
perc.spread(1)
perc.loudnessV.seq( gen( .65 + cycle(1.5) * .5 ) )

// per-note cutoff frequencies
perc.cutoffV.seq( gen( .5 + cycle( beats(8) * 4 ) * .45 )  )

// per-note Q values
perc.QV.seq( gen( .5 + cycle(6) * .485 )  )

// note that, by not passing a timings pattern to our .seq call,
// these sequences are triggered / sampled every time a note is
// played by default.

// the number of voices a synth has is controlled by the
// .maxVoices property, which can *only be set in the
// constructor*. So, for a four-voice synth, you could
// use:

s = PolySynth({ maxVoices:4 })
s.chord([0,2,3,5])

// as seen above, polysynths have an additional chord()
// method you can use to play multiple notes at once. This
// method accepts an array, which means when you sequence
// it, you need to pass an array of arrays, otherwise you
// will get an error.

s.chord.seq( [[0,2,3,4], [3,4,7,8]], 1 )

// even if you're sequencing a repeated single chord, you
// still need an array of arrays. Last but not least, there's
// a shortcut for defining the number of voices, as shown
// below and in most of the gibber demos:

s = Synth[4]()
// same as s = PolySynth({ maxVoices:4 })
