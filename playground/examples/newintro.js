// hit alt+enter to run all code
// or run line/selection with ctrl+enter.
// ctrl+period to stop all sounds.
 
Theory.tuning = 'slendro'
Theory.mode = null
  
verb =  Reverb( 'space' ).bus()
delay = Delay( '1/3' ).bus().connect( verb, .1 )
  
perc = FM[3]( 'perc' )
  .connect( delay, .65 ).connect( verb, .35 )
  .spread(.975)
  .note.seq( sine( btof(8),7,0 ), 1/8,  0 )
  .note.seq( sine( btof(4),3,0 ), 1/16, 1 )
  .note.seq( sine( btof(8),7,7 ), 1/6,  2 )
  .loudness.seq( sine(4.33,.35,.7)  )
 
kik = Kick()
  .trigger.seq( 1,1/4 )
 
hat = Hat({ decay:.0125 })
  .trigger.seq( [ _, 1, _, .5 ], 1/8 )
 
bass = Synth( 'bass.hollow' )
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
