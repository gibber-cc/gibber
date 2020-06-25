// hit alt+enter to run all code
// or go line by line with ctrl+enter.
// ctrl+period to stop all sounds.
Clock.bpm = 140
 
verb = Bus2('spaceverb')
 
perc = PolySynth('square.perc')
perc.connect( verb, .35 )
perc.spread(1)
 
perc.note.seq( 
  gen( cycle(2) * 7 ), 
  Hex(0x8036) 
)
perc.note.seq( 
  gen( 7 + cycle(2.25) * 4 ), 
  Hex(0x4541), 
  1 
)
perc.loudnessV.seq( gen( .65 + cycle(1.5) * .5 ) )
 
bass = Monosynth('bassPad', { decay:4 })
bass.connect( verb, .5 )
bass.note.seq( [0,-1,-2,-4], 4 )
 
k = Kick()
k.trigger.seq( 1,1/4 )
 
h = Hat()
h.connect( verb, .15 )
h.trigger.tidal( '<.5 .35*3 [.5 .25] [.75 .25 .5 .25]>' )
h.decay = gen( .05 + cycle(2)* .025 )
 
lead = Synth( 'cry', { gain:.1, octave:1 })
lead.connect( verb, 1 )
lead.note.seq( 
  gen( cycle(.15) * 7 ), 
  [1/2,1,2] 
)
