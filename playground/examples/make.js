/* __--__--__--__--__--__--__--____

making synths 

It will be helpful if you've gone
through the arpeggio tutorial and
know a bit about genish to understand
this tutorial. All synths in Gibber
are made using genish, which is in
turn wrapped by Gibberish... however,
for this tutorial we'll skip using
Gibberish so we can focus on one
library at a time. We'll make
a sine oscillator with vibrato,
where we can sequence frequency,
modulation frequency, and modulation
depth.
    
** __--__--__--__--__--__--__--__*/

// The process basically consists of:
// 1. Make a definition of a synth. 
//    This definition includes a name,
//    and an an audio graph.
// 2. Use this definition to make a
//    constructor.
// 3. Create instances using the 
//    constructor

// Let's start with our definition,
// and keep it simple with a straight
// sine oscillator at first.

def = {
  name:'Sine',
  type:'Ugen',
  constructor: function() {
    // get a shorthand to genish
    const gen = Gibberish.genish
    
    // create our audio graph. The cycle()
    // function creates an oscillator reading
    // a wavetable of a single cycle of a sine
    // tone.
    const graph = gen.cycle( 220 )
    
    return graph
  }
}

// get our constructor by passing our definition
// to Make()

MySine = Make( def )

// create and connect an instance of MySine
// warning: this will be loud!
ms = MySine()
ms.connect()

// OK, we have a sinewave. However, we currently
// have no control over its frequency or its loudness.
// If we add property definitions in conjunction with
// using the gen.in() function, we can create sequencable
// properties for interactive control. We'll define 
// properties for frequency and gain, and give them 
// default values.

def2 = {
  name:'Sine',
  type:'Ugen',
  properties: { frequency:220, gain:.25 },
  constructor: function() {
    // get a shorthand to genish
    const g = Gibberish.genish
    
    // we use g.in( 'propertyName' ) to refer to
    // properties. The properties won't exist unless
    // a corresponding g.in() is found in the graph.
    // we'll multiply the output of our oscillator
    // by the gain property to scale its loudness.
    const graph = g.mul(
      g.cycle( g.in( 'frequency' ) ),
      g.in( 'gain' )
    )
    
    return graph
  }
}
 
MySine2 = Make( def2 )

ms2 = MySine2()
ms2.connect()

// now we can change frequency and gain
ms2.frequency = 330
ms2.gain = .05

// ... and we can sequence them
ms2.frequency.seq( [110,220,330,440], 1/4 )

// OK, last but not least, a slightly more complex
// synth with vibrato controls. No new concepts here,
// just more properties and a longer audio graph.

VibratoSine = Make({
  name:'Mysine',
  type:'Ugen',
  properties:{ frequency:220, modFrequency:4, modDepth:10, gain:.15},
  constructor: function() {
    const g = Gibberish.genish
    const graph = g.mul(
      g.cycle( 
        g.add( 
          g.in('frequency'),
          g.mul(
            g.cycle( g.in('modFrequency') ),
            g.in( 'modDepth' )
          )
        )
      ),
      g.in( 'gain' )
    )
    return graph
  }
})
 
sine = VibratoSine().connect()
sine.frequency.seq( [110,220,330], 1/8 )
// we can also fade these properties...
// here we go from 0 to .2 over 8 measures.
sine.gain.fade( 0, .2, 8 )

sine.modDepth = 40
sine.modFrequency = 8

// more to come! but take a trip
// to the genish playground if you're interested
// continuing immediately.
// http://charlie-roberts.com/genish
