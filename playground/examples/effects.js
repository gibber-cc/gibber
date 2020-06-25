/* __--__--__--__--__--__--__--____

audio fx and busses
   
This tutorial walks through adding
effects to synths and also looks at
strategies for routing sound.
    
** __--__--__--__--__--__--__--__*/

// first, let's make a delay effect.
// the three two important parameters
// of the delay are "time" and "feedback".
// "feedback" controls the number of
// echoes and time controls the space
// betwen them.

delay = Delay({ time:1/6, feedback:.75 })

// Next we'll make a synth. Every synth
// in Gibber has an effects chain that
// we can add effects to.

syn = Synth( 'bleep' )
syn.fx.add( delay )
syn.note(0)

// when we add an effect to the effect
// chain, Gibber assigns the synth to
// the input property of the effect, and
// then connects the effect to the main
// output. We could also manually do this:

syn  = Synth('bleep')
verb = Freeverb({ input:syn }).connect()
syn.note(0)

// ... but the fx chain is perhaps more
// convenient and makes it easy to chain
// multiple fx:

syn = Synth()
  .fx.add(
    Distortion('earshred'),
    Delay({ time:1/8, feedback:.8 }),
    Freeverb()
  )

syn.note(0)

// creating this chain manually would be
// tedious, as you'd have to set the input
// of each effect to be the output of the
// previous effect. The fx chain saves 
// you from having to worry about this.

// However, in some instances you will 
// probably want to have multiple devices
// connected to the same effect; for the
// audio folks, this would be a "send" effect.
// We can do this using a Bus, or Bus2 for
// stereo fx and inputs:

verb = Bus2().fx.add( Freeverb() )
syn  = Synth('bleep')
syn2 = Synth('bleep')
syn.connect( verb, .5 )
syn2.connect( verb, .5 )

syn.note(0)
syn2.note(0)

// this is particularly common for reverbs,
// where you want to have the dry signal 
// connected to the master bus but also have
// it sent through the reverb fx for processing.

// in addition to having their own fx
// chains, busses also have their own pan
// and gain controls. In effect, they can
// be used to group sounds together and
// fade them in/out or pan them. However,
// most synths connect to the master bus
// in Gibber by default; for this type of
// grouping to work you first have to
// disconnect them.

bus   = Bus2().connect()
drums = Drums().disconnect()
drums.connect( bus )
bass  = Monosynth('bass').disconnect()
bass.connect( bus )
drums.tidal( 'kd [ch kd] [kd sd] <sd ch*3>' )
bass.note.seq( [0,7], 1/4 )
bus.gain.fade( 0, 1, 8 )

// add an effect to the bus
bus.fx.add( BitCrusher({ sampleRate:.5, bitDepth:.5}) )

// sequence the effect
bus.fx[0].sampleRate.seq( [.25,.35,.5], 1/2 )
