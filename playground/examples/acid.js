// created by fasttriggerfish and thecharlie 
  
Clock.bpm = 120
Theory.root = 'd#4'
Theory.mode = 'dorian'
 
verb  = Bus2( 'spaceverb' )
delay = Bus2( 'delay.1/6' )
 
bass = Synth('acidBass2', { saturation:20, gain:.3 })
  .connect( delay, .25 )
  .connect( verb, .125 )
 
bass.note.tidal( '0 0 0 0 4 6 0 ~ 0 ~ 7 -7 ~ 0 -7 0' )
bass.decay.seq( [1/32, 1/16], 1/2 )
bass.glide.seq( [1,1,100,100 ], 1/4 )
bass.Q = gen( 0.5 + cycle(0.1) * 0.49 )
bass.cutoff = gen( 0.5 + cycle(0.07) * 0.45 ) 
 
drums = Drums()
drums.fx.add( Distortion({ pregain:1.5, postgain:1 }) )
 
drums.tidal('kd [kd, sd] kd [kd, sd]')
 
hat = Hat({ gain:.075 })
hat.trigger.seq( [1,.5], [1/8, 1/16] )
hat.decay = gen( .02 + cycle( beats(16) * 4 ) * .0125 )
hat.fx.add( Distortion({ pregain:100, postgain:.1 }) )
 
pad = PolySynth('rhodes', { decay:8, gain:.15 })
pad.fx[0].connect( Out, .125)
pad.fx[0].connect( verb, 1 )
pad.chord.seq([[0,2,4,6], [1,2,4,7]], 4 )
 
Theory.degree.seq( ['i','-iv','-V'], [8,4,4] )
