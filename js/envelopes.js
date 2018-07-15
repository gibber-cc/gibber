const Gibberish = require( 'gibberish-dsp' )
const Ugen      = require( './ugen.js' )

const Envelopes = {
  create( Audio ) {
    const envelopes = {}

    for( let envelopeName in Gibberish.envelopes ) {
      const gibberishConstructor = Gibberish.envelopes[ envelopeName ]

      const methods = Envelopes.descriptions[ envelopeName ] === undefined ? null : Envelopes.descriptions[ envelopeName ].methods
      const description = { 
        properties:gibberishConstructor.defaults || {}, 
        methods:methods,
        name:envelopeName,
        category:'envelopes'
      }
      description.properties.type = 'envelope'

      envelopes[ envelopeName ] = Ugen( gibberishConstructor, description, Audio )
    }
    return envelopes
  },

  descriptions: {
    //Chorus:{ methods:[] },
  },
  
}

module.exports = Envelopes
