const Gibberish = require( 'gibberish-dsp' )
const Ugen      = require( './ugen.js' )

const Oscillators = {
  create( Audio ) {
    const oscillators = {}
    const defaults = {
      frequency:220, gain:.25, pulsewidth:.5
    }
    for( let oscillatorName in Gibberish.oscillators ) {
      const gibberishConstructor = Gibberish.oscillators[ oscillatorName ]

      //const methods = Oscillators.descriptions[ oscillatorName ] === undefined ? null : Oscillators.descriptions[ oscillatorName ].methods
      const description = { 
        properties:defaults, 
        methods:[],
        name:oscillatorName,
        category:'oscillators'
      }

      oscillators[ oscillatorName ] = Ugen( gibberishConstructor, description, Audio )

    }
    return oscillators
  },

  descriptions: {},
  
}

module.exports = Oscillators
