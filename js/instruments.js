const Gibberish = require( 'gibberish-dsp' )
const Ugen      = require( './ugen.js' )

const Instruments = {
  create( Audio ) {
    const instruments = {}
    const pooledInstruments = ['Synth','Monosynth','FM']
    for( let instrumentName in Gibberish.instruments ) {
      const gibberishConstructor = Gibberish.instruments[ instrumentName ]
      if( typeof gibberishConstructor.defaults === 'object' ) gibberishConstructor.defaults.octave = 0

      const methods = Instruments.descriptions[ instrumentName ] === undefined ? null : Instruments.descriptions[ instrumentName ].methods
      const description = { 
        properties:gibberishConstructor.defaults, 
        methods:methods,
        name:instrumentName,
        category:'instruments'
      }

      const shouldPool = pooledInstruments.indexOf( instrumentName ) > -1
      instruments[ instrumentName ] = Ugen( gibberishConstructor, description, Audio, shouldPool )

    }
    return instruments
  },

  descriptions: {
    
    Conga:{
      methods:[ 'note','trigger' ],
    },
    Cowbell:{
      methods:[ 'note','trigger' ],
    },
    FM:{
      methods:[ 'note','trigger' ],
    },
    Hat:{
      methods:[ 'note','trigger' ],
    },
    Karplus:{
      methods:[ 'note','trigger' ],
    },
    Kick:{
      methods:[ 'note','trigger' ],
    },
    Monosynth:{
      methods:[ 'note','trigger' ],
    },
    Sampler:{
      methods:[ 'note','trigger', 'loadFile', 'loadBuffer' ],
    },
    Snare:{
      methods:[ 'note','trigger' ],
    },
    Synth:{
      methods:[ 'note','trigger' ],
    },
    Tom:{
      methods:[ 'note','trigger' ],
    },
    PolySynth:{
      methods:[ 'chord','note','trigger' ],
    },
    PolyFM:{
      methods:[ 'chord','note','trigger' ],
    },
    PolyKarplus:{
      methods:[ 'chord','note','trigger' ],
    },
    PolyMono:{
      methods:[ 'chord','note','trigger' ],
    },

  },
  
}

module.exports = Instruments
