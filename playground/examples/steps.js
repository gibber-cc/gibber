/* __--__--__--__--__--__--__--____

using steps 

Steps is an interesting alternative
way to sequence. It enables you to
use many of the various options Gibber
has to define patterns to control a
single instrument, and also features
a unique sequencing mode reminiscent
of classic step sequencers.

** __--__--__--__--__--__--__--__*/

// Although the EDrums object is typically
// sequenced using the .tidal() method, you
// can also trigger individual drum sounds
// by calling .play()

drums = EDrums()
drums.play( 'kd' ) // play kick drum
drums.play( 'cp' ) // play clap

// The Steps object lets you quickly
// define different sequences targeting
// these different sounds.

s = Steps({
  kd: 1/4,   
  cp: 'x..x.x..'   
}, drums )

// In the above example, we use the
// standard notation to sequence the
// kick drum every 1/4 note, but use 
// an alternative notation to write
// out the claps, where x=hit and . = rest.
// We can also use Hex and Euclid.

s = Steps({
  kd: Hex(0x82),
  cp: 2, 
  sd: '.x.x',     
  ch: 'xxx.x..x', 
  oh: 1 
}, drums )

// one good reference for step patterns
// is http://808.pixll.de
// In Gibber, patterns are all subdivisions
// of a single measure, meaning that in a pattern
// with 16 slots each slot will be 1/16th note
// in length, while in a pattern with five slots
// each slot will be a 1/5th note in length. We 
// can also target notes instead of instruments.

verb = Bus2('spaceverb')
syn  = PolySynth('square.perc')
  .connect( verb, .25 )
  .connect( Out, .5 )

steps = Steps({
  0: 'xx',         
  2: 'xxx',  
  3: '.x.x.',   
  5: 'x..xx...x.x..x.x', 
  7: Euclid(3,9),
  14: 2
}, syn )
