/* __--__--__--__--__--__--__--____

tutorial #5: tidal

TidalCycles is a fantastic DSL for 
sequencing pattern. In Gibber (and
some other live coding systems),
standard sequencing is done by 
separating the output of patterns
from their timing. In Tidal, they're
tightly coupled. Both methods have
their uses.

** __--__--__--__--__--__--__--__*/

// The Tidal mini-notation is the
// preferred way to do drum sequencing
// in Gibber. The sample-based drum
// player has four drums: kick drum(kd),
// snare drum(sd), closed hihat(ch), 
// and open hihat(oh).

drums = Drums()

// in the example below, we play
// one kick drum per 'cycle'
drums.tidal( 'kd' )

// split a cycle into one kick drum
// and one snare drum
drums.tidal( 'kd sd' )

// repeat, each drum gets a 1/4
// of a cycle
drums.tidal( 'kd sd kd sd' )

// we can also group values together,
// so that they split a cycle subdivision.
// in the example below, the samples 
// inside of the [] brackets are played
// back twice as fast as the other samples.
drums.tidal( '[kd ch] sd [kd sd] oh' )

// we can also repeat groups or any other
// tidal pattern member
drums.tidal( '[kd ch]*2 sd [kd*2 sd] oh' )

// ok, let's start with a fresh pattern.
// using the <> brackets, we can tell the
// pattern to alternate which member is played.
drums.tidal( '< kd sd kd oh > ch*2' )

// we can use 'curly' {} brackets to play two 
// sounds at once
drums.tidal( '< kd sd kd {oh,kd} > ch*2' )

// it doesn't have to be individual sounds...
drums.tidal( '< {kd,[sd ch]*2} sd kd {oh,kd} > ch*2' )

// there are also rests via the ~ character
drums.tidal( '< {kd,[sd ~ ch]*2} sd {oh,kd} > [ch ~ ch]' )

// you can easily insert "euclidean rhythms".
// in the pattern below we fit 3 pulses into 8 slots,
// and then 5 pulses into 9 slots.

drums.tidal( '{kd, ch(3,8)} {sd, kd(5,9)}' )

// you can abuse the repetition operator
drums.tidal( '<kd*16 kd*24> sd [kd*2 sd] <oh ch*3 ch*12>' )

// you can sequence any audiovisual object by using
// the .tidal function
Clock.bpm = 140
verb = Bus2('spaceverb')

syn = PolySynth('square.perc').connect( verb, .25 )
syn.note.tidal( '0 [1 2]*2 <4 3>*2 5' )
syn.pan.tidal( '0 .5 .99' )
syn.cutoff.tidal( '.45 .95 .325 1.5' )

e = EDrums().connect( verb, .1 )
e.tidal('kd <cp cp {kd,cb}>')
e.kick.decay = .995
e.kick.frequency = 60

// visuals
Fog( .125, Vec3(0) )
p = Plane().texture( 'checkers' ).render()
p.texture.scale.tidal( '1 2 [4 10]*2 50 ')

