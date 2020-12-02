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
  kd: 'xxxx',    
  cp: 'x..x.x..'    
}, drums )

// In the above example, we use the
// standard notation to sequence the
// kick drum every 1/4 note, but use 
// an alternative notation to write
// out the claps, where x=hit and . = rest.
// patterns are all subdivisions of a 
// single measure, meaning that in a pattern
// with 16 slots each slot will be 1/16th note
// in length, while in a pattern with five slots
// each slot will be a 1/5th note in length.
// By including patterns of different lengths,
// we can quickly create polyrhythms; below we
// use 1/8, 1/6, 1/5, and 1/4 notes.

Gibber.clear()
drums = EDrums()
s = Steps({
  kd: 'x..xx.x.',                
  cp: 'x.x...',                    
  ch: 'xxx.x.x.',                 
  oh: '.x.x.',         
  sd: '.x.x'         
}, drums )

// capital X provides an accent
Gibber.clear()
drums = EDrums()
s = Steps({
  kd: 'xX..',                 
  ch: '..xX'        
}, drums )

// ... or, you can use hexadecimal, where
// 1 is the softest and f is the loudest.

Gibber.clear()
drums = EDrums()
s = Steps({
  kd: '169f....',                   
  ch: '....169f'          
}, drums )

// we can also target notes instead of instruments.

verb = Bus2('spaceverb')
syn  = PolySynth('square.perc')
  .connect( verb, .25 )
 
steps = Steps({
  0: 'xX',                
  2: 'xxx',         
  3: '.x.x.',          
  5: 'x..X....x.x..x.x',        
  7: 'x...X..x.',       
  14:'X'       
}, syn )

// if you've done the pattern tutorial, you can use
// any of the transformations there on individual sequences
// in a Steps object or apply them to all sequences at once.

Gibber.clear()
drums = EDrums()
s = Steps({
  kd: 'x.x.....',                   
  ch: '.......x'          
}, drums )

// for example, run the line below to rotate just
// the kick drum:
s.kd.rotate.seq( 1,1 )

// and run the line below to reverse both sequences:
s.reverse.seq( 1, 2 )
