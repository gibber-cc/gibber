/* __--__--__--__--__--__--__--____

sound design: filters
   
There are currently four different filter models available in Gibber. 
While the first two are only lowpass, the SVF and biquad come with multiple
modes.

1. Filter24Moog - 24db per octave "virtual analog" aka "zero-delay" ladder filter. lp.
2. Filter24TB303 - 24db per octave "virtual analog" aka "zero-delay" diode filter. lp.
3. Filter12SVF - 12dB per octave state variable filter. lp, hp, bp, notch.
4. Filter12Biquad - 12dB per octave biquad. lp, hp, bp.

These filters can all be used as a built-in parts of the Synth, FM,
and Monosynth instruments. You can use a value of 0 for .filterModel to
remove filtering from the signal chain of instruments.

IMPORTANT: .filterMode is very different from .filterModel!!!
    
** __--__--__--__--__--__--__--__*/

s = Synth()

// default:  
// moog filter (filterModel:1)
// lowpass (filterMode:0)
s.note(0)

// 303-style (filterModel:2)
// lowpass (filterMode:0)
s.filterModel = 2
s.note(0)

// state variable (filter)
// lowpass
s.filterModel = 3
s.note(0)

// highpass
s.filterMode = 1
s.note(0)

// bandpass
s.filterMode = 2
s.note(0)

// notch
s.filterMode = 3
s.note(0)

// biquad (filter)
// lowpass
s.filterModel = 4
s.note(0)

// highpass
s.filterMode = 1
s.note(0)

// bandpass
s.filterMode = 2
s.note(0)

// There are a number of properties that affect the filter
// besides .filterModel and .filterMode. The first is .cutoff,
// which is measured from 0-1. 

Gibber.clear()
s = Synth().note.seq( 0, 1/4 )
s.cutoff.seq( [.1,.25,.35,.5,.75, .9] )

// With a lowpass filter, the .cutoff property says
// "only let frequencies below this value pass". A value
// of 0 lets no signal pass through, while a value of 1
// lets all signal pass. As discussed in the envelopes
// tutorial, the synths envelope also affects the cutoff
// frequency... the amount of this effect is determined
// by the .filterMult property

Gibber.clear()
s = Synth({ cutoff:.1 }).note.seq( 0, 1/4 )
s.filterMult.seq( [.5,1,2,4,8] )

// The next important property is Q, or "quality", 
// also measured from 0–1. High values make a 
// steeper rolloff in the frequencies, but also
// create a boost right around the cutoff frequency.
// The boost to the cutoff frequency is a classic sound
// of subtractive synthesis.

// compare low Q:
s = Synth({ 
  cutoff:.25, filterMult:2, attack:1, decay:1, Q:.1
}).note.seq( 0, 2 )

// high Q:
s.Q = .925

// the last (fun) property to mention is saturation,
// which only affects the TB303 filter. Saturation
// applies a waveshaping effect that "squares off" 
// the resulting signal as it goes through the filter.

s = Synth({
  filterModel:2, attack:1/512, decay:1/4, octave:-2, glide:500, Q:.75
}).note.seq( [-7,0,7,0,14],[ 1/4,1/8 ] )
 
s.saturation = 150
s.saturation = 20
s.saturation = 2

s.Q = .9

// this saturated sound is a classic part of
// acid house.


