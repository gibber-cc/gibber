const Gibberish = require( 'gibberish-dsp' )
const Ugen      = require( './ugen.js' )

const Effects = {
  create( Audio ) {
    const effects = {}
    Gibberish.effects = Gibberish.fx
    for( let effectName in Gibberish.effects ) {
      const gibberishConstructor = Gibberish.effects[ effectName ]

      const methods = Effects.descriptions[ effectName ] === undefined ? null : Effects.descriptions[ effectName ].methods
      const description = { 
        properties:gibberishConstructor.defaults || {}, 
        methods:methods
      }
      description.properties.type = 'fx'

      effects[ effectName ] = Ugen( gibberishConstructor, description, Audio )      
    }
    return effects
  },

  descriptions: {
    //Chorus:{ methods:[] },
  },
  
}

module.exports = Effects
