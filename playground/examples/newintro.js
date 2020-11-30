// hit alt+return (opt+return in macOS) to run all code
// or run single line / current selection with ctrl+return.
// ctrl+period stops all sounds.
Theory.tuning = 'slendro'
Theory.mode = null
  
verb = Bus2('spaceverb')
delay = Bus2('delay.1/3').connect( verb, .1 )
  
perc = PolyFM('perc', { voices:3 })
  .connect( verb, .35 ).connect( delay, .65 )
  .spread(.975)
  .note.seq( sine( btof(8),7,0 ), 1/8,  0 )
  .note.seq( sine( btof(4),3,0 ), 1/16, 1 )
  .note.seq( sine( btof(8),7,7 ), 1/6,  2 )
  .loudness.seq( sine(4.33,.35,.7)  )
 
kik = Kick().trigger.seq( 1,1/4 )
 
hat = Hat({ decay:.0125 })
  .trigger.seq( [1,.5], 1/4, 0, 1/8 )
 
bass = Synth('bass.hollow')
  .note.seq( [0,1,2,-1], 1 )
  .trigger.seq( [.75,.5,.25], [1/4,1/8] )
 
clave = Clave({ gain:.1 }).connect( verb, .25 )
  .trigger.seq( .5, e = Euclid(3,8) )
 
e.rotate.seq( [1,-1], 2, 0, 4 )
 
fm = FM({ feedback:.0015, decay:1/2 })
  .connect( verb, .35 ).connect( delay, .125 )
	.note.seq( 
  	sine( btof(4.5),4,5 ), 
  	Hex(0x8032,1/4 ),
  	0,
    8
  )
