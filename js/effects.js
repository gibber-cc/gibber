const Gibberish = require( 'gibberish-dsp' )
const Ugen      = require( './ugen.js' )

const Effects = {
  create() {
    const effects = {}
    Gibberish.effects = Gibberish.fx
    for( let effectName in Gibberish.effects ) {
      const gibberishConstructor = Gibberish.effects[ effectName ]

      const methods = Effects.descriptions[ effectName ] === undefined ? null : Effects.descriptions[ effectName ].methods
      const description = { 
        properties:gibberishConstructor.defaults, 
        methods:methods
      }

      effects[ effectName ] = Ugen( gibberishConstructor, description )      
    }
    return effects
  },

  descriptions: {
    //Chorus:{ methods:[] },
    
    //Conga:{
    //  methods:[ 'note','trigger' ],
    //},

  },
  
}

module.exports = Effects
